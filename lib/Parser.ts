// Parser.ts

import {Token} from './Token';
import {ASTNode} from './ASTNode';

export class Parser {
    private position = 0;

    constructor(private tokens: Token[]) {
    }

    parse(): ASTNode {
        return this.parseStatement();
    }

    private parseStatement(): ASTNode {
        if (this.currentToken() instanceof Token.FunctionDeclaration) {
            return this.parseFunctionDeclaration();
        } else {
            return this.parseAssignment();
        }
    }

    private parseAssignment(): ASTNode {
        const left = this.parseExpression();
        if (this.match(Token.Assign)) {
            const value = this.parseAssignment();
            return new ASTNode.Assignment(left, value);
        } else {
            return left;
        }
    }

    private parseExpression(): ASTNode {
        return this.parseComparison();
    }

    private parseComparison(): ASTNode {
        let node = this.parseToConversion()
        while (true) {
            const token = this.currentToken()
            if (
                token instanceof Token.SymbolicOperator &&
                (
                    token.symbol === '>' ||
                    token.symbol === '>=' ||
                    token.symbol === '<' ||
                    token.symbol === '<=' ||
                    token.symbol === '==' ||
                    token.symbol === '!='
                )
            ) {
                this.consume();
                const right = this.parseAddition()
                node = new ASTNode.BinaryOperation(node, token.symbol, right);
            } else {
                break;
            }
        }
        return node
    }

    private parseToConversion(): ASTNode {
        let node = this.parseAddition();
        while (true) {
            const token = this.currentToken();
            if (
                token instanceof Token.SemanticOperator &&
                token.symbol === Token.SemanticOperator.Symbol.TO
            ) {
                this.consume(); // 'to' token
                const targetUnitToken = this.consume();
                if (targetUnitToken instanceof Token.Unit) {
                    node = new ASTNode.UnitConversion(node, targetUnitToken.name);
                } else {
                    throw new Error(`Expected unit identifier after 'to': ${targetUnitToken}`);
                }
            } else {
                break;
            }
        }
        return node;
    }

    private parseAddition(): ASTNode {
        let node = this.parseMultiplication();
        while (true) {
            const token = this.currentToken();
            if (
                token instanceof Token.SymbolicOperator &&
                (token.symbol === '+' || token.symbol === '-')
            ) {
                this.consume();
                const right = this.parseMultiplication();
                node = new ASTNode.BinaryOperation(node, token.symbol, right);
            } else {
                break;
            }
        }
        return node;
    }

    private parseMultiplication(): ASTNode {
        let node = this.parseUnary();
        while (true) {
            const token = this.currentToken();
            if (
                token instanceof Token.SymbolicOperator &&
                (token.symbol === '*' || token.symbol === '/')
            ) {
                this.consume();
                const right = this.parseUnary();
                node = new ASTNode.BinaryOperation(node, token.symbol, right);
            } else if (
                token instanceof Token.SemanticOperator &&
                token.symbol === Token.SemanticOperator.Symbol.TIMES
            ) {
                this.consume();
                const right = this.parseUnary();
                node = new ASTNode.BinaryOperation(node, '*', right);
            } else {
                break;
            }
        }
        return node;
    }

    private parseUnary(): ASTNode {
        const token = this.currentToken();
        if (token instanceof Token.SymbolicOperator && token.symbol === '-') {
            this.consume();
            const operand = this.parseUnary();
            return new ASTNode.UnaryOperation('-', operand);
        } else if (token instanceof Token.SymbolicOperator && token.symbol === '!') {
            this.consume()
            const operand = this.parseUnary();
            return new ASTNode.UnaryOperation('!', operand)
        } else {
            return this.parsePrimary();
        }
    }

    private parsePrimary(): ASTNode {
        const token = this.currentToken();
        if (token instanceof Token.Real) {
            this.consume();
            return new ASTNode.Real(token.value);
        } else if (token instanceof Token.Natural) {
            this.consume();
            return new ASTNode.Natural(token.value);
        } else if (token instanceof Token.WithUnit) {
            this.consume();
            return new ASTNode.WithUnit(token.value, token.unit);
        } else if (token instanceof Token.StringLiteral) {
            this.consume();
            return new ASTNode.StringLiteral(token.value);
        } else if (token instanceof Token.Identifier) {
            const nextToken = this.peekToken();
            if (nextToken instanceof Token.LeftParen) {
                return this.parseFunctionCall();
            } else {
                this.consume();
                return new ASTNode.Variable(token.name);
            }
        } else if (token instanceof Token.LeftParen) {
            this.consume();
            const expression = this.parseExpression();
            this.expect(Token.RightParen);
            return expression;
        } else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }

    private parseFunctionDeclaration(): ASTNode {
        this.consume(); // Consume 'fn'
        const nameToken = this.consume();
        if (!(nameToken instanceof Token.Identifier)) {
            throw new Error('Expected function name after "fn"');
        }
        const name = nameToken.name;

        this.consume(); // Consume '('
        const parameters: string[] = [];
        if (!(this.currentToken() instanceof Token.RightParen)) {
            do {
                const paramToken = this.consume();
                if (!(paramToken instanceof Token.Identifier)) {
                    throw new Error('Expected parameter name');
                }
                parameters.push(paramToken.name);
            } while (this.match(Token.Comma));
        }
        this.expect(Token.RightParen);
        this.expect(Token.Assign);
        const body = this.parseExpression();
        return new ASTNode.FunctionDeclaration(name, parameters, body);
    }

    private parseFunctionCall(): ASTNode {
        const nameToken = this.consume();
        if (!(nameToken instanceof Token.Identifier)) {
            throw new Error('Expected function name');
        }
        const name = nameToken.name;

        this.consume(); // Consume '('
        const args: ASTNode[] = [];
        if (!(this.currentToken() instanceof Token.RightParen)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(Token.Comma));
        }
        this.expect(Token.RightParen);
        return new ASTNode.FunctionCall(name, args);
    }

    private expect(expectedType: new (...args: never[]) => Token) {
        const token = this.currentToken();
        if (token instanceof expectedType) {
            this.consume();
        } else {
            throw new Error(
                `Expected token ${expectedType.name} but found ${token}`
            );
        }
    }

    private match(expectedType: new (...args: never[]) => Token): boolean {
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
