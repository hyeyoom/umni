// Lexer.ts
import {TokenHandler} from './handlers/TokenHandler';
import {EOFToken, NaturalToken, Token, WithUnitToken} from './tokens';

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
                const numberToken = this.handler.handleNumber(this.input, pos);
                this.position = pos.value;

                // 숫자 다음에 공백이 있을 경우, 공백을 무시하고 단위를 확인
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }

                // 공백 후에 단위가 있는지 확인
                if (this.position < this.input.length && /[a-zA-Z]/.test(this.input[this.position])) {
                    const unitStart = this.position;
                    while (this.position < this.input.length && /[a-zA-Z]/.test(this.input[this.position])) {
                        this.position++;
                    }
                    const unit = this.input.substring(unitStart, this.position);
                    if (WithUnitToken.SUPPORT_UNITS.has(unit)) {
                        this.tokens.push(new WithUnitToken((numberToken as NaturalToken).value, unit));
                        continue;
                    } else {
                        // 지원하지 않는 단위면 position을 숫자 끝으로 되돌림
                        this.position = unitStart;
                    }
                }

                this.tokens.push(numberToken);
            } else if (/[가-힣a-zA-Z_]/.test(currentChar)) {
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
