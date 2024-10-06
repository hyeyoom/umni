// Environment.ts
import {ComputedValue} from './ComputedValue';
import {ASTNode} from './ASTNode';

export class Environment {
    variables: Map<string, ComputedValue>;
    functions: Map<string, ASTNode.FunctionDeclaration>;
    constants: Map<string, ComputedValue>;
    builtInFunctions: Map<string, (args: ComputedValue[]) => ComputedValue>;

    constructor(
        variables?: Map<string, ComputedValue>,
        functions?: Map<string, ASTNode.FunctionDeclaration>,
        constants?: Map<string, ComputedValue>,
        builtInFunctions?: Map<string, (args: ComputedValue[]) => ComputedValue>
    ) {
        // Variables: Use provided variables or initialize as an empty map if none are provided
        this.variables = variables ?? new Map();

        // Functions: Use provided functions or initialize as an empty map if none are provided
        this.functions = functions ?? new Map();

        // Constants: Use provided constants or default ones if none are provided
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.constants = constants ?? new Map([
            ['pi', new ComputedValue.Real(Math.PI)],
            ['e', new ComputedValue.Real(Math.E)],
            ['true', new ComputedValue.LogicalValue(true)],
            ['false', new ComputedValue.LogicalValue(false)],
        ]);

        // Built-in Functions: Use provided functions or default ones if none are provided
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.builtInFunctions = builtInFunctions ?? new Map([
            [
                'sin',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('sin function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.Real || arg instanceof ComputedValue.Natural) {
                        return new ComputedValue.Real(Math.sin(arg.valueOf() as number));
                    } else {
                        throw new Error('Invalid argument for sin function');
                    }
                },
            ],
            [
                'cos',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('cos function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.Real || arg instanceof ComputedValue.Natural) {
                        return new ComputedValue.Real(Math.cos(arg.valueOf() as number));
                    } else {
                        throw new Error('Invalid argument for cos function');
                    }
                },
            ],
            [
                'length',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('length function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.StringValue) {
                        return new ComputedValue.Natural(arg.value.length);
                    } else {
                        throw new Error('Invalid argument for cos function');
                    }
                },
            ],
            [
                'b64Encode',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('b64Encode function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.StringValue) {
                        const encoded = Buffer.from(arg.value, 'utf8').toString('base64');
                        return new ComputedValue.StringValue(encoded);
                    } else {
                        throw new Error('Invalid argument for cos function');
                    }
                },
            ],
            [
                'b64Decode',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('b64Encode function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.StringValue) {
                        const decoded = Buffer.from(arg.value, 'base64').toString('utf8');
                        return new ComputedValue.StringValue(decoded);
                    } else {
                        throw new Error('Invalid argument for cos function');
                    }
                },
            ],
            [
                'type',
                (args: ComputedValue[]) => {
                    if (args.length !== 1) {
                        throw new Error('type function requires one argument');
                    }
                    const arg = args[0];
                    if (arg instanceof ComputedValue.StringValue) {
                        return new ComputedValue.StringValue("string");
                    }

                    if (arg instanceof ComputedValue.LogicalValue) {
                        return new ComputedValue.StringValue("boolean");
                    }

                    if (arg instanceof ComputedValue.Real) {
                        return new ComputedValue.StringValue("double");
                    }

                    if (arg instanceof ComputedValue.Natural) {
                        return new ComputedValue.StringValue("integer");
                    }

                    if (arg instanceof ComputedValue.WithUnit) {
                        return new ComputedValue.StringValue("double with unit");
                    }
                },
            ],
        ]);
    }
}
