export class UmniError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class LexerError extends UmniError {
    constructor(message: string, public position: number) {
        super(`Lexer error at position ${position}: ${message}`);
    }
}

export class ParserError extends UmniError {
    constructor(message: string, public token: string) {
        super(`Parser error with token '${token}': ${message}`);
    }
}

export class InterpreterError extends UmniError {
    constructor(message: string) {
        super(`Runtime error: ${message}`);
    }
}

export class TypeError extends UmniError {
    constructor(expected: string, got: string) {
        super(`Type error: expected ${expected} but got ${got}`);
    }
}

export class UnitError extends UmniError {
    constructor(message: string) {
        super(`Unit error: ${message}`);
    }
} 