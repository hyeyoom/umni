// IdentifierToken.ts
import {keywords, Token} from '@/lib';

export class IdentifierToken extends Token {
    constructor(public name: string) {
        super();
        if (keywords.has(name)) {
            throw new Error('Unable to use keyword.');
        }
    }
}
