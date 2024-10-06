// NaturalToken.ts
import { NumberToken } from './NumberToken';

export class NaturalToken extends NumberToken {
    constructor(public value: number) {
        super();
    }
}
