export class UmniError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class LexerError extends UmniError {
    constructor(message: string, public position: number) {
        super(`위치 ${position}에서 렉서 오류: ${message}`);
    }
}

export class ParserError extends UmniError {
    constructor(message: string, public token: string) {
        super(`토큰 '${token}' 파싱 중 오류: ${message}`);
    }
}

export class InterpreterError extends UmniError {
    constructor(message: string) {
        super(`실행 중 오류: ${message}`);
    }
}

export class TypeError extends UmniError {
    constructor(expected: string, got: string) {
        super(`타입 오류: ${expected} 타입이 필요하지만 ${got} 타입이 제공됨`);
    }
}

export class UnitError extends UmniError {
    constructor(message: string) {
        super(`단위 오류: ${message}`);
    }
} 