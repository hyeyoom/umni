import {
    AssignToken,
    CommaToken,
    EOFToken,
    FunctionDeclarationToken,
    IdentifierToken,
    LeftParenToken,
    NaturalToken,
    RealToken,
    RightParenToken,
    SemanticOperatorToken,
    SemanticOperatorSymbol,
    StringLiteralToken,
    SymbolicOperatorToken,
    UnitToken,
    WithUnitToken
} from '@/lib/tokens';
import { Lexer } from '@/lib/Lexer';

describe('Lexer', () => {
    describe('숫자 토큰화', () => {
        it('자연수를 토큰화할 수 있다', () => {
            const lexer = new Lexer('42');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(NaturalToken);
            expect((tokens[0] as NaturalToken).value).toBe(42);
        });

        it('실수를 토큰화할 수 있다', () => {
            const lexer = new Lexer('3.14');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(RealToken);
            expect((tokens[0] as RealToken).value).toBe(3.14);
        });

        it('잘못된 숫자 형식에 대해 에러를 발생시킨다', () => {
            expect(() => new Lexer('3.14.15').tokenize()).toThrow('Invalid number format');
            expect(() => new Lexer('3..14').tokenize()).toThrow('Invalid number format');
        });
    });

    describe('단위 토큰화', () => {
        it('단위가 있는 숫자를 토큰화할 수 있다', () => {
            const testCases = [
                { input: '5km', value: 5, unit: 'km' },
                { input: '3.14m', value: 3.14, unit: 'm' },
                { input: '1024kb', value: 1024, unit: 'kb' },
            ];

            testCases.forEach(({ input, value, unit }) => {
                const lexer = new Lexer(input);
                const tokens = lexer.tokenize();
                expect(tokens[0]).toBeInstanceOf(WithUnitToken);
                expect((tokens[0] as WithUnitToken).value).toBe(value);
                expect((tokens[0] as WithUnitToken).unit).toBe(unit);
            });
        });

        it('지원하지 않는 단위에 대해 에러를 발생시킨다', () => {
            expect(() => new Lexer('5xyz').tokenize()).toThrow('Unsupported unit');
        });
    });

    describe('문자열 토큰화', () => {
        it('작은따옴표로 둘러싸인 문자열을 토큰화할 수 있다', () => {
            const lexer = new Lexer("'Hello World'");
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(StringLiteralToken);
            expect((tokens[0] as StringLiteralToken).value).toBe('Hello World');
        });

        it('큰따옴표로 둘러싸인 문자열을 토큰화할 수 있다', () => {
            const lexer = new Lexer('"Hello World"');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(StringLiteralToken);
            expect((tokens[0] as StringLiteralToken).value).toBe('Hello World');
        });

        it('종료되지 않은 문자열에 대해 에러를 발생시킨다', () => {
            expect(() => new Lexer('"Hello').tokenize()).toThrow('Unterminated string literal');
            expect(() => new Lexer('\'World').tokenize()).toThrow('Unterminated string literal');
        });
    });

    describe('연산자와 구두점 토큰화', () => {
        it('산술 연산자를 토큰화할 수 있다', () => {
            const operators = '+-*/';
            operators.split('').forEach(op => {
                const lexer = new Lexer(op);
                const tokens = lexer.tokenize();
                expect(tokens[0]).toBeInstanceOf(SymbolicOperatorToken);
                expect((tokens[0] as SymbolicOperatorToken).symbol).toBe(op);
            });
        });

        it('비교 연산자를 토큰화할 수 있다', () => {
            const testCases = ['==', '!=', '>', '<', '>=', '<='];
            testCases.forEach(op => {
                const lexer = new Lexer(op);
                const tokens = lexer.tokenize();
                expect(tokens[0]).toBeInstanceOf(SymbolicOperatorToken);
                expect((tokens[0] as SymbolicOperatorToken).symbol).toBe(op);
            });
        });

        it('괄호와 쉼표를 토큰화할 수 있다', () => {
            const lexer = new Lexer('(x, y)');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(LeftParenToken);
            expect(tokens[1]).toBeInstanceOf(IdentifierToken);
            expect(tokens[2]).toBeInstanceOf(CommaToken);
            expect(tokens[3]).toBeInstanceOf(IdentifierToken);
            expect(tokens[4]).toBeInstanceOf(RightParenToken);
        });

        it('할당 연산자를 토큰화할 수 있다', () => {
            const lexer = new Lexer('x = 42');
            const tokens = lexer.tokenize();
            expect(tokens[1]).toBeInstanceOf(AssignToken);
        });
    });

    describe('키워드와 식별자 토큰화', () => {
        it('키워드를 토큰화할 수 있다', () => {
            const lexer = new Lexer('to times fn');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(SemanticOperatorToken);
            expect((tokens[0] as SemanticOperatorToken).symbol).toBe(SemanticOperatorSymbol.TO);
            expect(tokens[1]).toBeInstanceOf(SemanticOperatorToken);
            expect((tokens[1] as SemanticOperatorToken).symbol).toBe(SemanticOperatorSymbol.TIMES);
            expect(tokens[2]).toBeInstanceOf(FunctionDeclarationToken);
        });

        it('한글 식별자를 토큰화할 수 있다', () => {
            const lexer = new Lexer('원의넓이');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(IdentifierToken);
            expect((tokens[0] as IdentifierToken).name).toBe('원의넓이');
        });

        it('영문 식별자를 토큰화할 수 있다', () => {
            const lexer = new Lexer('circleArea');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(IdentifierToken);
            expect((tokens[0] as IdentifierToken).name).toBe('circleArea');
        });

        it('숫자가 포함된 식별자를 토큰화할 수 있다', () => {
            const lexer = new Lexer('area51');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(IdentifierToken);
            expect((tokens[0] as IdentifierToken).name).toBe('area51');
        });
    });

    describe('복합 표현식 토큰화', () => {
        it('함수 선언을 토큰화할 수 있다', () => {
            const lexer = new Lexer('fn circle_area(r) = pi * r * r');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(FunctionDeclarationToken);
            expect(tokens[1]).toBeInstanceOf(IdentifierToken);
            expect(tokens[2]).toBeInstanceOf(LeftParenToken);
            expect(tokens[3]).toBeInstanceOf(IdentifierToken);
            expect(tokens[4]).toBeInstanceOf(RightParenToken);
            expect(tokens[5]).toBeInstanceOf(AssignToken);
        });

        it('단위 변환 표현식을 토큰화할 수 있다', () => {
            const lexer = new Lexer('5km to m');
            const tokens = lexer.tokenize();
            expect(tokens[0]).toBeInstanceOf(WithUnitToken);
            expect(tokens[1]).toBeInstanceOf(SemanticOperatorToken);
            expect(tokens[2]).toBeInstanceOf(UnitToken);
        });
    });

    it('모든 토큰화 결과는 EOF 토큰으로 끝난다', () => {
        const testCases = ['42', 'x = 1', 'fn test() = 1', '5km to m'];
        testCases.forEach(input => {
            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();
            expect(tokens[tokens.length - 1]).toBeInstanceOf(EOFToken);
        });
    });
});
