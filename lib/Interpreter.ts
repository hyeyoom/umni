// Interpreter.ts
import {
    AssignmentNode,
    ASTNode,
    BinaryOperationNode,
    FunctionCallNode,
    FunctionDeclarationNode,
    NaturalNode,
    RealNode,
    StringLiteralNode,
    UnaryOperationNode,
    UnitConversionNode,
    VariableNode,
    WithUnitNode
} from './ASTNode';
import {
    ComputedValue,
    FunctionIsDefined,
    LogicalValue,
    NaturalValue,
    RealValue,
    StringValue,
    WithUnitValue
} from './ComputedValue';
import {Environment} from './Environment';
import {UnitConverter} from './UnitConverter';

export class Interpreter {
    constructor(private environment: Environment = new Environment()) {
    }

    interpret(node: ASTNode): ComputedValue {
        if (node instanceof RealNode) {
            return new RealValue(node.value);
        } else if (node instanceof NaturalNode) {
            return new NaturalValue(node.value);
        } else if (node instanceof WithUnitNode) {
            return new WithUnitValue(node.value, node.unit);
        } else if (node instanceof StringLiteralNode) {
            return new StringValue(node.value);
        } else if (node instanceof VariableNode) {
            const value =
                this.environment.variables.get(node.name) ||
                this.environment.constants.get(node.name);

            if (value !== undefined) {
                return value;
            } else {
                throw new Error(`Undefined variable: ${node.name}`);
            }
        } else if (node instanceof UnaryOperationNode) {
            const operand = this.interpret(node.operand);
            return this.evaluateUnaryOperation(node.operator, operand);
        } else if (node instanceof BinaryOperationNode) {
            const left = this.interpret(node.left);
            const right = this.interpret(node.right);
            return this.evaluateBinaryOperation(left, node.operator, right);
        } else if (node instanceof AssignmentNode) {
            const value = this.interpret(node.value);
            this.assignValue(node.left, value);
            return value;
        } else if (node instanceof FunctionDeclarationNode) {
            this.environment.functions.set(node.name, node);
            return new FunctionIsDefined();
        } else if (node instanceof FunctionCallNode) {
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

                const localEnv = new Environment({
                    variables: new Map(this.environment.variables),
                    functions: this.environment.functions,
                    constants: new Map(this.environment.constants),
                    builtInFunctions: this.environment.builtInFunctions
                });

                for (let i = 0; i < functionNode.parameters.length; i++) {
                    const argValue = this.interpret(node.args[i]);
                    localEnv.variables.set(functionNode.parameters[i], argValue);
                }

                const interpreter = new Interpreter(localEnv);
                return interpreter.interpret(functionNode.body);
            }
        } else if (node instanceof UnitConversionNode) {
            const value = this.interpret(node.expression);

            if (value instanceof WithUnitValue) {
                const convertedValue = UnitConverter.convert(value.value, value.unit, node.targetUnit);
                return new WithUnitValue(convertedValue, node.targetUnit);
            } else if (value instanceof RealValue || value instanceof NaturalValue) {
                const convertedValue = UnitConverter.convert(value.value, 'm', node.targetUnit); // Assuming default source unit
                return new WithUnitValue(convertedValue, node.targetUnit);
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
            if (operand instanceof RealValue) {
                return new RealValue(-operand.value);
            } else if (operand instanceof NaturalValue) {
                return new NaturalValue(-operand.value);
            } else if (operand instanceof WithUnitValue) {
                return new WithUnitValue(-operand.value, operand.unit);
            }
            throw new Error(`Invalid operand for unary '-': ${operand.toString()}`);
        } else if (operator === '!') {
            if (operand instanceof LogicalValue) {
                return new LogicalValue(!operand.value);
            }
            throw new Error(`Invalid operand for unary '!': ${operand.toString()}`);
        }
        throw new Error(`Unknown unary operator: ${operator}`);
    }

    private assignValue(target: ASTNode, value: ComputedValue): void {
        if (target instanceof VariableNode) {
            this.environment.variables.set(target.name, value);
        } else if (target instanceof AssignmentNode) {
            this.assignValue(target.left, value);
        } else {
            throw new Error(`Invalid assignment target: ${target.constructor.name}`);
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
            case '>':
            case '>=':
            case '<':
            case '<=':
            case '==':
            case '!=':
                return this.handleComparison(left, operator, right);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    private handleComparison(
        left: ComputedValue,
        operator: string,
        right: ComputedValue
    ): LogicalValue {
        if (left instanceof WithUnitValue || right instanceof WithUnitValue) {
            let targetUnit: string;
            let leftValue: number;
            let rightValue: number;

            if (left instanceof WithUnitValue && right instanceof WithUnitValue) {
                targetUnit = left.unit;
                leftValue = left.value;
                rightValue = UnitConverter.convert(right.value, right.unit, targetUnit);
            } else if (left instanceof WithUnitValue) {
                targetUnit = left.unit;
                leftValue = left.value;
                rightValue = (right as RealValue | NaturalValue).value;
            } else {
                targetUnit = (right as WithUnitValue).unit;
                leftValue = (left as RealValue | NaturalValue).value;
                rightValue = (right as WithUnitValue).value;
            }

            switch (operator) {
                case '>': return new LogicalValue(leftValue > rightValue);
                case '>=': return new LogicalValue(leftValue >= rightValue);
                case '<': return new LogicalValue(leftValue < rightValue);
                case '<=': return new LogicalValue(leftValue <= rightValue);
                case '==': return new LogicalValue(leftValue === rightValue);
                case '!=': return new LogicalValue(leftValue !== rightValue);
                default: throw new Error(`Unknown comparison operator: ${operator}`);
            }
        }

        const leftValue = (left as RealValue | NaturalValue).value;
        const rightValue = (right as RealValue | NaturalValue).value;

        switch (operator) {
            case '>': return new LogicalValue(leftValue > rightValue);
            case '>=': return new LogicalValue(leftValue >= rightValue);
            case '<': return new LogicalValue(leftValue < rightValue);
            case '<=': return new LogicalValue(leftValue <= rightValue);
            case '==': return new LogicalValue(leftValue === rightValue);
            case '!=': return new LogicalValue(leftValue !== rightValue);
            default: throw new Error(`Unknown comparison operator: ${operator}`);
        }
    }

    private handleAddition(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof RealValue || left instanceof NaturalValue) &&
            (right instanceof RealValue || right instanceof NaturalValue)
        ) {
            const result = left.value + right.value;
            return Number.isInteger(result)
                ? new NaturalValue(result)
                : new RealValue(result);
        }

        if (left instanceof WithUnitValue || right instanceof WithUnitValue) {
            return this.handleWithUnit(left, right, '+');
        }

        if (
            left instanceof StringValue &&
            right instanceof StringValue
        ) {
            return new StringValue(left.value + right.value);
        }

        if (
            left instanceof StringValue &&
            (right instanceof RealValue || right instanceof NaturalValue || right instanceof WithUnitValue)
        ) {
            return new StringValue(left.value + right.toString());
        }

        if (
            (left instanceof RealValue || left instanceof NaturalValue || left instanceof WithUnitValue) &&
            right instanceof StringValue
        ) {
            return new StringValue(left.toString() + right.value);
        }

        throw new Error(`Invalid operands for '+': ${left.toString()} and ${right.toString()}`);
    }

    private handleSubtraction(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof RealValue || left instanceof NaturalValue) &&
            (right instanceof RealValue || right instanceof NaturalValue)
        ) {
            const result = left.value - right.value;
            return Number.isInteger(result)
                ? new NaturalValue(result)
                : new RealValue(result);
        }

        if (left instanceof WithUnitValue || right instanceof WithUnitValue) {
            return this.handleWithUnit(left, right, '-');
        }

        throw new Error(`Invalid operands for '-': ${left.toString()} and ${right.toString()}`);
    }

    private handleMultiplication(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof RealValue || left instanceof NaturalValue) &&
            (right instanceof RealValue || right instanceof NaturalValue)
        ) {
            const result = left.value * right.value;
            return Number.isInteger(result)
                ? new NaturalValue(result)
                : new RealValue(result);
        }

        if (left instanceof WithUnitValue || right instanceof WithUnitValue) {
            return this.handleWithUnit(left, right, '*');
        }

        if (
            left instanceof StringValue &&
            (right instanceof RealValue || right instanceof NaturalValue)
        ) {
            const times = Math.floor(right.value);
            return new StringValue(left.value.repeat(times));
        }

        throw new Error(`Invalid operands for '*': ${left.toString()} and ${right.toString()}`);
    }

    private handleDivision(
        left: ComputedValue,
        right: ComputedValue
    ): ComputedValue {
        if (
            (left instanceof RealValue || left instanceof NaturalValue) &&
            (right instanceof RealValue || right instanceof NaturalValue)
        ) {
            if (right.value === 0) {
                throw new Error('Division by zero');
            }
            const result = left.value / right.value;
            return new RealValue(result);
        }

        if (left instanceof WithUnitValue || right instanceof WithUnitValue) {
            return this.handleWithUnit(left, right, '/');
        }

        throw new Error(`Invalid operands for '/': ${left.toString()} and ${right.toString()}`);
    }

    private handleWithUnit(
        left: ComputedValue,
        right: ComputedValue,
        operator: string,
    ): ComputedValue {
        let targetUnit: string | null = null;

        if (left instanceof WithUnitValue) {
            targetUnit = left.unit;
        } else if (right instanceof WithUnitValue) {
            targetUnit = right.unit;
        }

        if (!targetUnit) {
            throw new Error(`Cannot determine target unit for operator '${operator}'`);
        }

        let leftValue: number;
        if (left instanceof WithUnitValue) {
            leftValue = UnitConverter.convert(left.value, left.unit, targetUnit);
        } else if (left instanceof RealValue || left instanceof NaturalValue) {
            leftValue = left.value;
        } else {
            throw new Error(`Left operand cannot be converted to unit '${targetUnit}'`);
        }

        let rightValue: number;
        if (right instanceof WithUnitValue) {
            rightValue = UnitConverter.convert(right.value, right.unit, targetUnit);
        } else if (right instanceof RealValue || right instanceof NaturalValue) {
            rightValue = right.value;
        } else {
            throw new Error(`Right operand cannot be converted to unit '${targetUnit}'`);
        }

        switch (operator) {
            case '+':
                return new WithUnitValue(leftValue + rightValue, targetUnit);
            case '-':
                return new WithUnitValue(leftValue - rightValue, targetUnit);
            case '*':
                return new WithUnitValue(leftValue * rightValue, targetUnit);
            case '/':
                if (rightValue === 0) {
                    throw new Error('Division by zero');
                }
                return new WithUnitValue(leftValue / rightValue, targetUnit);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }
}
