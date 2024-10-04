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
        this.constants = constants ?? new Map([
            ['pi', new ComputedValue.Real(Math.PI)],
            ['e', new ComputedValue.Real(Math.E)],
        ]);

        // Built-in Functions: Use provided functions or default ones if none are provided
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
        ]);
    }
}
