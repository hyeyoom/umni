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
    private readonly input: string;
    private position: number = 0;
    private tokens: Token[] = [];

    constructor(input: string) {
        this.input = input;
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char);
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
        let hasDot = false;

        while (this.position < this.input.length) {
            const char = this.input[this.position];
            if (char === '.') {
                if (hasDot) {
                    throw new Error('Invalid number format');
                }
                hasDot = true;
            } else if (!this.isDigit(char)) {
                break;
            }
            this.position++;
        }

        const numberStr = this.input.substring(start, this.position);

        // 단위 확인
        let unit = '';
        while (this.position < this.input.length && this.isIdentifierCharacter(this.input[this.position])) {
            unit += this.input[this.position];
            this.position++;
        }

        if (unit) {
            if (!UnitToken.SUPPORT_UNITS.has(unit)) {
                throw new Error('Unsupported unit');
            }
            this.tokens.push(new WithUnitToken(Number(numberStr), unit));
        } else {
            this.tokens.push(hasDot ? new RealToken(Number(numberStr)) : new NaturalToken(Number(numberStr)));
        }
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

        switch (currentChar) {
            case '?':
            case ':':
                this.tokens.push(new SymbolicOperatorToken(currentChar));
                this.position++;
                break;
            case '=':
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push(new SymbolicOperatorToken('=='));
                    this.position += 2;
                } else {
                    this.tokens.push(new AssignToken());
                    this.position++;
                }
                break;
            case '(':
                this.tokens.push(new LeftParenToken());
                this.position++;
                break;
            case ')':
                this.tokens.push(new RightParenToken());
                this.position++;
                break;
            case ',':
                this.tokens.push(new CommaToken());
                this.position++;
                break;
            case '>':
            case '<':
            case '!':
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push(new SymbolicOperatorToken(currentChar + '='));
                    this.position += 2;
                } else {
                    this.tokens.push(new SymbolicOperatorToken(currentChar));
                    this.position++;
                }
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.tokens.push(new SymbolicOperatorToken(currentChar));
                this.position++;
                break;
            default:
                throw new Error(`Unknown character: ${currentChar}`);
        }
    }
}
