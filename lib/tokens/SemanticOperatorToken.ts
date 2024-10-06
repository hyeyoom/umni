// SemanticOperatorToken.ts
import { OperatorToken } from './OperatorToken';
import { SemanticOperatorSymbol } from './SemanticOperatorSymbol';

export class SemanticOperatorToken extends OperatorToken {
    constructor(public symbol: SemanticOperatorSymbol) {
        super();
    }
}
