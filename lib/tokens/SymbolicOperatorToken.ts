// SymbolicOperatorToken.ts
import { OperatorToken } from './OperatorToken';

export class SymbolicOperatorToken extends OperatorToken {
    constructor(public symbol: string) {
        super();
    }
}
