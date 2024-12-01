'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import '../globals.css';

const SPEC = `# iNum 언어 명세서

## 소개
Umni는 수학적 계산과 단위 변환을 쉽게 할 수 있도록 설계된 표현식 중심의 인터프리터 언어입니다.

## 기본 문법

### 1. 데이터 타입
- **정수** (Natural): \`42\`, \`-17\`
- **실수** (Real): \`3.14\`, \`-0.001\`
- **문자열** (String): \`"Hello"\`, \`'World'\`
- **논리값** (Logical): \`true\`, \`false\`
- **단위값** (WithUnit): \`5km\`, \`3.14m\`, \`1024kb\`

### 2. 변수
\`\`\`
x = 42
name = "iNum"
distance = 5km
\`\`\`

### 3. 산술 연산
- 덧셈: \`+\`
- 뺄셈: \`-\`
- 곱셈: \`*\`
- 나눗셈: \`/\`

### 4. 비교 연산
- 같음: \`==\`
- 다름: \`!=\`
- 크다: \`>\`
- 크거나 같다: \`>=\`
- 작다: \`<\`
- 작거나 같다: \`<=\`

### 5. 삼항 연산
\`\`\`
x > 10 ? "크다" : "작다"
score >= 80 ? "합격" : score >= 60 ? "재시험" : "불합격"
\`\`\`

### 6. 함수 정의와 호출
\`\`\`
fn double(x) = x * 2
fn 원의넓이(r) = pi * r * r
fn 세금계산(금액) = 금액 > 1000000 ? 금액 * 0.4 : 금액 * 0.2
\`\`\`

### 7. 단위 변환
\`\`\`
5km to m        // 5000
1gb to mb       // 1024
(2km + 3km) to m // 5000
\`\`\`

### 8. 내장 함수
- \`b64Encode(str)\`: 문자열을 Base64로 인코딩
- \`b64Decode(str)\`: Base64 문자열을 디코딩
- \`type(value)\`: 값의 타입을 반환
- \`sin(x)\`: 사인 함수
- \`cos(x)\`: 코사인 함수

### 9. 상수
- \`pi\`: 원주율 (3.141592...)
- \`e\`: 자연상수 (2.718281...)
`;

export default function SpecPage() {
    return (
        <div className="spec-container">
            <nav className="spec-nav">
                <Link href="/" className="back-button">
                    ← 홈으로
                </Link>
                <Link href="/run" className="try-button">
                    직접 해보기 →
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
