// app/page.tsx
"use client";

import React, {useEffect, useRef, useState} from "react";
import {Environment} from "@/lib/Environment";
import {Interpreter} from "@/lib/Interpreter";
import {Lexer} from "@/lib/Lexer";
import {Parser} from "@/lib/Parser";
import '../globals.css'
import AutoComplete from '../components/AutoComplete';
import {Suggestion} from '../types/suggestion';

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

export default function UmniRun() {
    const [lines, setLines] = useState<{ expression: string; result: string }[]>([{expression: "", result: ""}]);
    const [isClient, setIsClient] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const [debounceTimeout, setDebounceTimeout] = useState<number | undefined>(undefined);
    const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
    const [autoCompletePosition, setAutoCompletePosition] = useState({top: 0, left: 0});
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [currentWord, setCurrentWord] = useState<string>("");

    useEffect(() => {
        setIsClient(true);
        const savedLines = localStorage.getItem("lines");
        if (savedLines) {
            setLines(JSON.parse(savedLines));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("lines", JSON.stringify(lines));
        }
    }, [lines, isClient]);

    // 현재 환경의 변수와 함수를 포함한 전체 제안 목록 생성
    const getAllSuggestions = (): Suggestion[] => {
        const suggestions = [...STATIC_SUGGESTIONS];

        // 변수 추가
        environmentRef.current.variables.forEach((value, name) => {
            suggestions.push({
                text: name,
                type: 'variable',
                description: `변수 (${value.toString()})`
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

    const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newLines = [...lines];
        const value = e.target.value.replace(/"/g, "\"").replace(/"/g, "\"");
        newLines[index].expression = value;

        // 현재 커서 위치의 단어 추출
        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPosition);

        // 숫자 뒤에 오는 단어도 감지하도록 정규식 수정
        const match = textBeforeCursor.match(/[a-zA-Z0-9_가-힣]+$/);
        const currentWord = match ? match[0] : '';

        // 숫자로 시작하는 경우, 단위 제안만 필터링
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
            setCurrentWord(currentWord);

            if (filtered.length > 0) {
                const rect = e.target.getBoundingClientRect();
                const wordStart = textBeforeCursor.length - currentWord.length;
                const charWidth = 9.6;
                setAutoCompletePosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + wordStart * charWidth
                });
                setAutoCompleteVisible(true);
            } else {
                setAutoCompleteVisible(false);
            }
        } else {
            setAutoCompleteVisible(false);
        }

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        const timeout = window.setTimeout(() => {
            newLines.forEach((line, i) => {
                try {
                    const expr = line.expression;
                    const lexer = new Lexer(expr);
                    const tokens = lexer.tokenize();
                    const parser = new Parser(tokens);
                    const ast = parser.parse();
                    const evaluatedResult = interpreterRef.current.interpret(ast);
                    newLines[i].result = evaluatedResult.toString();
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        // do nothing
                    }
                    newLines[i].result = "";
                }
            });
            setLines(newLines);
        }, 300);

        setDebounceTimeout(timeout);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (autoCompleteVisible) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
                return;
            }
            if (e.key === "Enter" && filteredSuggestions.length > 0) {
                e.preventDefault();
                handleSuggestionSelect(filteredSuggestions[selectedIndex], index);
                return;
            }
        }

        // 자동완성 툴팁을 숨기는 키 이벤트들
        if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
            setAutoCompleteVisible(false);
        }

        // 기존의 Enter 키 처리
        if (e.key === "Enter") {
            e.preventDefault();
            const newLines = [...lines, {expression: "", result: ""}];
            setLines(newLines);

            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleResultClick = (result: string) => {
        navigator.clipboard.writeText(result);
    };

    const handleSuggestionSelect = (suggestion: Suggestion, index: number) => {
        const currentLine = lines[index].expression;
        const cursorPosition = inputRefs.current[index]?.selectionStart || 0;

        // 현재 라인에서 숫자 찾기 (전체 라인에서 검색)
        const numberMatch = currentLine.match(/\d+/);
        if (numberMatch && suggestion.type === 'unit') {
            const numberStartIndex = numberMatch.index || 0;
            const number = numberMatch[0];

            // 숫자를 유지하고 그 뒤에 단위 추가
            const newText = currentLine.slice(0, numberStartIndex) +
                number + suggestion.text +
                currentLine.slice(numberStartIndex + number.length);

            const newLines = [...lines];
            newLines[index].expression = newText;
            setLines(newLines);

            // 커서를 추가된 단위 뒤로 이동
            setTimeout(() => {
                const newPosition = numberStartIndex + number.length + suggestion.text.length;
                inputRefs.current[index]?.setSelectionRange(newPosition, newPosition);
                inputRefs.current[index]?.focus();
            }, 0);
        } else {
            // 숫자가 없거나 단위가 아닌 경우 기존 로직
            const newText = currentLine.slice(0, cursorPosition) +
                suggestion.text +
                currentLine.slice(cursorPosition);

            const newLines = [...lines];
            newLines[index].expression = newText;
            setLines(newLines);

            setTimeout(() => {
                const newPosition = cursorPosition + suggestion.text.length;
                inputRefs.current[index]?.setSelectionRange(newPosition, newPosition);
                inputRefs.current[index]?.focus();
            }, 0);
        }

        setAutoCompleteVisible(false);
    };

    // 입력창이 포커스를 잃었을 때도 툴팁을 숨김
    const handleBlur = () => {
        // 약간의 지연을 줘서 클릭 이벤트가 먼저 발생하도록 함
        setTimeout(() => {
            setAutoCompleteVisible(false);
        }, 200);
    };

    return (
        <div className="container">
            {lines.map((line, index) => (
                <div className="row" key={index}>
                    <input
                        className="input-box"
                        value={line.expression}
                        onChange={(e) => handleInputChange(index, e)}
                        onKeyDown={(e) => handleKeyPress(e, index)}
                        onBlur={handleBlur}
                        autoFocus={index === lines.length - 1}
                        placeholder={"Empty Line"}
                    />
                    <span className="result" onClick={() => handleResultClick(line.result)}>
                        {line.result}
                    </span>
                </div>
            ))}
            <AutoComplete
                suggestions={filteredSuggestions}
                onSelect={(suggestion) => handleSuggestionSelect(suggestion, lines.length - 1)}
                position={autoCompletePosition}
                visible={autoCompleteVisible}
                selectedIndex={selectedIndex}
            />
        </div>
    );
}
