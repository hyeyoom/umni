'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Environment } from '@/lib/Environment';
import { Interpreter } from '@/lib/Interpreter';
import { Lexer } from '@/lib/Lexer';
import { Parser } from '@/lib/Parser';
import FloatingButton from '../components/FloatingButton';
import AutoComplete from '../components/AutoComplete';
import { Suggestion } from '../types/suggestion';
import '../globals.css';

const STORAGE_KEY = 'umni-v2-code';

const STATIC_SUGGESTIONS: Suggestion[] = [
    {text: 'fn', type: 'keyword', description: '함수 선언'},
    {text: 'to', type: 'keyword', description: '단위 변환'},
    {text: 'times', type: 'keyword', description: '반복'},
    {text: 'km', type: 'unit', description: '킬로미터'},
    {text: 'm', type: 'unit', description: '미터'},
    {text: 'cm', type: 'unit', description: '센티미터'},
    {text: 'mm', type: 'unit', description: '밀리미터'},
    {text: 'kb', type: 'unit', description: '킬로바이트'},
    {text: 'mb', type: 'unit', description: '메가바이트'},
    {text: 'gb', type: 'unit', description: '기가바이트'},
];

export default function UmniRunV2() {
    const [code, setCode] = useState<string>('');
    const [results, setResults] = useState<{line: number; result: string}[]>([]);

    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
    const [autoCompletePosition, setAutoCompletePosition] = useState({ top: 0, left: 0 });
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

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

    useEffect(() => {
        const lines = code.split('\n');
        const newResults = lines.map((line, index) => {
            if (!line.trim()) return { line: index, result: '' };

            try {
                const lexer = new Lexer(line);
                const tokens = lexer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();
                const result = interpreterRef.current.interpret(ast);
                return { line: index, result: String(result) };
            } catch (e) {
                return { line: index, result: '' };
            }
        });

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

    const handleReset = () => {
        setCode('');
        setResults([]);
        localStorage.removeItem(STORAGE_KEY);
        environmentRef.current = new Environment();
        interpreterRef.current = new Interpreter(environmentRef.current);
        editorRef.current?.focus();
    };

    // 현재 커서 위치의 단어 추출
    const getCurrentWord = () => {
        if (!editorRef.current) return '';

        const cursorPosition = editorRef.current.selectionStart;
        const text = editorRef.current.value;
        const textBeforeCursor = text.slice(0, cursorPosition);

        // 숫자 뒤에 오는 단어도 감지하도록 정규식 수정
        const match = textBeforeCursor.match(/[a-zA-Z0-9_가-힣]+$/);
        return match ? match[0] : '';
    };

    // 현재 환경의 변수와 함수를 포함한 전체 제안 목록 생성
    const getAllSuggestions = (): Suggestion[] => {
        const suggestions = [...STATIC_SUGGESTIONS];

        // 변수 추가
        environmentRef.current.variables.forEach((value, name) => {
            suggestions.push({
                text: name,
                type: 'variable',
                description: `사용자 정의 변수 (${value.toString()})`
            });
        });

        // 사용자 정의 함수 추가
        environmentRef.current.functions.forEach((func, name) => {
            const params = func.parameters.join(', ');
            suggestions.push({
                text: name,
                type: 'function',
                description: `함수 (${params})`
            });
        });

        // 내장 함수 추가
        environmentRef.current.builtInFunctions.forEach((_, name) => {
            suggestions.push({
                text: name,
                type: 'function',
                description: '내장 함수'
            });
        });

        return suggestions;
    };

    // 입력 처리 및 자동완성 필터링
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);

        const currentWord = getCurrentWord();

        if (currentWord.length > 0) {
            let filtered;
            if (/^\d+$/.test(currentWord)) {
                filtered = getAllSuggestions().filter(s => s.type === 'unit');
            } else if (/^\d+[a-zA-Z]+$/.test(currentWord)) {
                const unitPart = currentWord.match(/[a-zA-Z]+$/)?.[0] || '';
                filtered = getAllSuggestions().filter(s =>
                    s.type === 'unit' && s.text.toLowerCase().startsWith(unitPart.toLowerCase())
                );
            } else {
                filtered = getAllSuggestions().filter(s =>
                    s.text.toLowerCase().startsWith(currentWord.toLowerCase())
                );
            }

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

    // 자동완성 위치 업데이트
    const updateAutoCompletePosition = (target: HTMLTextAreaElement) => {
        const rect = target.getBoundingClientRect();
        const currentWord = getCurrentWord();
        const text = target.value;
        const cursorPosition = target.selectionStart || 0;
        const textBeforeCursor = text.slice(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        const currentLineNumber = lines.length - 1;
        const currentLine = lines[currentLineNumber];
        
        const lineHeight = 1.5 * 2.4 * 16; // fontSize * lineHeight * 16(rem to px)
        const charWidth = 14.4; // fontSize * 0.6 * 16(rem to px)
        
        // 스크롤 위치를 고려한 위치 계산
        const top = rect.top + (currentLineNumber * lineHeight) + lineHeight - target.scrollTop;
        const left = rect.left + (currentLine.length - currentWord.length) * charWidth;

        setAutoCompletePosition({
            top: top + window.scrollY, // 페이지 스크롤 위치 추가
            left: left
        });
    };

    // 자동완성 선택 처리
    const handleSuggestionSelect = (suggestion: Suggestion) => {
        if (!editorRef.current) return;
        
        const cursorPos = editorRef.current.selectionStart;
        const text = editorRef.current.value;
        const currentWord = getCurrentWord();
        
        // 숫자 다음에 단위가 오는 경우를 처리
        const beforeCursor = text.slice(0, cursorPos);
        const afterCursor = text.slice(cursorPos);
        let newText;

        if (/^\d+$/.test(currentWord)) {
            // 숫자만 있는 경우, 숫자를 유지하고 단위를 추가
            newText = beforeCursor + suggestion.text + afterCursor;
        } else if (/^\d+[a-zA-Z]+$/.test(currentWord)) {
            // 숫자+단위가 있는 경우, 숫자는 유지하고 단위만 교체
            const numberPart = currentWord.match(/^\d+/)?.[0] || '';
            const wordStart = cursorPos - currentWord.length;
            newText = text.slice(0, wordStart) + numberPart + suggestion.text + afterCursor;
        } else {
            // 일반적인 경우
            const wordStart = cursorPos - currentWord.length;
            newText = text.slice(0, wordStart) + suggestion.text + afterCursor;
        }
        
        setCode(newText);
        setAutoCompleteVisible(false);
        editorRef.current.focus();
    };

    // 키보드 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!autoCompleteVisible) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredSuggestions[selectedIndex]) {
                    handleSuggestionSelect(filteredSuggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setAutoCompleteVisible(false);
                break;
        }
    };

    // 스크롤 이벤트 핸들러 추가
    useEffect(() => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const handleScroll = () => {
            if (autoCompleteVisible) {
                updateAutoCompletePosition(textarea);
            }
        };

        textarea.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            textarea.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [autoCompleteVisible]);

    return (
        <div className="editor-container">
            <div className="editor-wrapper">
                <textarea
                    ref={editorRef}
                    className="code-editor"
                    value={code}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setTimeout(() => setAutoCompleteVisible(false), 200);
                    }}
                    placeholder="계산식을 입력하세요..."
                    spellCheck={false}
                />
                <div className="results-overlay">
                    <div className="results-content">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="result-line"
                                onClick={() => {
                                    if (result.result) {
                                        navigator.clipboard.writeText(result.result);
                                    }
                                }}
                            >
                                {result.result}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <FloatingButton onClick={handleReset} />
            <AutoComplete
                suggestions={filteredSuggestions}
                onSelect={handleSuggestionSelect}
                position={autoCompletePosition}
                visible={autoCompleteVisible}
                selectedIndex={selectedIndex}
            />
        </div>
    );
}
