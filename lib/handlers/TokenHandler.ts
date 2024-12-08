import {
    AssignToken,
    CommaToken,
    FunctionDeclarationToken,
    IdentifierToken,
    LeftParenToken,
    NaturalToken,
    RealToken,
    RightParenToken,
    SemanticOperatorSymbol,
    SemanticOperatorToken,
    StringLiteralToken,
    SymbolicOperatorToken,
    Token,
    UnitToken,
    WithUnitToken
} from '@/lib/tokens';

export class TokenHandler {
    handleNumber(input: string, position: { value: number }): Token {
        const start = position.value;
        let hasDot = false;
        let hasDigit = false;
        let lastWasUnderscore = false;

        // 첫 문자가 언더스코어인 경우 에러
        if (input[position.value] === '_') {
            throw new Error('Invalid number format');
        }

        while (position.value < input.length) {
            const char = input[position.value];

            if (char === '.') {
                if (hasDot || lastWasUnderscore) {
                    throw new Error('Invalid number format');
                }
                hasDot = true;
                lastWasUnderscore = false;
            } else if (char === '_') {
                if (lastWasUnderscore || !hasDigit) {
                    throw new Error('Invalid number format');
                }
                lastWasUnderscore = true;
            } else if (/[0-9]/.test(char)) {
                hasDigit = true;
                lastWasUnderscore = false;
            } else {
                break;
            }
            position.value++;
        }

        const numberStr = input.substring(start, position.value).replace(/_/g, '');
        const value = Number(numberStr);

        // 단위 확인 부분
        if (position.value < input.length && !/\s/.test(input[position.value])) {
            const unitStart = position.value;
            while (position.value < input.length && /[a-zA-Z]/.test(input[position.value])) {
                position.value++;
            }

            if (position.value > unitStart) {
                const unit = input.substring(unitStart, position.value);
                if (WithUnitToken.SUPPORT_UNITS.has(unit)) {
                    return new WithUnitToken(value, unit);
                }
                throw new Error('Unsupported unit');
            }
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

        // 첫 문자는 알파벳이나 언더스코어여야 함
        if (!/[a-zA-Z_가-힣]/.test(input[start])) {
            throw new Error('Invalid identifier format');
        }

        // 나머지 문자는 알파벳, 숫자, 언더스코어 허용
        while (position.value < input.length && /[a-zA-Z0-9_가-힣]/.test(input[position.value])) {
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
                // 단위 처리
                if (WithUnitToken.SUPPORT_UNITS.has(identifier)) {
                    return new UnitToken(identifier);
                }
                return new IdentifierToken(identifier);
        }
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
