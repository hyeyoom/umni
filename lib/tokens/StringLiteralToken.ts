// StringLiteralToken.ts
import {Token} from '@/lib';

export class StringLiteralToken extends Token {
    constructor(public value: string) {
        super();
    }
}
