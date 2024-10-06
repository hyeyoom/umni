// Main.ts

import { Lexer } from './Lexer';
import { Parser } from './Parser';
import { Interpreter } from './Interpreter';
import {Environment} from "@/lib/Environment";

async function main() {
    const environment = new Environment();
    const interpreter = new Interpreter(environment);

    while (true) {
        const input = await readInput('> ');
        if (!input.trim()) continue;

        try {
            const t1 = Date.now();
            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            const result = interpreter.interpret(ast);
            const t2 = Date.now();
            console.log(`${result} (in ${t2 - t1} ms)`);
        } catch (e) {
            console.error(`Error: ${(e as Error).message}`);
        }
    }
}

function readInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        process.stdin.once('data', (data) => resolve(data.toString()));
    });
}

main();
