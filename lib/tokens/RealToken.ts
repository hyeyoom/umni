// RealToken.ts
import { NumberToken } from './NumberToken';

export class RealToken extends NumberToken {
    constructor(public value: number) {
        super();
    }
}
