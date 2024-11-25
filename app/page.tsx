// app/page.tsx
"use client";

import React, {useRef, useState, useEffect} from "react";
import {Environment} from "@/lib/Environment";
import {Interpreter} from "@/lib/Interpreter";
import {Lexer} from "@/lib/Lexer";
import {Parser} from "@/lib/Parser";
import './globals.css';

export default function Home() {
    const [lines, setLines] = useState<{ expression: string; result: string }[]>([{ expression: "", result: "" }]);
    const [isClient, setIsClient] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const environmentRef = useRef(new Environment());
    const interpreterRef = useRef(new Interpreter(environmentRef.current));
    const [debounceTimeout, setDebounceTimeout] = useState<number | undefined>(undefined);

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

    const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newLines = [...lines];
        newLines[index].expression = e.target.value.replace("“", "\"").replaceAll("”", "\"");

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
        if (e.key === "Enter") {
            e.preventDefault();
            const newLines = [...lines, { expression: "", result: "" }];
            setLines(newLines);

            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleResultClick = (result: string) => {
        navigator.clipboard.writeText(result);
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
                        autoFocus={index === lines.length - 1}
                        placeholder={"Empty Line"}
                    />
                    <span className="result" onClick={() => handleResultClick(line.result)}>
                        {line.result}
                    </span>
                </div>
            ))}
        </div>
    );
}
