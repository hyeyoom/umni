'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Environment } from '@/lib/Environment';
import { Interpreter } from '@/lib/Interpreter';
import { Lexer } from '@/lib/Lexer';
import { Parser } from '@/lib/Parser';
import FloatingButton from '../components/FloatingButton';
import '../globals.css';

const STORAGE_KEY = 'umni-v2-code';

export default function UmniRunV2() {
    const [code, setCode] = useState<string>('');
    const [results, setResults] = useState<{line: number; result: string}[]>([]);
    
    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const editorRef = useRef<HTMLTextAreaElement>(null);
    
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

    return (
        <div className="editor-container">
            <div className="editor-wrapper">
                <textarea
                    ref={editorRef}
                    className="code-editor"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
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
        </div>
    );
} 