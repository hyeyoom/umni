// Token.ts

import {keywords} from './Keywords';

export abstract class Token {
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Token {
    export abstract class Number extends Token {
    }

    export class Real extends Number {
        constructor(public value: number) {
            super();
        }
    }

    export class Natural extends Number {
        constructor(public value: number) {
            super();
        }
    }

    export class WithUnit extends Number {
        static SUPPORT_UNITS = new Set(['m', 'cm', 'mm', 'km', 'kb', 'mb', 'gb']);

        constructor(public value: number, public unit: string) {
            super();
            if (!WithUnit.SUPPORT_UNITS.has(unit)) {
                throw new Error(`Unsupported unit: ${unit}`);
            }
        }
    }

    export class StringLiteral extends Token {
        constructor(public value: string) {
            super();
        }
    }

    export class Identifier extends Token {
        constructor(public name: string) {
            super();
            if (keywords.has(name)) {
                throw new Error('Unable to use keyword.');
            }
        }
    }

    export abstract class Operator extends Token {
    }

    export class SymbolicOperator extends Operator {
        constructor(public symbol: string) {
            super();
        }
    }

    export class SemanticOperator extends Operator {
        constructor(public symbol: SemanticOperator.Symbol) {
            super();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace SemanticOperator {
        export enum Symbol {
            TO = 'TO',
            TIMES = 'TIMES',
        }
    }

    export class FunctionDeclaration extends Token {
    }

    export class Assign extends Token {
    }

    export class LeftParen extends Token {
    }

    export class RightParen extends Token {
    }

    export class Comma extends Token {
    }

    export class Unit extends Token {
        static SUPPORT_UNITS = new Set(['m', 'cm', 'mm', 'km', 'kb', 'mb', 'gb']);

        constructor(public name: string) {
            super();
            if (!Unit.SUPPORT_UNITS.has(name)) {
                throw new Error(`Unsupported unit: ${name}`);
            }
        }
    }

    export class EOF extends Token {
    }
}
