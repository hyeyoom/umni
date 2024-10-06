// Environment.ts
import {ComputedValue, LogicalValue, NaturalValue, RealValue, StringValue, WithUnitValue} from './ComputedValue';
import {FunctionDeclarationNode} from './ASTNode';

interface EnvironmentOptions {
    variables?: Map<string, ComputedValue>;
    functions?: Map<string, FunctionDeclarationNode>;
    constants?: Map<string, ComputedValue>;
    builtInFunctions?: Map<string, (args: ComputedValue[]) => ComputedValue>;
}

export class Environment {
    variables: Map<string, ComputedValue>;
    functions: Map<string, FunctionDeclarationNode>;
    constants: Map<string, ComputedValue>;
    builtInFunctions: Map<string, (args: ComputedValue[]) => ComputedValue>;

    constructor(options: EnvironmentOptions = {}) {
        this.variables = options.variables ?? new Map();
        this.functions = options.functions ?? new Map();
        this.constants = options.constants ?? this.initializeConstants();
        this.builtInFunctions = options.builtInFunctions ?? this.initializeBuiltInFunctions();
    }

    private initializeConstants(): Map<string, ComputedValue> {
        return new Map<string, ComputedValue>([
            ['pi', new RealValue(Math.PI)],
            ['e', new RealValue(Math.E)],
            ['true', new LogicalValue(true)],
            ['false', new LogicalValue(false)],
        ]);
    }

    private initializeBuiltInFunctions(): Map<string, (args: ComputedValue[]) => ComputedValue> {
        return new Map<string, (args: ComputedValue[]) => ComputedValue>([
            [
                'sin',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('sin function requires one argument');
                    const arg = args[0];
                    if (arg instanceof RealValue || arg instanceof NaturalValue) {
                        return new RealValue(Math.sin(arg.value));
                    }
                    throw new Error('Invalid argument for sin function');
                },
            ],
            [
                'cos',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('cos function requires one argument');
                    const arg = args[0];
                    if (arg instanceof RealValue || arg instanceof NaturalValue) {
                        return new RealValue(Math.cos(arg.value));
                    }
                    throw new Error('Invalid argument for cos function');
                },
            ],
            [
                'length',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('length function requires one argument');
                    const arg = args[0];
                    if (arg instanceof StringValue) {
                        return new NaturalValue(arg.value.length);
                    }
                    throw new Error('Invalid argument for length function');
                },
            ],
            [
                'b64Encode',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('b64Encode function requires one argument');
                    const arg = args[0];
                    if (arg instanceof StringValue) {
                        const encoded = Buffer.from(arg.value, 'utf8').toString('base64');
                        return new StringValue(encoded);
                    }
                    throw new Error('Invalid argument for b64Encode function');
                },
            ],
            [
                'b64Decode',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('b64Decode function requires one argument');
                    const arg = args[0];
                    if (arg instanceof StringValue) {
                        const decoded = Buffer.from(arg.value, 'base64').toString('utf8');
                        return new StringValue(decoded);
                    }
                    throw new Error('Invalid argument for b64Decode function');
                },
            ],
            [
                'type',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) throw new Error('type function requires one argument');
                    const arg = args[0];
                    if (arg instanceof StringValue) {
                        return new StringValue("string");
                    }
                    if (arg instanceof LogicalValue) {
                        return new StringValue("boolean");
                    }
                    if (arg instanceof RealValue) {
                        return new StringValue("double");
                    }
                    if (arg instanceof NaturalValue) {
                        return new StringValue("integer");
                    }
                    if (arg instanceof WithUnitValue) {
                        return new StringValue("double with unit");
                    }
                    throw new Error('Unknown type');
                },
            ],
        ]);
    }
}
