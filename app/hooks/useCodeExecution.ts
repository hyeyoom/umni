import { Lexer } from '@/lib/Lexer';
import { Parser } from '@/lib/Parser';
import { Interpreter } from '@/lib/Interpreter';

export function executeCode(line: string, interpreter: Interpreter): string {
    if (!line.trim()) return '';

    try {
        const lexer = new Lexer(line);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);
        return String(result);
    } catch (e: unknown) {
        console.error(e);
        return '';
    }
} 