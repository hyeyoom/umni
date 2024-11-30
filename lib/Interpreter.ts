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
    TernaryOperationNode,
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
            return this.interpretVariable(node);
        } else if (node instanceof UnaryOperationNode) {
            const operand = this.interpret(node.operand);
            return this.evaluateUnaryOperation(node.operator, operand);
        } else if (node instanceof BinaryOperationNode) {
            const left = this.interpret(node.left);
            const right = this.interpret(node.right);
            return this.evaluateBinaryOperation(left, node.operator, right);
        } else if (node instanceof AssignmentNode) {
            return this.interpretAssignment(node);
        } else if (node instanceof FunctionDeclarationNode) {
            return this.interpretFunctionDeclaration(node);
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
        } else if (node instanceof TernaryOperationNode) {
            const condition = this.interpret(node.condition);

            if (!(condition instanceof LogicalValue)) {
                throw new Error('Condition must evaluate to a boolean value');
            }

            return condition.value ?
                this.interpret(node.trueExpression) :
                this.interpret(node.falseExpression);
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

    private interpretVariable(node: VariableNode): ComputedValue {
        const name = node.name;

        // 먼저 상수인지 확인
        if (this.environment.constants.has(name)) {
            return this.environment.constants.get(name)!;
        }

        // 변수인지 확인
        if (this.environment.variables.has(name)) {
            return this.environment.variables.get(name)!;
        }

        throw new Error(`Undefined variable '${name}'`);
    }

    private interpretAssignment(node: AssignmentNode): ComputedValue {
        if (node.left instanceof VariableNode) {
            const variableName = node.left.name;

            // 상수인지 확인
            if (this.environment.constants.has(variableName)) {
                throw new Error(`Cannot assign to constant '${variableName}'`);
            }

            const value = this.interpret(node.value);
            this.environment.variables.set(variableName, value);
            return value;
        }
        throw new Error('Invalid assignment target');
    }

    private interpretFunctionDeclaration(node: FunctionDeclarationNode): ComputedValue {
        // 함수 이름이 상수인지 확인
        if (this.environment.constants.has(node.name)) {
            throw new Error(`Cannot declare constant '${node.name}' as function`);
        }

        this.environment.functions.set(node.name, node);
        return new FunctionIsDefined();
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
                if ((right instanceof RealValue || right instanceof NaturalValue) && right.value === 0) {
                    throw new Error('Division by zero');
                }
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
                case '>':
                    return new LogicalValue(leftValue > rightValue);
                case '>=':
                    return new LogicalValue(leftValue >= rightValue);
                case '<':
                    return new LogicalValue(leftValue < rightValue);
                case '<=':
                    return new LogicalValue(leftValue <= rightValue);
                case '==':
                    return new LogicalValue(leftValue === rightValue);
                case '!=':
                    return new LogicalValue(leftValue !== rightValue);
                default:
                    throw new Error(`Unknown comparison operator: ${operator}`);
            }
        }

        const leftValue = (left as RealValue | NaturalValue).value;
        const rightValue = (right as RealValue | NaturalValue).value;

        switch (operator) {
            case '>':
                return new LogicalValue(leftValue > rightValue);
            case '>=':
                return new LogicalValue(leftValue >= rightValue);
            case '<':
                return new LogicalValue(leftValue < rightValue);
            case '<=':
                return new LogicalValue(leftValue <= rightValue);
            case '==':
                return new LogicalValue(leftValue === rightValue);
            case '!=':
                return new LogicalValue(leftValue !== rightValue);
            default:
                throw new Error(`Unknown comparison operator: ${operator}`);
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
