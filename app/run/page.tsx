'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Environment} from '@/lib/Environment';
import {Interpreter} from '@/lib/Interpreter';
import {EditorArea} from '@/app/components/EditorArea';
import {ResultsOverlay} from '@/app/components/ResultsOverlay';
import {FloatingButtons} from '@/app/components/FloatingButtons';
import AutoComplete from "@/app/components/AutoComplete";
import {Suggestion} from "@/app/types/suggestion";
import '../globals.css';
import {useRouter} from 'next/navigation';
import {executeCode} from '@/app/hooks/useCodeExecution';
import {calculateAutoCompletePosition, getCurrentWord} from '@/app/utils/editor';
import {filterSuggestions, handleSuggestionSelect} from '@/app/utils/autoComplete';
import {handleKeyboardEvent} from '@/app/utils/keyboardHandlers';

const STORAGE_KEY = 'umni-v2-code';

export default function UmniRunV2() {
    const [code, setCode] = useState<string>('');
    const [results, setResults] = useState<{ line: number; result: string }[]>([]);

    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
    const [autoCompletePosition, setAutoCompletePosition] = useState({top: 0, left: 0});
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const router = useRouter();

    // 초기 로드 시 localStorage에서 데이터 가져오기
    useEffect(() => {
        const savedCode = localStorage.getItem(STORAGE_KEY);
        if (savedCode) {
            setCode(savedCode);
        }
    }, []);

    // 코드가 변경될 때마다 localStorage에 저장
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, code);
    }, [code]);

    // 코드 실행 효과
    useEffect(() => {
        const lines = code.split('\n');
        const newResults = lines.map((line, index) => ({
            line: index,
            result: interpreterRef.current ? executeCode(line, interpreterRef.current) : ''
        }));

        setResults(newResults);
    }, [code]);

    // textarea 스크롤 위치를 결과창에 동기화
    useEffect(() => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const handleScroll = () => {
            const resultsOverlay = document.querySelector('.results-overlay');
            if (resultsOverlay) {
                resultsOverlay.scrollTop = textarea.scrollTop;
            }
        };

        textarea.addEventListener('scroll', handleScroll);
        return () => textarea.removeEventListener('scroll', handleScroll);
    }, []);

    const updateAutoCompletePosition = useCallback((target: HTMLTextAreaElement) => {
        const currentWord = getCurrentWord(editorRef.current);
        const position = calculateAutoCompletePosition(target, currentWord);
        setAutoCompletePosition(position);
    }, []);

    // 입력 처리 및 자동완성 필터링
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);

        const currentWord = getCurrentWord(editorRef.current);
        if (currentWord.length > 0) {
            const filtered = filterSuggestions(currentWord, environmentRef.current);
            setFilteredSuggestions(filtered);

            if (filtered.length > 0) {
                updateAutoCompletePosition(e.target);
                setAutoCompleteVisible(true);
                setSelectedIndex(0);
            } else {
                setAutoCompleteVisible(false);
            }
        } else {
            setAutoCompleteVisible(false);
        }
    };

    const onSuggestionSelect = (suggestion: Suggestion) => {
        if (!editorRef.current) return;

        const cursorPos = editorRef.current.selectionStart;
        const currentWord = getCurrentWord(editorRef.current);
        const newText = handleSuggestionSelect(suggestion, code, cursorPos, currentWord);

        setCode(newText);
        setAutoCompleteVisible(false);
        editorRef.current.focus();
    };

    // 키보드 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const handled = handleKeyboardEvent({
            key: e.key,
            filteredSuggestions,
            selectedIndex,
            autoCompleteVisible,
            onSelectIndex: setSelectedIndex,
            onSelectSuggestion: onSuggestionSelect,
            onHideAutoComplete: () => setAutoCompleteVisible(false)
        });

        if (handled) {
            e.preventDefault();
        }
    };

    // 스크롤 이벤트 핸들러 추가
    useEffect(() => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const handleScroll = () => {
            if (autoCompleteVisible && textarea) {
                updateAutoCompletePosition(textarea);
            }
        };

        textarea.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);

        return () => {
            textarea.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [autoCompleteVisible, updateAutoCompletePosition]);

    return (
        <div className="editor-container">
            <div className="editor-wrapper">
                <EditorArea
                    editorRef={editorRef}
                    code={code}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setTimeout(() => setAutoCompleteVisible(false), 200);
                    }}
                />
                <ResultsOverlay results={results}/>
            </div>
            <FloatingButtons
                onClear={() => {
                    setCode('');
                    setResults([]);
                }}
                onHelp={() => router.push('/spec')}
            />
            <AutoComplete
                suggestions={filteredSuggestions}
                onSelect={onSuggestionSelect}
                position={autoCompletePosition}
                visible={autoCompleteVisible}
                selectedIndex={selectedIndex}
            />
        </div>
    );
}
