// Environment.ts

import { ComputedValue } from './ComputedValue';
import { ASTNode } from './ASTNode';

export class Environment {
    variables: Map<string, ComputedValue> = new Map();
    functions: Map<string, ASTNode.FunctionDeclaration> = new Map();
    constants: Map<string, ComputedValue> = new Map([
        ['pi', new ComputedValue.Real(Math.PI)],
        ['e', new ComputedValue.Real(Math.E)],
    ]);
    builtInFunctions: Map<
        string,
        (args: ComputedValue[]) => ComputedValue
    > = new Map([
        // Add built-in functions here
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
                    throw new Error('sin function requires one argument');
                }
                const arg = args[0];
                if (arg instanceof ComputedValue.Real || arg instanceof ComputedValue.Natural) {
                    return new ComputedValue.Real(Math.cos(arg.valueOf() as number));
                } else {
                    throw new Error('Invalid argument for sin function');
                }
            },
        ],
        // Add more built-in functions as needed
    ]);
}
