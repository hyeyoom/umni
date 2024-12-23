// Parser.ts
import {
    AssignToken,
    CommaToken,
    FunctionDeclarationToken,
    IdentifierToken,
    LeftParenToken,
    NaturalToken,
    RealToken,
    RightParenToken,
    SemanticOperatorSymbol,
    SemanticOperatorToken,
    StringLiteralToken,
    SymbolicOperatorToken,
    Token,
    UnitToken,
    WithUnitToken
} from './tokens';
import {
    AssignmentNode,
    ASTNode,
    BinaryOperationNode,
    FunctionCallNode,
    FunctionDeclarationNode,
    NaturalNode,
    RealNode,
    StringLiteralNode,
    TernaryOperationNode,
    UnaryOperationNode,
    UnitConversionNode,
    VariableNode,
    WithUnitNode
} from './ASTNode';

// Define a type for the Token constructor without using 'any'
type TokenConstructor<T extends Token> = new (...args: unknown[]) => T;

export class Parser {
    private position = 0;

    constructor(private tokens: Token[]) {
    }

    parse(): ASTNode {
        return this.parseStatement();
    }

    private parseStatement(): ASTNode {
        if (this.currentToken() instanceof FunctionDeclarationToken) {
            return this.parseFunctionDeclaration();
        } else {
            return this.parseAssignment();
        }
    }

    private parseAssignment(): ASTNode {
        const left = this.parseExpression();
        if (this.match(AssignToken)) {
            const value = this.parseAssignment();
            return new AssignmentNode(left, value);
        } else {
            return left;
        }
    }

    private parseExpression(): ASTNode {
        return this.parseTernary();
    }

    private parseTernary(): ASTNode {
        const condition = this.parseComparison();

        if (this.currentToken() instanceof SymbolicOperatorToken &&
            (this.currentToken() as SymbolicOperatorToken).symbol === '?') {
            this.consume(); // ? 토큰 소비
            const trueExpression = this.parseExpression();

            if (!(this.currentToken() instanceof SymbolicOperatorToken) ||
                (this.currentToken() as SymbolicOperatorToken).symbol !== ':') {
                throw new Error("Expected ':' in ternary operation");
            }

            this.consume(); // : 토큰 소비
            const falseExpression = this.parseExpression();

            return new TernaryOperationNode(condition, trueExpression, falseExpression);
        }

        return condition;
    }

    private parseComparison(): ASTNode {
        let node = this.parseAdditive();

        while (this.currentToken() instanceof SymbolicOperatorToken) {
            const operator = (this.currentToken() as SymbolicOperatorToken).symbol;
            if (!['>', '<', '>=', '<=', '==', '!='].includes(operator)) {
                break;
            }
            this.consume();
            const right = this.parseAdditive();
            node = new BinaryOperationNode(node, operator, right);
        }

        return node;
    }

    private parseAdditive(): ASTNode {
        let node = this.parseMultiplicative();

        while (this.currentToken() instanceof SymbolicOperatorToken) {
            const operator = (this.currentToken() as SymbolicOperatorToken).symbol;
            if (!['+', '-'].includes(operator)) {
                break;
            }
            this.consume();
            const right = this.parseMultiplicative();
            node = new BinaryOperationNode(node, operator, right);
        }

        return node;
    }

    private parseMultiplicative(): ASTNode {
        let node = this.parseToConversion();

        while (this.currentToken() instanceof SymbolicOperatorToken) {
            const operator = (this.currentToken() as SymbolicOperatorToken).symbol;
            if (!['*', '/'].includes(operator)) {
                break;
            }
            this.consume();
            const right = this.parseToConversion();
            node = new BinaryOperationNode(node, operator, right);
        }

        return node;
    }

    private parseToConversion(): ASTNode {
        let node = this.parseUnary();

        while (this.currentToken() instanceof SemanticOperatorToken) {
            const operator = (this.currentToken() as SemanticOperatorToken).symbol;
            if (operator !== SemanticOperatorSymbol.TO) {
                break;
            }
            this.consume();

            if (this.currentToken() instanceof UnitToken) {
                const targetUnitToken = this.currentToken() as UnitToken;
                this.consume();
                node = new UnitConversionNode(node, targetUnitToken.name);
            } else {
                throw new Error(`Expected unit identifier after 'to', but found: ${this.currentToken().constructor.name}`);
            }
        }

        return node;
    }

    private parseUnary(): ASTNode {
        const token = this.currentToken();
        if (token instanceof SymbolicOperatorToken && token.symbol === '-') {
            this.consume();
            const operand = this.parseUnary();
            return new UnaryOperationNode('-', operand);
        } else if (token instanceof SymbolicOperatorToken && token.symbol === '!') {
            this.consume();
            const operand = this.parseUnary();
            return new UnaryOperationNode('!', operand);
        } else {
            return this.parsePrimary();
        }
    }

    private parsePrimary(): ASTNode {
        const token = this.currentToken();
        if (token instanceof RealToken) {
            this.consume();
            return new RealNode(token.value);
        } else if (token instanceof NaturalToken) {
            this.consume();
            return new NaturalNode(token.value);
        } else if (token instanceof WithUnitToken) {
            this.consume();
            return new WithUnitNode(token.value, token.unit);
        } else if (token instanceof StringLiteralToken) {
            this.consume();
            return new StringLiteralNode(token.value);
        } else if (token instanceof IdentifierToken) {
            const nextToken = this.peekToken();
            if (nextToken instanceof LeftParenToken) {
                return this.parseFunctionCall();
            } else {
                this.consume();
                return new VariableNode(token.name);
            }
        } else if (token instanceof LeftParenToken) {
            this.consume();
            const expression = this.parseExpression();
            this.expect(RightParenToken);
            return expression;
        } else {
            throw new Error(`Unexpected token: ${token.constructor.name}`);
        }
    }

    private parseFunctionDeclaration(): FunctionDeclarationNode {
        this.consume(); // Consume 'fn' token
        const nameToken = this.consume();
        if (!(nameToken instanceof IdentifierToken)) {
            throw new Error(`Function declaration expects an identifier for the function name, but found: ${nameToken.constructor.name}`);
        }
        const name = nameToken.name;

        this.expect(LeftParenToken);
        const parameters: string[] = [];
        if (!(this.currentToken() instanceof RightParenToken)) {
            do {
                const paramToken = this.consume();
                if (!(paramToken instanceof IdentifierToken)) {
                    throw new Error(`Function parameters must be identifiers, but found: ${paramToken.constructor.name}`);
                }
                parameters.push(paramToken.name);
            } while (this.match(CommaToken));
        }
        this.expect(RightParenToken);
        this.expect(AssignToken);
        const body = this.parseExpression();
        return new FunctionDeclarationNode(name, parameters, body);
    }

    private parseFunctionCall(): FunctionCallNode {
        const nameToken = this.consume();
        if (!(nameToken instanceof IdentifierToken)) {
            throw new Error(`Expected function name, but found: ${nameToken.constructor.name}`);
        }
        const name = nameToken.name;

        this.expect(LeftParenToken);
        const args: ASTNode[] = [];
        if (!(this.currentToken() instanceof RightParenToken)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(CommaToken));
        }
        this.expect(RightParenToken);
        return new FunctionCallNode(name, args);
    }

    private expect<T extends Token>(expectedType: TokenConstructor<T>): T {
        const token = this.currentToken();
        if (token instanceof expectedType) {
            this.consume();
            return token;
        } else {
            throw new Error(`Expected token ${expectedType.name} but found ${token.constructor.name}`);
        }
    }

    private match<T extends Token>(expectedType: TokenConstructor<T>): boolean {
        const token = this.currentToken();
        if (token instanceof expectedType) {
            this.consume();
            return true;
        }
        return false;
    }

    private consume(): Token {
        const token = this.tokens[this.position];
        this.position++;
        return token;
    }

    private currentToken(): Token {
        return this.tokens[this.position];
    }

    private peekToken(): Token | null {
        return this.position + 1 < this.tokens.length ? this.tokens[this.position + 1] : null;
    }
}
