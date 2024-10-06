// ASTNode.ts
export abstract class ASTNode {}

export class RealNode extends ASTNode {
    constructor(public value: number) {
        super();
    }
}

export class NaturalNode extends ASTNode {
    constructor(public value: number) {
        super();
    }
}

export class WithUnitNode extends ASTNode {
    constructor(public value: number, public unit: string) {
        super();
    }
}

export class VariableNode extends ASTNode {
    constructor(public name: string) {
        super();
    }
}

export class StringLiteralNode extends ASTNode {
    constructor(public value: string) {
        super();
    }
}

export class UnaryOperationNode extends ASTNode {
    constructor(public operator: string, public operand: ASTNode) {
        super();
    }
}

export class BinaryOperationNode extends ASTNode {
    constructor(public left: ASTNode, public operator: string, public right: ASTNode) {
        super();
    }
}

export class AssignmentNode extends ASTNode {
    constructor(public left: ASTNode, public value: ASTNode) {
        super();
    }
}

export class FunctionDeclarationNode extends ASTNode {
    constructor(public name: string, public parameters: string[], public body: ASTNode) {
        super();
    }
}

export class FunctionCallNode extends ASTNode {
    constructor(public name: string, public args: ASTNode[]) {
        super();
    }
}

export class UnitConversionNode extends ASTNode {
    constructor(public expression: ASTNode, public targetUnit: string) {
        super();
    }
}
