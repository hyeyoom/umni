'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import '../globals.css';

const SPEC = `# iNum Language Guide

## Introduction
iNum is an expression-based calculator language that makes mathematical calculations and unit conversions easy and intuitive.

## Basic Syntax

### 1. Data Types
- **Integer** (Natural): \`42\`, \`-17\`
- **Float** (Real): \`3.14\`, \`-0.001\`
- **String**: \`"Hello"\`, \`'World'\`
- **Boolean**: \`true\`, \`false\`
- **Unit Value**: \`5km\`, \`3.14m\`, \`1024kb\`

### 2. Variables
\`\`\`
x = 42
name = "iNum"
distance = 5km
\`\`\`

### 3. Arithmetic Operations
- Addition: \`+\`
- Subtraction: \`-\`
- Multiplication: \`*\`
- Division: \`/\`

### 4. Comparison Operations
- Equal: \`==\`
- Not Equal: \`!=\`
- Greater Than: \`>\`
- Greater or Equal: \`>=\`
- Less Than: \`<\`
- Less or Equal: \`<=\`

### 5. Ternary Operations
\`\`\`
x > 10 ? "big" : "small"
score >= 80 ? "pass" : score >= 60 ? "retry" : "fail"
\`\`\`

### 6. Functions
\`\`\`
fn double(x) = x * 2
fn circleArea(r) = pi * r * r
fn calculateTax(amount) = amount > 1000000 ? amount * 0.4 : amount * 0.2
\`\`\`

### 7. Unit Conversions
\`\`\`
5km to m        // 5000
1gb to mb       // 1024
(2km + 3km) to m // 5000
\`\`\`

### 8. Built-in Functions
- \`b64Encode(str)\`: Encode string to Base64
- \`b64Decode(str)\`: Decode Base64 string
- \`type(value)\`: Get type of value
- \`sin(x)\`: Sine function
- \`cos(x)\`: Cosine function

### 9. Constants
- \`pi\`: Pi (3.141592...)
- \`e\`: Euler's number (2.718281...)
`;

export default function SpecPage() {
    return (
        <div className="spec-container">
            <nav className="spec-nav">
                <Link href="/" className="back-button">
                    ← Home
                </Link>
                <Link href="/run" className="try-button">
                    Try It →
                </Link>
            </nav>
            <div className="spec-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({className, children, ...props}) {
                            return (
                                <code className={`${className} highlight`} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {SPEC}
                </ReactMarkdown>
            </div>
        </div>
    );
}
