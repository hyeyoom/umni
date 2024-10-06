// Lexer.ts
import {
    AssignToken,
    CommaToken,
    EOFToken,
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
} from './tokens';

export class Lexer {
    private position = 0;
    private tokens: Token[] = [];

    constructor(private input: string) {
    }

    tokenize(): Token[] {
        while (this.position < this.input.length) {
            const currentChar = this.input[this.position];

            if (/\s/.test(currentChar)) {
                this.position++;
            } else if (/\d/.test(currentChar)) {
                this.tokenizeNumber();
            } else if (/[가-힣a-zA-Z]/.test(currentChar)) {
                this.tokenizeIdentifierOrUnit();
            } else if (currentChar === '"' || currentChar === "'") {
                this.tokenizeStringLiteral(currentChar);
            } else {
                this.tokenizeOperatorOrPunctuation();
            }
        }

        this.tokens.push(new EOFToken());
        return this.tokens;
    }

    private tokenizeNumber() {
        const start = this.position;
        let dotCount = 0;

        while (
            this.position < this.input.length &&
            (/\d/.test(this.input[this.position]) || this.input[this.position] === '.')
            ) {
            if (this.input[this.position] === '.') {
                dotCount++;
            }
            this.position++;
        }

        if (dotCount > 1) {
            throw new Error('Invalid number format: too many dots');
        }

        const numberText = this.input.substring(start, this.position);
        this.skipWhitespace();

        let unitText: string | null = null;
        if (this.position < this.input.length && /[a-zA-Z]/.test(this.input[this.position])) {
            const unitStart = this.position;
            while (this.position < this.input.length && /[a-zA-Z]/.test(this.input[this.position])) {
                this.position++;
            }
            unitText = this.input.substring(unitStart, this.position);
        }

        const numberValue = parseFloat(numberText);
        if (isNaN(numberValue)) {
            throw new Error(`Invalid number format: ${numberText}`);
        }

        this.addUnitOrOperator(numberValue, unitText, dotCount);
    }

    private addNumberToken(numberValue: number, dotCount: number): Token {
        if (dotCount === 0) {
            return new NaturalToken(Math.trunc(numberValue));
        } else {
            return new RealToken(numberValue);
        }
    }

    private addUnitOrOperator(numberValue: number, unitText: string | null, dotCount: number) {
        if (unitText !== null) {
            if (UnitToken.SUPPORT_UNITS.has(unitText)) {
                this.tokens.push(new WithUnitToken(numberValue, unitText));
            } else {
                this.tokens.push(this.addNumberToken(numberValue, dotCount));
                const symbolKey = unitText.toUpperCase() as keyof typeof SemanticOperatorSymbol;
                const symbol = SemanticOperatorSymbol[symbolKey];
                if (symbol) {
                    this.tokens.push(new SemanticOperatorToken(symbol));
                } else {
                    throw new Error(`Unsupported unit: ${unitText}`);
                }
            }
        } else {
            this.tokens.push(this.addNumberToken(numberValue, dotCount));
        }
    }

    private skipWhitespace() {
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }
    }

    private tokenizeIdentifierOrUnit() {
        const start = this.position;
        while (this.position < this.input.length && this.isIdentifierCharacter(this.input[this.position])) {
            this.position++;
        }
        const text = this.input.substring(start, this.position);

        switch (text) {
            case 'to':
                this.tokens.push(new SemanticOperatorToken(SemanticOperatorSymbol.TO));
                break;
            case 'times':
                this.tokens.push(new SemanticOperatorToken(SemanticOperatorSymbol.TIMES));
                break;
            case 'fn':
                this.tokens.push(new FunctionDeclarationToken());
                break;
            default:
                if (UnitToken.SUPPORT_UNITS.has(text)) {
                    this.tokens.push(new UnitToken(text));
                } else {
                    this.tokens.push(new IdentifierToken(text));
                }
        }
    }

    private isIdentifierCharacter(char: string): boolean {
        return /[a-zA-Z0-9_가-힣]/.test(char);
    }

    private tokenizeStringLiteral(delimiter: string) {
        this.position++; // Skip the opening quote
        const start = this.position;

        while (this.position < this.input.length && this.input[this.position] !== delimiter) {
            this.position++;
        }

        if (this.position >= this.input.length) {
            throw new Error('Unterminated string literal');
        }

        const value = this.input.substring(start, this.position);
        this.position++; // Skip the closing quote
        this.tokens.push(new StringLiteralToken(value));
    }

    private tokenizeOperatorOrPunctuation() {
        const currentChar = this.input[this.position];

        if (currentChar === '=') {
            if (this.input[this.position + 1] === '=') {
                this.tokens.push(new SymbolicOperatorToken('=='));
                this.position += 2;
            } else {
                this.tokens.push(new AssignToken());
                this.position++;
            }
        } else if (currentChar === '(') {
            this.tokens.push(new LeftParenToken());
            this.position++;
        } else if (currentChar === ')') {
            this.tokens.push(new RightParenToken());
            this.position++;
        } else if (currentChar === ',') {
            this.tokens.push(new CommaToken());
            this.position++;
        } else if ('><!'.includes(currentChar)) {
            if (this.input[this.position + 1] === '=') {
                this.tokens.push(new SymbolicOperatorToken(currentChar + '='));
                this.position += 2;
            } else {
                this.tokens.push(new SymbolicOperatorToken(currentChar));
                this.position++;
            }
        } else if ('+-*/'.includes(currentChar)) {
            this.tokens.push(new SymbolicOperatorToken(currentChar));
            this.position++;
        } else {
            throw new Error(`Unknown character: ${currentChar}`);
        }
    }
}
