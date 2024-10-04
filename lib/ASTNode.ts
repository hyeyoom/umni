// ASTNode.ts

export abstract class ASTNode {}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ASTNode {
    export abstract class Number extends ASTNode {}

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
        constructor(public value: number, public unit: string) {
            super();
        }
    }

    export class Variable extends ASTNode {
        constructor(public name: string) {
            super();
        }
    }

    export class StringLiteral extends ASTNode {
        constructor(public value: string) {
            super();
        }
    }

    export class UnaryOperation extends ASTNode {
        constructor(public operator: string, public operand: ASTNode) {
            super();
        }
    }

    export class BinaryOperation extends ASTNode {
        constructor(public left: ASTNode, public operator: string, public right: ASTNode) {
            super();
        }
    }

    export class Assignment extends ASTNode {
        constructor(public left: ASTNode, public value: ASTNode) {
            super();
        }
    }

    export class FunctionDeclaration extends ASTNode {
        constructor(public name: string, public parameters: string[], public body: ASTNode) {
            super();
        }
    }

    export class FunctionCall extends ASTNode {
        // Changed 'arguments' to 'args' here
        constructor(public name: string, public args: ASTNode[]) {
            super();
        }
    }

    export class UnitConversion extends ASTNode {
        constructor(public expression: ASTNode, public targetUnit: string) {
            super();
        }
    }
}
