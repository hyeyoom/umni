"use client";

import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {Environment} from "@/lib/Environment";
import {Interpreter} from "@/lib/Interpreter";
import {Lexer} from "@/lib/Lexer";
import {Parser} from "@/lib/Parser";
import './globals.css'

const TYPING_CONFIG = {
    CHAR_DELAY: 10,
    LINE_DELAY: 500,
    SET_DELAY: 2000,
    FADE_DURATION: 300
};

const DEMO_EXPRESSIONS = [
    [
        {expression: "fn 원의넓이(r) = pi * r * r"},
        {expression: "r = 3"},
        {expression: "원의넓이(3)"},
    ],
    [
        {expression: "origin = 'Hello iNum'"},
        {expression: "enc = b64Encode(origin)"},
        {expression: "dec = b64Decode(enc)"},
        {expression: "type(origin)"},
    ],
    [
        {expression: "x = 5km"},
        {expression: "y = 3km"},
        {expression: "x + y to m"}
    ],
    [
        {expression: "width = 1920"},
        {expression: "height = 1080"},
        {expression: "ratio = width / height"},
        {expression: "width = ratio * height"},
    ],
    [
        {expression: "fn 경계값(x) = x > 10 ? '초과' : '미만'"},
        {expression: "경계값(10)"},
        {expression: "경계값(11)"},
    ]
];

export default function Home() {
    const [displayLines, setDisplayLines] = useState<{ expression: string; result: string }[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const demoSetIndexRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const processLine = async (expression: string): Promise<string> => {
            try {
                const lexer = new Lexer(expression);
                const tokens = lexer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();
                return interpreterRef.current.interpret(ast).toString();
            } catch (error) {
                console.error(error);
                return 'Error';
            }
        };

        const typeCharacter = () => {
            const currentSet = DEMO_EXPRESSIONS[demoSetIndexRef.current];
            const currentExpression = currentSet[currentLine];

            if (!currentExpression) return;

            let lastTimestamp = 0;
            let currentCursorPos = 0;

            const animate = (timestamp: number) => {
                if (!lastTimestamp) lastTimestamp = timestamp;
                const elapsed = timestamp - lastTimestamp;

                if (elapsed >= TYPING_CONFIG.CHAR_DELAY) {
                    if (currentCursorPos < currentExpression.expression.length) {
                        setDisplayLines(prev => {
                            const newLines = [...prev];
                            if (!newLines[currentLine]) {
                                newLines[currentLine] = {expression: "", result: ""};
                            }
                            newLines[currentLine].expression =
                                currentExpression.expression.substring(0, currentCursorPos + 1);
                            return newLines;
                        });
                        currentCursorPos++;
                        lastTimestamp = timestamp;
                    } else {
                        // 타이핑 완료
                        processLine(currentExpression.expression).then(result => {
                            setDisplayLines(prev => {
                                const newLines = [...prev];
                                newLines[currentLine].result = result;
                                return newLines;
                            });

                            if (currentLine < currentSet.length - 1) {
                                setTimeout(() => {
                                    setCurrentLine(prev => prev + 1);
                                    typeCharacter();
                                }, TYPING_CONFIG.LINE_DELAY);
                            } else {
                                nextSet();
                            }
                        });
                        return;
                    }
                }
                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        const nextSet = () => {
            setTimeout(() => {
                setIsFading(true);
                setTimeout(() => {
                    setDisplayLines([]);
                    setCurrentLine(0);
                    setIsFading(false);
                    demoSetIndexRef.current = (demoSetIndexRef.current + 1) % DEMO_EXPRESSIONS.length;
                    typeCharacter();
                }, TYPING_CONFIG.FADE_DURATION);
            }, TYPING_CONFIG.SET_DELAY);
        };

        timeoutRef.current = setTimeout(typeCharacter, TYPING_CONFIG.LINE_DELAY);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentLine]);

    return (
        <div className="landing-page">
            <section className="hero-section">
                <h1 className="title">U M N I</h1>
                <p className="subtitle">Smartest Programmable Calculator</p>
                <div className="nav-links">
                    <Link href="/run" className="nav-link">시작하기</Link>
                    <Link href="/spec" className="nav-link">문서</Link>
                </div>
            </section>
            <section className="demo-section">
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
                            </div>
                            <span className="result">
                                {line.result}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
