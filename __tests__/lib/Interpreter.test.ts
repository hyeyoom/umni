import {Lexer} from '@/lib/Lexer';
import {Parser} from '@/lib/Parser';
import {Interpreter} from '@/lib/Interpreter';
import {Environment} from '@/lib/Environment';
import {ComputedValue, LogicalValue, NaturalValue, RealValue, StringValue, WithUnitValue} from '@/lib/ComputedValue';

describe('Interpreter', () => {
    let interpreter: Interpreter;
    let environment: Environment;

    beforeEach(() => {
        environment = new Environment();
        interpreter = new Interpreter(environment);
    });

    const evaluate = (input: string): ComputedValue => {
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        return interpreter.interpret(ast);
    };

    describe('리터럴 평가', () => {
        it('숫자 리터럴을 평가할 수 있다', () => {
            expect(evaluate('42')).toEqual(new NaturalValue(42));
            expect(evaluate('3.14')).toEqual(new RealValue(3.14));
        });

        it('문자열 리터럴을 평가할 수 있다', () => {
            expect(evaluate('"Hello"')).toEqual(new StringValue('Hello'));
            expect(evaluate("'World'")).toEqual(new StringValue('World'));
        });

        it('단위가 있는 숫자를 평가할 수 있다', () => {
            expect(evaluate('5km')).toEqual(new WithUnitValue(5, 'km'));
        });
    });

    describe('산술 연산', () => {
        it('기본 산술 연산을 수행할 수 있다', () => {
            expect(evaluate('2 + 3')).toEqual(new NaturalValue(5));
            expect(evaluate('5 - 3')).toEqual(new NaturalValue(2));
            expect(evaluate('4 * 3')).toEqual(new NaturalValue(12));
            expect(evaluate('10 / 2')).toEqual(new RealValue(5));
        });

        it('혼합 타입 연산을 처리할 수 있다', () => {
            expect(evaluate('2 + 3.5')).toEqual(new RealValue(5.5));
            expect(evaluate('5.0 * 2')).toEqual(new RealValue(10));
        });

        it('단위가 있는 숫자의 연산을 처리할 수 있다', () => {
            expect(evaluate('5km + 3km')).toEqual(new WithUnitValue(8, 'km'));
            expect(evaluate('1km - 500m')).toEqual(new WithUnitValue(0.5, 'km'));
        });

        it('문자열 연산을 처리할 수 있다', () => {
            expect(evaluate('"Hello" + " " + "World"')).toEqual(new StringValue('Hello World'));
            expect(evaluate('"Ha" * 3')).toEqual(new StringValue('HaHaHa'));
        });
    });

    describe('비교 연산', () => {
        it('숫자 비교를 수행할 수 있다', () => {
            expect(evaluate('5 > 3')).toEqual(new LogicalValue(true));
            expect(evaluate('2 <= 2')).toEqual(new LogicalValue(true));
            expect(evaluate('1 == 1')).toEqual(new LogicalValue(true));
            expect(evaluate('1 != 2')).toEqual(new LogicalValue(true));
        });

        it('단위가 있는 숫자를 비교할 수 있다', () => {
            expect(evaluate('5km > 4km')).toEqual(new LogicalValue(true));
            expect(evaluate('1km == 1000m')).toEqual(new LogicalValue(true));
        });
    });

    describe('변수와 할당', () => {
        it('변수에 값을 할당하고 참조할 수 있다', () => {
            evaluate('x = 42');
            expect(evaluate('x')).toEqual(new NaturalValue(42));
        });

        it('변수에 다른 타입의 값을 할당할 수 있다', () => {
            evaluate('str = "Hello"');
            expect(evaluate('str')).toEqual(new StringValue('Hello'));

            evaluate('dist = 5km');
            expect(evaluate('dist')).toEqual(new WithUnitValue(5, 'km'));
        });

        it('정의되지 않은 변수 참조시 에러를 발생시킨다', () => {
            expect(() => evaluate('unknownVar')).toThrow('Undefined variable');
        });
    });

    describe('함수', () => {
        it('함수를 정의하고 호출할 수 있다', () => {
            evaluate('fn double(x) = x * 2');
            expect(evaluate('double(21)')).toEqual(new NaturalValue(42));
        });

        it('여러 매개변수를 가진 함수를 처리할 수 있다', () => {
            evaluate('fn add(x, y) = x + y');
            expect(evaluate('add(2, 3)')).toEqual(new NaturalValue(5));
        });

        it('함수 내에서 단위 변환을 처리할 수 있다', () => {
            evaluate('fn toMeters(x) = x to m');
            expect(evaluate('toMeters(1km)')).toEqual(new WithUnitValue(1000, 'm'));
        });

        it('중첩된 함수 호출을 처리할 수 있다', () => {
            evaluate('fn double(x) = x * 2');
            evaluate('fn quadruple(x) = double(double(x))');
            expect(evaluate('quadruple(5)')).toEqual(new NaturalValue(20));
        });

        it('잘못된 인자 개수로 함수 호출시 에러를 발생시킨다', () => {
            evaluate('fn add(x, y) = x + y');
            expect(() => evaluate('add(1)')).toThrow('Argument count mismatch');
        });

        it('정의되지 않은 함수 호출시 에러를 발생시킨다', () => {
            expect(() => evaluate('unknownFunc(42)')).toThrow('Undefined function');
        });
    });

    describe('단위 변환', () => {
        it('길이 단위를 변환할 수 있다', () => {
            expect(evaluate('5km to m')).toEqual(new WithUnitValue(5000, 'm'));
            expect(evaluate('100cm to m')).toEqual(new WithUnitValue(1, 'm'));
        });

        it('데이터 크기 단위를 변환할 수 있다', () => {
            expect(evaluate('1024kb to mb')).toEqual(new WithUnitValue(1, 'mb'));
            expect(evaluate('1gb to mb')).toEqual(new WithUnitValue(1024, 'mb'));
        });

        it('복합 단위 변환 표현식을 처리할 수 있다', () => {
            expect(evaluate('(2km + 3km) to m')).toEqual(new WithUnitValue(5000, 'm'));
        });
    });

    describe('내장 함수', () => {
        it('b64Encode/Decode 함수를 사용할 수 있다', () => {
            const encoded = evaluate('b64Encode("Hello")');
            expect(encoded).toBeInstanceOf(StringValue);
            expect(evaluate(`b64Decode("${(encoded as StringValue).value}")`))
                .toEqual(new StringValue('Hello'));
        });

        it('type 함수를 사용할 수 있다', () => {
            expect(evaluate('type(42)')).toEqual(new StringValue('integer'));
            expect(evaluate('type(3.14)')).toEqual(new StringValue('double'));
            expect(evaluate('type("Hello")')).toEqual(new StringValue('string'));
            expect(evaluate('type(5km)')).toEqual(new StringValue('double with unit'));
        });
    });

    describe('에러 처리', () => {
        it('0으로 나누기 시도시 에러를 발생시킨다', () => {
            expect(() => evaluate('10 / 0')).toThrow('Division by zero');
        });

        it('타입이 맞지 않는 연산시 에러를 발생시킨다', () => {
            expect(() => evaluate('"Hello" - "World"')).toThrow('Invalid operands');
            expect(() => evaluate('42 * "Hello"')).toThrow('Invalid operands');
        });
    });

    describe('상수', () => {
        it('상수 값을 참조할 수 있다', () => {
            expect(evaluate('pi')).toEqual(new RealValue(Math.PI));
            expect(evaluate('e')).toEqual(new RealValue(Math.E));
        });

        it('상수에 값을 할당하려고 하면 에러를 발생시킨다', () => {
            expect(() => evaluate('pi = 3')).toThrow("Cannot assign to constant 'pi'");
            expect(() => evaluate('e = 2.7')).toThrow("Cannot assign to constant 'e'");
        });

        it('상수를 함수로 선언하려고 하면 에러를 발생시킨다', () => {
            expect(() => evaluate('fn pi() = 3.14')).toThrow("Cannot declare constant 'pi' as function");
        });
    });

    describe('삼각함수', () => {
        it('기본적인 삼각함수 값을 계산할 수 있다', () => {
            expect(evaluate('sin(pi)')).toEqual(new RealValue(0));
            expect(evaluate('sin(pi/2)')).toEqual(new RealValue(1));
            expect(evaluate('cos(pi)')).toEqual(new RealValue(-1));
            expect(evaluate('cos(pi/2)')).toEqual(new RealValue(0));
        });
    });

    describe('삼항 연산', () => {
        beforeEach(() => {
            evaluate('x = 15000');
            evaluate('y = 5000');
        });

        it('기본적인 삼항 연산을 수행할 수 있다', () => {
            expect(evaluate('x > 10000 ? x * 0.97 : x * 0.8')).toEqual(new RealValue(14550));
            expect(evaluate('y > 10000 ? y * 0.97 : y * 0.8')).toEqual(new RealValue(4000));
        });

        it('중첩된 삼항 연산을 수행할 수 있다', () => {
            expect(evaluate('x > 20000 ? 1 : x > 10000 ? 2 : 3')).toEqual(new NaturalValue(2));
        });

        it('다양한 타입의 결과를 반환할 수 있다', () => {
            expect(evaluate('true ? "yes" : "no"')).toEqual(new StringValue("yes"));
            expect(evaluate('false ? 1km : 2km')).toEqual(new WithUnitValue(2, 'km'));
        });

        it('조건식이 불리언이 아닐 경우 에러를 발생시킨다', () => {
            expect(() => evaluate('42 ? 1 : 0')).toThrow('Condition must evaluate to a boolean value');
        });
    });

    describe('단위 변환과 연산', () => {
        it('단위 변환 후 나눗셈을 수행할 수 있다', () => {
            const result = evaluate('40 to kb / 40');
            expect(result).toEqual(new WithUnitValue(1, 'kb'));
            
            const result2 = evaluate('1000 to mb / 2');
            expect(result2).toEqual(new WithUnitValue(500, 'mb'));
        });
    });
});
