// Lexer.ts
import { TokenHandler } from './handlers/TokenHandler';
import { Token, EOFToken } from './tokens';

export class Lexer {
    private readonly input: string;
    private position: number = 0;
    private tokens: Token[] = [];
    private handler: TokenHandler;

    constructor(input: string) {
        this.input = input;
        this.handler = new TokenHandler();
    }

    tokenize(): Token[] {
        while (this.position < this.input.length) {
            const currentChar = this.input[this.position];
            const pos = { value: this.position };

            if (/\s/.test(currentChar)) {
                this.position++;
            } else if (/\d/.test(currentChar)) {
                this.tokens.push(this.handler.handleNumber(this.input, pos));
                this.position = pos.value;
            } else if (/[가-힣a-zA-Z]/.test(currentChar)) {
                this.tokens.push(this.handler.handleIdentifier(this.input, pos));
                this.position = pos.value;
            } else if (currentChar === '"' || currentChar === "'") {
                this.tokens.push(this.handler.handleString(this.input, pos));
                this.position = pos.value;
            } else if ('+-*/=!><'.includes(currentChar)) {
                this.tokens.push(this.handler.handleOperator(this.input, pos));
                this.position = pos.value;
            } else {
                this.tokens.push(this.handler.handlePunctuation(this.input, pos));
                this.position = pos.value;
            }
        }

        this.tokens.push(new EOFToken());
        return this.tokens;
    }
}
