import {
    FunctionDeclarationToken,
    IdentifierToken,
    NaturalToken,
    RealToken,
    SemanticOperatorSymbol,
    SemanticOperatorToken,
    StringLiteralToken,
    Token,
    WithUnitToken,
    SymbolicOperatorToken,
    AssignToken,
    LeftParenToken,
    RightParenToken,
    CommaToken
} from '@/lib/tokens';

export class TokenHandler {
    handleNumber(input: string, position: { value: number }): Token {
        const start = position.value;
        let hasDot = false;

        while (position.value < input.length) {
            const char = input[position.value];
            if (char === '.') {
                if (hasDot) {
                    throw new Error('Invalid number format');
                }
                hasDot = true;
            } else if (!/[0-9]/.test(char)) {
                break;
            }
            position.value++;
        }

        const numberStr = input.substring(start, position.value);
        const value = Number(numberStr);

        const unitStart = position.value;
        while (position.value < input.length && /[a-zA-Z]/.test(input[position.value])) {
            position.value++;
        }

        if (position.value > unitStart) {
            const unit = input.substring(unitStart, position.value);
            return new WithUnitToken(value, unit);
        }

        return hasDot ? new RealToken(value) : new NaturalToken(value);
    }

    handleString(input: string, position: { value: number }): Token {
        const quote = input[position.value];
        if (quote !== '"' && quote !== "'") {
            throw new Error('String must start with quote');
        }

        position.value++; // 시작 따옴표 건너뛰기
        const start = position.value;

        while (position.value < input.length && input[position.value] !== quote) {
            position.value++;
        }

        if (position.value >= input.length) {
            throw new Error('Unterminated string literal');
        }

        const value = input.substring(start, position.value);
        position.value++; // 종료 따옴표 건너뛰기

        return new StringLiteralToken(value);
    }

    handleIdentifier(input: string, position: { value: number }): Token {
        const start = position.value;

        while (position.value < input.length && this.isIdentifierChar(input[position.value])) {
            position.value++;
        }

        const identifier = input.substring(start, position.value);

        // 키워드 처리
        switch (identifier) {
            case 'fn':
                return new FunctionDeclarationToken();
            case 'to':
                return new SemanticOperatorToken(SemanticOperatorSymbol.TO);
            case 'times':
                return new SemanticOperatorToken(SemanticOperatorSymbol.TIMES);
            default:
                return new IdentifierToken(identifier);
        }
    }

    private isIdentifierChar(char: string): boolean {
        return /[a-zA-Z0-9_가-힣]/.test(char);
    }

    handleOperator(input: string, position: { value: number }): Token {
        const char = input[position.value];
        const nextChar = input[position.value + 1];
        
        // 두 문자 연산자 처리
        if (nextChar === '=') {
            switch (char) {
                case '=':
                case '!':
                case '>':
                case '<':
                    position.value += 2;
                    return new SymbolicOperatorToken(char + nextChar);
            }
        }
        
        // 단일 문자 연산자 처리
        position.value++;
        if (char === '=') {
            return new AssignToken();
        }
        
        return new SymbolicOperatorToken(char);
    }

    handlePunctuation(input: string, position: { value: number }): Token {
        const char = input[position.value];
        position.value++;
        
        switch (char) {
            case '(':
                return new LeftParenToken();
            case ')':
                return new RightParenToken();
            case ',':
                return new CommaToken();
            case '?':
            case ':':
                return new SymbolicOperatorToken(char);
            default:
                throw new Error(`Unexpected punctuation: ${char}`);
        }
    }
}
