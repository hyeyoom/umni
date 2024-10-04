// Interpreter.ts

import {ASTNode} from './ASTNode';
import {ComputedValue} from './ComputedValue';
import {Environment} from './Environment';

export class Interpreter {
    private unitConversion: { [key: string]: number } = {
        m: 1.0,
        km: 1000.0,
        cm: 0.01,
        mm: 0.001,
        kb: 1024.0,
        mb: 1024.0 * 1024,
        gb: 1024.0 * 1024 * 1024,
    };

    constructor(private environment: Environment = new Environment()) {
    }

    interpret(node: ASTNode): ComputedValue {
        if (node instanceof ASTNode.Natural) {
            return new ComputedValue.Natural(node.value);
        } else if (node instanceof ASTNode.Real) {
            return new ComputedValue.Real(node.value);
        } else if (node instanceof ASTNode.WithUnit) {
            return new ComputedValue.WithUnit(node.value, node.unit);
        } else if (node instanceof ASTNode.StringLiteral) {
            return new ComputedValue.StringValue(node.value);
        } else if (node instanceof ASTNode.Variable) {
            const value =
                this.environment.variables.get(node.name) ||
                this.environment.constants.get(node.name);

            if (value !== undefined) {
                return value;
            } else {
                throw new Error(`Undefined variable: ${node.name}`);
            }
        } else if (node instanceof ASTNode.UnaryOperation) {
            const operand = this.interpret(node.operand);
            return this.evaluateUnaryOperation(node.operator, operand);
        } else if (node instanceof ASTNode.BinaryOperation) {
            const left = this.interpret(node.left);
            const right = this.interpret(node.right);
            return this.evaluateBinaryOperation(left, node.operator, right);
        } else if (node instanceof ASTNode.Assignment) {
            const value = this.interpret(node.value);
            this.assignValue(node.left, value);
            return value;
        } else if (node instanceof ASTNode.FunctionDeclaration) {
            this.environment.functions.set(node.name, node);
            return new ComputedValue.FunctionIsDefined();
        } else if (node instanceof ASTNode.FunctionCall) {
            const builtInFunction = this.environment.builtInFunctions.get(node.name);
            if (builtInFunction) {
                const args = node.args.map((arg) => this.interpret(arg));
                return builtInFunction(args);
            } else {
                const functionNode = this.environment.functions.get(node.name);
                if (!functionNode) {
                    throw new Error(`Undefined function: ${node.name}`);
                }
                if (functionNode.parameters.length !== node.args.length) {
                    throw new Error(`Argument count mismatch for function: ${node.name}`);
                }

                const localEnv = new Environment(
                    this.environment.variables,
                    this.environment.functions,
                );

                for (let i = 0; i < functionNode.parameters.length; i++) {
                    const argValue = this.interpret(node.args[i]);
                    localEnv.variables.set(functionNode.parameters[i], argValue);
                }

                const interpreter = new Interpreter(localEnv);
                return interpreter.interpret(functionNode.body);
            }
        } else if (node instanceof ASTNode.UnitConversion) {
            const value = this.interpret(node.expression);

            if (value instanceof ComputedValue.WithUnit) {
                const sourceUnit = value.unit;
                const targetUnit = node.targetUnit;
                const convertedValue = this.performUnitConversion(
                    value.value,
                    sourceUnit,
                    targetUnit
                );
                return new ComputedValue.WithUnit(convertedValue, targetUnit);
            } else if (
                value instanceof ComputedValue.Natural ||
                value instanceof ComputedValue.Real
            ) {
                const sourceUnit = this.getUnit(node.expression) || node.targetUnit;
                const rawValue =
                    value instanceof ComputedValue.Natural
                        ? value.value
                        : value.value;

                const convertedValue = this.performUnitConversion(
                    rawValue,
                    sourceUnit,
                    node.targetUnit
                );
                return new ComputedValue.WithUnit(convertedValue, node.targetUnit);
            } else {
                throw new Error('Cannot convert non-numeric value');
            }
        } else {
            throw new Error('Unknown AST Node');
        }
    }

    private evaluateUnaryOperation(
        operator: string,
        operand: ComputedValue
    ): ComputedValue {
        if (operator === '-') {
            if (operand instanceof ComputedValue.Number) {
                if (operand instanceof ComputedValue.Real) {
                    return new ComputedValue.Real(-operand.value);
                } else if (operand instanceof ComputedValue.Natural) {
                    return new ComputedValue.Natural(-operand.value);
                } else if (operand instanceof ComputedValue.WithUnit) {
                    return new ComputedValue.WithUnit(-operand.value, operand.unit);
                }
            } else {
                throw new Error(`Invalid operand for unary '-': ${operand}`);
            }
        } else {
            throw new Error(`Unknown unary operator: ${operator}`);
        }
        // 편법 -_-
        return new ComputedValue.Natural(0)
    }

    private assignValue(target: ASTNode, value: ComputedValue): void {
        if (target instanceof ASTNode.Variable) {
            this.environment.variables.set(target.name, value);
        } else if (target instanceof ASTNode.Assignment) {
            this.assignValue(target.left, value);
        } else {
            throw new Error(`Invalid assignment target: ${target}`);
        }
    }

    private evaluateBinaryOperation(
        left: ComputedValue,
        operator: string,
        right: ComputedValue
    ): ComputedValue {
        switch (operator) {
            case '+':
                return this.handleAddition(left, right);
            case '-':
                return this.handleSubtraction(left, right);
            case '*':
                return this.handleMultiplication(left, right);
            case '/':
                return this.handleDivision(left, right);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    private handleAddition(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        // Numeric addition
        if (
            (left instanceof ComputedValue.Real || left instanceof ComputedValue.Natural) &&
            (right instanceof ComputedValue.Real || right instanceof ComputedValue.Natural)
        ) {
            const leftValue = left instanceof ComputedValue.Real ? left.value : left.value;
            const rightValue = right instanceof ComputedValue.Real ? right.value : right.value;
            const result = leftValue + rightValue;
            return Number.isInteger(result)
                ? new ComputedValue.Natural(result)
                : new ComputedValue.Real(result);
        }

        // WithUnit addition
        if (left instanceof ComputedValue.WithUnit || right instanceof ComputedValue.WithUnit) {
            const leftValue =
                left instanceof ComputedValue.WithUnit
                    ? left.value
                    : left instanceof ComputedValue.Number.Real
                        ? left.value
                        : left instanceof ComputedValue.Number.Natural
                            ? left.value
                            : null;
            const rightValue =
                right instanceof ComputedValue.WithUnit
                    ? right.value
                    : right instanceof ComputedValue.Number.Real
                        ? right.value
                        : right instanceof ComputedValue.Number.Natural
                            ? right.value
                            : null;
            const unit = left instanceof ComputedValue.WithUnit ? left.unit : right instanceof ComputedValue.WithUnit ? right.unit : null;
            if (leftValue !== null && rightValue !== null && unit) {
                return new ComputedValue.WithUnit(leftValue + rightValue, unit);
            }
        }

        // String concatenation
        if (
            left instanceof ComputedValue.StringValue &&
            right instanceof ComputedValue.StringValue
        ) {
            return new ComputedValue.StringValue(left.value + right.value);
        }

        if (
            left instanceof ComputedValue.StringValue &&
            right instanceof ComputedValue.Number
        ) {
            return new ComputedValue.StringValue(left.value + right.toString());
        }

        if (
            left instanceof ComputedValue.Number &&
            right instanceof ComputedValue.StringValue
        ) {
            return new ComputedValue.StringValue(left.toString() + right.value);
        }

        throw new Error(`Invalid operands for '+': ${left} and ${right}`);
    }

    private handleSubtraction(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof ComputedValue.Real || left instanceof ComputedValue.Natural) &&
            (right instanceof ComputedValue.Real || right instanceof ComputedValue.Natural)
        ) {
            const leftValue = left instanceof ComputedValue.Real ? left.value : left.value;
            const rightValue = right instanceof ComputedValue.Real ? right.value : right.value;
            const result = leftValue - rightValue;
            return Number.isInteger(result)
                ? new ComputedValue.Natural(result)
                : new ComputedValue.Real(result);
        }

        if (left instanceof ComputedValue.WithUnit || right instanceof ComputedValue.WithUnit) {
            const leftValue =
                left instanceof ComputedValue.WithUnit
                    ? left.value
                    : left instanceof ComputedValue.Number.Real
                        ? left.value
                        : left instanceof ComputedValue.Number.Natural
                            ? left.value
                            : null;
            const rightValue =
                right instanceof ComputedValue.WithUnit
                    ? right.value
                    : right instanceof ComputedValue.Number.Real
                        ? right.value
                        : right instanceof ComputedValue.Number.Natural
                            ? right.value
                            : null;
            const unit = left instanceof ComputedValue.WithUnit ? left.unit : right instanceof ComputedValue.WithUnit ? right.unit : null;
            if (leftValue !== null && rightValue !== null && unit) {
                return new ComputedValue.WithUnit(leftValue - rightValue, unit);
            }
        }

        throw new Error(`Invalid operands for '-': ${left} and ${right}`);
    }

    private handleMultiplication(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof ComputedValue.Real || left instanceof ComputedValue.Natural) &&
            (right instanceof ComputedValue.Real || right instanceof ComputedValue.Natural)
        ) {
            const leftValue = left instanceof ComputedValue.Real ? left.value : left.value;
            const rightValue = right instanceof ComputedValue.Real ? right.value : right.value;
            const result = leftValue * rightValue;
            return Number.isInteger(result)
                ? new ComputedValue.Natural(result)
                : new ComputedValue.Real(result);
        }

        if (left instanceof ComputedValue.WithUnit || right instanceof ComputedValue.WithUnit) {
            const leftValue =
                left instanceof ComputedValue.WithUnit
                    ? left.value
                    : left instanceof ComputedValue.Number.Real
                        ? left.value
                        : left instanceof ComputedValue.Number.Natural
                            ? left.value
                            : null;
            const rightValue =
                right instanceof ComputedValue.WithUnit
                    ? right.value
                    : right instanceof ComputedValue.Number.Real
                        ? right.value
                        : right instanceof ComputedValue.Number.Natural
                            ? right.value
                            : null;
            const unit = left instanceof ComputedValue.WithUnit ? left.unit : right instanceof ComputedValue.WithUnit ? right.unit : null;
            if (leftValue !== null && rightValue !== null && unit) {
                return new ComputedValue.WithUnit(leftValue * rightValue, unit);
            }
        }

        // String multiplication
        if (
            left instanceof ComputedValue.StringValue &&
            (right instanceof ComputedValue.Real || right instanceof ComputedValue.Natural)
        ) {
            const times = right instanceof ComputedValue.Real ? Math.floor(right.value) : right.value;
            return new ComputedValue.StringValue(left.value.repeat(times));
        }

        throw new Error(`Invalid operands for '*': ${left} and ${right}`);
    }

    private handleDivision(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof ComputedValue.Real || left instanceof ComputedValue.Natural) &&
            (right instanceof ComputedValue.Real || right instanceof ComputedValue.Natural)
        ) {
            const leftValue = left instanceof ComputedValue.Real ? left.value : left.value;
            const rightValue = right instanceof ComputedValue.Real ? right.value : right.value;
            const result = leftValue / rightValue;
            return new ComputedValue.Real(result);
        }

        if (left instanceof ComputedValue.WithUnit || right instanceof ComputedValue.WithUnit) {
            const leftValue =
                left instanceof ComputedValue.WithUnit
                    ? left.value
                    : left instanceof ComputedValue.Number.Real
                        ? left.value
                        : left instanceof ComputedValue.Number.Natural
                            ? left.value
                            : null;
            const rightValue =
                right instanceof ComputedValue.WithUnit
                    ? right.value
                    : right instanceof ComputedValue.Number.Real
                        ? right.value
                        : right instanceof ComputedValue.Number.Natural
                            ? right.value
                            : null;
            const unit = left instanceof ComputedValue.WithUnit ? left.unit : right instanceof ComputedValue.WithUnit ? right.unit : null;
            if (leftValue !== null && rightValue !== null && unit) {
                return new ComputedValue.WithUnit(leftValue / rightValue, unit);
            }
        }

        throw new Error(`Invalid operands for '/': ${left} and ${right}`);
    }

    private getUnit(node: ASTNode): string | null {
        if (node instanceof ASTNode.WithUnit) {
            return node.unit;
        } else if (node instanceof ASTNode.BinaryOperation) {
            const leftUnit = this.getUnit(node.left);
            const rightUnit = this.getUnit(node.right);
            return leftUnit || rightUnit;
        } else {
            return null;
        }
    }

    private performUnitConversion(
        value: number,
        sourceUnit: string,
        targetUnit: string
    ): number {
        const sourceFactor = this.unitConversion[sourceUnit];
        const targetFactor = this.unitConversion[targetUnit];
        if (sourceFactor === undefined) {
            throw new Error(`Unknown unit: ${sourceUnit}`);
        }
        if (targetFactor === undefined) {
            throw new Error(`Unknown unit: ${targetUnit}`);
        }
        return (value * sourceFactor) / targetFactor;
    }
}
