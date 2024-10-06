// IdentifierToken.ts
import { Token } from './Token';
import { keywords } from '../Keywords';

export class IdentifierToken extends Token {
    constructor(public name: string) {
        super();
        if (keywords.has(name)) {
            throw new Error('Unable to use keyword.');
        }
    }
}
