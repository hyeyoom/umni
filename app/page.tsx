"use client";

import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {Environment} from "@/lib/Environment";
import {Interpreter} from "@/lib/Interpreter";
import {Lexer} from "@/lib/Lexer";
import {Parser} from "@/lib/Parser";
import './globals.css'

const DEMO_EXPRESSIONS = [
    [
        {expression: "fn 원의넓이(r) = pi * r * r", delay: 50},
        {expression: "r = 3", delay: 50},
        {expression: "원의넓이(3)", delay: 50},
    ],
    [
        {expression: "origin = 'Hello Umni'", delay: 50},
        {expression: "e = b64Encode(origin)", delay: 50},
        {expression: "d = b64Decode(e)", delay: 50},
        {expression: "type(origin)", delay: 50},
    ],
    [
        {expression: "x = 5km", delay: 50},
        {expression: "y = 3km", delay: 50},
        {expression: "x + y to m", delay: 60}
    ],
    [
        {expression: "width = 1920", delay: 50},
        {expression: "height = 1080", delay: 50},
        {expression: "width / 16", delay: 60}
    ]
];

export default function Home() {
    const [displayLines, setDisplayLines] = useState<{ expression: string; result: string }[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const demoSetIndexRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const typeNextCharacter = () => {
            const currentSet = DEMO_EXPRESSIONS[demoSetIndexRef.current];
            const currentExpression = currentSet[currentLine];

            if (!currentExpression) return;

            if (cursorPosition < currentExpression.expression.length) {
                setDisplayLines(prev => {
                    const newLines = [...prev];
                    if (!newLines[currentLine]) {
                        newLines[currentLine] = {expression: "", result: ""};
                    }
                    newLines[currentLine].expression =
                        currentExpression.expression.substring(0, cursorPosition + 1);
                    return newLines;
                });
                setCursorPosition(prev => prev + 1);
                timeoutRef.current = setTimeout(typeNextCharacter, currentExpression.delay);
            } else {
                // 현재 줄의 결과 계산
                try {
                    const lexer = new Lexer(currentExpression.expression);
                    const tokens = lexer.tokenize();
                    const parser = new Parser(tokens);
                    const ast = parser.parse();
                    const result = interpreterRef.current.interpret(ast);
                    setDisplayLines(prev => {
                        const newLines = [...prev];
                        newLines[currentLine].result = result.toString();
                        return newLines;
                    });
                } catch (error) {
                    console.error(error);
                }

                // 다음 줄로 이동 또는 다음 세트로 전환
                if (currentLine < currentSet.length - 1) {
                    setCurrentLine(prev => prev + 1);
                    setCursorPosition(0);
                    timeoutRef.current = setTimeout(typeNextCharacter, 500);
                } else {
                    timeoutRef.current = setTimeout(() => {
                        setIsFading(true);
                        setTimeout(() => {
                            setDisplayLines([]);
                            setCurrentLine(0);
                            setCursorPosition(0);
                            setIsFading(false);
                            demoSetIndexRef.current = (demoSetIndexRef.current + 1) % DEMO_EXPRESSIONS.length;
                            timeoutRef.current = setTimeout(typeNextCharacter, 500);
                        }, 300);
                    }, 2000);
                }
            }
        };

        timeoutRef.current = setTimeout(typeNextCharacter, 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentLine, cursorPosition]);

    return (
        <main className="landing-page">
            <div className="hero-section">
                <h1 className="title">U M N I</h1>
                <p className="subtitle">Smartest Programmable Calculator</p>
            </div>

            <div className="demo-section">
                <div className={`calculator-preview ${isFading ? 'fade-out' : 'fade-in'}`}>
                    {displayLines.map((line, index) => (
                        <div className="row" key={index}>
                            <div className="input-container">
                                <input
                                    className="input-box"
                                    value={line.expression}
                                    readOnly
                                    placeholder="Empty Line"
                                />
                                {index === currentLine && (
                                    <div
                                        className="cursor"
                                        style={{
                                            left: `${cursorPosition * 0.61}em`
                                        }}
                                    />
                                )}
                            </div>
                            <span className="result">
                {line.result}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            <Link href="/run" className="start-button">
                시작하기
            </Link>
        </main>
    );
}
