import {TokenHandler} from '@/lib/handlers/TokenHandler';
import {
    AssignToken,
    CommaToken,
    IdentifierToken,
    LeftParenToken,
    NaturalToken,
    RealToken,
    StringLiteralToken,
    SymbolicOperatorToken,
    WithUnitToken
} from '@/lib/tokens';

describe('TokenHandler', () => {
    let handler: TokenHandler;

    beforeEach(() => {
        handler = new TokenHandler();
    });

    describe('handleNumber', () => {
        it('자연수를 처리할 수 있다', () => {
            const input = '42';
            const position = {value: 0};

            const token = handler.handleNumber(input, position);

            expect(token).toBeInstanceOf(NaturalToken);
            expect((token as NaturalToken).value).toBe(42);
            expect(position.value).toBe(2);
        });

        it('실수를 처리할 수 있다', () => {
            const input = '3.14';
            const position = {value: 0};

            const token = handler.handleNumber(input, position);

            expect(token).toBeInstanceOf(RealToken);
            expect((token as RealToken).value).toBe(3.14);
            expect(position.value).toBe(4);
        });

        it('잘못된 숫자 형식에 대해 에러를 발생시킨다', () => {
            const input = '3.14.15';
            const position = {value: 0};

            expect(() => handler.handleNumber(input, position))
                .toThrow('Invalid number format');
        });

        it('숫자와 단위를 함께 처리할 수 있다', () => {
            const input = '5km';
            const position = {value: 0};

            const token = handler.handleNumber(input, position);

            expect(token).toBeInstanceOf(WithUnitToken);
            expect((token as WithUnitToken).value).toBe(5);
            expect((token as WithUnitToken).unit).toBe('km');
            expect(position.value).toBe(3);
        });

        describe('단위 처리', () => {
            it('붙여쓴 단위를 처리할 수 있다', () => {
                const input = '10gb';
                const position = {value: 0};

                const token = handler.handleNumber(input, position);

                expect(token).toBeInstanceOf(WithUnitToken);
                expect((token as WithUnitToken).value).toBe(10);
                expect((token as WithUnitToken).unit).toBe('gb');
            });

            it('띄어쓴 단위는 별도의 토큰으로 처리한다', () => {
                const input = '10 gb';
                const position = {value: 0};

                const token = handler.handleNumber(input, position);

                expect(token).toBeInstanceOf(NaturalToken);
                expect((token as NaturalToken).value).toBe(10);
                expect(position.value).toBe(2); // 숫자 다음의 공백 전까지만 처리
            });

            it('언더스코어가 포함된 숫자를 처리할 수 있다', () => {
                const testCases = [
                    {input: '100_000', expected: 100000},
                    {input: '1_000_000', expected: 1000000},
                    {input: '1_234.567_89', expected: 1234.56789}
                ];

                testCases.forEach(({input, expected}) => {
                    const position = {value: 0};
                    const token = handler.handleNumber(input, position);

                    if (input.includes('.')) {
                        expect(token).toBeInstanceOf(RealToken);
                        expect((token as RealToken).value).toBe(expected);
                    } else {
                        expect(token).toBeInstanceOf(NaturalToken);
                        expect((token as NaturalToken).value).toBe(expected);
                    }
                });
            });

            it('잘못된 언더스코어 사용에 대해 에러를 발생시킨다', () => {
                const invalidCases = ['_100', '100__000'];

                invalidCases.forEach(input => {
                    const position = {value: 0};
                    expect(() => handler.handleNumber(input, position))
                        .toThrow('Invalid number format');
                });
            });

            it('올바른 언더스코어 사용을 처리할 수 있다', () => {
                const testCases = [
                    {input: '1_000', expected: 1000},
                    {input: '1_000_000', expected: 1000000},
                    {input: '1_234.567_89', expected: 1234.56789},
                    {input: '100_', expected: 100}
                ];

                testCases.forEach(({input, expected}) => {
                    const position = {value: 0};
                    const token = handler.handleNumber(input, position);

                    if (input.includes('.')) {
                        expect(token).toBeInstanceOf(RealToken);
                        expect((token as RealToken).value).toBe(expected);
                    } else {
                        expect(token).toBeInstanceOf(NaturalToken);
                        expect((token as NaturalToken).value).toBe(expected);
                    }
                });
            });
        });
    });

    describe('handleString', () => {
        it('큰따옴표로 둘러싸인 문자열을 처리할 수 있다', () => {
            const input = '"Hello, World"';
            const position = {value: 0};

            const token = handler.handleString(input, position);

            expect(token).toBeInstanceOf(StringLiteralToken);
            expect((token as StringLiteralToken).value).toBe('Hello, World');
            expect(position.value).toBe(input.length);
        });

        it('작은따옴표로 둘러싸인 문자열을 처리할 수 있다', () => {
            const input = "'Hello, World'";
            const position = {value: 0};

            const token = handler.handleString(input, position);

            expect(token).toBeInstanceOf(StringLiteralToken);
            expect((token as StringLiteralToken).value).toBe('Hello, World');
            expect(position.value).toBe(input.length);
        });

        it('종료되지 않은 문자열에 대해 에러를 발생시킨다', () => {
            const input = '"Hello, World';
            const position = {value: 0};

            expect(() => handler.handleString(input, position))
                .toThrow('Unterminated string literal');
        });
    });

    describe('handleIdentifier', () => {
        it('기본적인 식별자를 처리할 수 있다', () => {
            const input = 'myVar';
            const position = { value: 0 };

            const token = handler.handleIdentifier(input, position);

            expect(token).toBeInstanceOf(IdentifierToken);
            expect((token as IdentifierToken).name).toBe('myVar');
        });

        it('언더스코어로 시작하는 식별자를 처리할 수 있다', () => {
            const testCases = ['_var', '_123', '_myVar'];

            testCases.forEach(input => {
                const position = { value: 0 };
                const token = handler.handleIdentifier(input, position);

                expect(token).toBeInstanceOf(IdentifierToken);
                expect((token as IdentifierToken).name).toBe(input);
            });
        });

        it('한글 식별자를 처리할 수 있다', () => {
            const input = '변수_1';
            const position = { value: 0 };

            const token = handler.handleIdentifier(input, position);

            expect(token).toBeInstanceOf(IdentifierToken);
            expect((token as IdentifierToken).name).toBe('변수_1');
        });

        it('잘못된 식별자 형식에 대해 에러를 발생시킨다', () => {
            const invalidCases = ['1var', '123_var', '@var'];

            invalidCases.forEach(input => {
                const position = { value: 0 };
                expect(() => handler.handleIdentifier(input, position))
                    .toThrow('Invalid identifier format');
            });
        });

        it('공백이 포함된 식별자를 처리할 수 있다', () => {
            const testCases = [
                { input: 'my var', expected: 'my var' },
                { input: 'hello   world', expected: 'hello   world' },
                { input: '안녕 세상', expected: '안녕 세상' }
            ];

            testCases.forEach(({input, expected}) => {
                const position = { value: 0 };
                const token = handler.handleIdentifier(input, position);

                expect(token).toBeInstanceOf(IdentifierToken);
                expect((token as IdentifierToken).name).toBe(expected);
            });
        });

        it('키워드가 포함된 식별자는 키워드 전까지만 처리한다', () => {
            const input = 'my fn var';
            const position = { value: 0 };

            const token = handler.handleIdentifier(input, position);

            expect(token).toBeInstanceOf(IdentifierToken);
            expect((token as IdentifierToken).name).toBe('my');
            expect(position.value).toBe(2);
        });
    });

    describe('handleOperator', () => {
        it('단일 문자 연산자를 처리할 수 있다', () => {
            const operators = '+-*/';
            operators.split('').forEach(op => {
                const position = {value: 0};
                const token = handler.handleOperator(op, position);

                expect(token).toBeInstanceOf(SymbolicOperatorToken);
                expect((token as SymbolicOperatorToken).symbol).toBe(op);
                expect(position.value).toBe(1);
            });
        });

        it('두 문자 연산자를 처리할 수 있다', () => {
            const operators = ['==', '!=', '>=', '<='];
            operators.forEach(op => {
                const position = {value: 0};
                const token = handler.handleOperator(op, position);

                expect(token).toBeInstanceOf(SymbolicOperatorToken);
                expect((token as SymbolicOperatorToken).symbol).toBe(op);
                expect(position.value).toBe(2);
            });
        });

        it('할당 연산자를 처리할 수 있다', () => {
            const input = '=';
            const position = {value: 0};

            const token = handler.handleOperator(input, position);

            expect(token).toBeInstanceOf(AssignToken);
            expect(position.value).toBe(1);
        });
    });

    describe('handlePunctuation', () => {
        it('괄호를 처리할 수 있다', () => {
            const input = '(';
            const position = {value: 0};

            const token = handler.handlePunctuation(input, position);

            expect(token).toBeInstanceOf(LeftParenToken);
            expect(position.value).toBe(1);
        });

        it('쉼표를 처리할 수 있다', () => {
            const input = ',';
            const position = {value: 0};

            const token = handler.handlePunctuation(input, position);

            expect(token).toBeInstanceOf(CommaToken);
            expect(position.value).toBe(1);
        });

        it('삼항 연산자 기호를 처리할 수 있다', () => {
            const input = '?';
            const position = {value: 0};

            const token = handler.handlePunctuation(input, position);

            expect(token).toBeInstanceOf(SymbolicOperatorToken);
            expect((token as SymbolicOperatorToken).symbol).toBe('?');
            expect(position.value).toBe(1);
        });
    });
});
