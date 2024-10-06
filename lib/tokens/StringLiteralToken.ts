// StringLiteralToken.ts
import { Token } from './Token';

export class StringLiteralToken extends Token {
    constructor(public value: string) {
        super();
    }
}
