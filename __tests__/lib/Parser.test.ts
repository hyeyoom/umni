import {Lexer} from '@/lib/Lexer';
import {Parser} from '@/lib/Parser';
import {
    AssignmentNode,
    BinaryOperationNode,
    FunctionCallNode,
    FunctionDeclarationNode,
    NaturalNode,
    RealNode,
    StringLiteralNode,
    TernaryOperationNode,
    UnaryOperationNode,
    UnitConversionNode,
    VariableNode,
    WithUnitNode
} from '@/lib/ASTNode';

describe('Parser', () => {
    const parse = (input: string) => {
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        return parser.parse();
    };

    describe('기본 표현식 파싱', () => {
        it('숫자 리터럴을 파싱할 수 있다', () => {
            const naturalAst = parse('42');
            expect(naturalAst).toBeInstanceOf(NaturalNode);
            expect((naturalAst as NaturalNode).value).toBe(42);

            const realAst = parse('3.14');
            expect(realAst).toBeInstanceOf(RealNode);
            expect((realAst as RealNode).value).toBe(3.14);
        });

        it('문자열 리터럴을 파싱할 수 있다', () => {
            const ast = parse('"Hello, World"');
            expect(ast).toBeInstanceOf(StringLiteralNode);
            expect((ast as StringLiteralNode).value).toBe('Hello, World');
        });

        it('변수 참조를 파싱할 수 있다', () => {
            const ast = parse('myVariable');
            expect(ast).toBeInstanceOf(VariableNode);
            expect((ast as VariableNode).name).toBe('myVariable');
        });
    });

    describe('연산자 파싱', () => {
        it('산술 연산을 파싱할 수 있다', () => {
            const testCases = [
                {input: '1 + 2', op: '+'},
                {input: '3 - 4', op: '-'},
                {input: '5 * 6', op: '*'},
                {input: '8 / 2', op: '/'}
            ];

            testCases.forEach(({input, op}) => {
                const ast = parse(input);
                expect(ast).toBeInstanceOf(BinaryOperationNode);
                expect((ast as BinaryOperationNode).operator).toBe(op);
            });
        });

        it('연산자 우선순위를 올바르게 처리한다', () => {
            const ast = parse('1 + 2 * 3');
            expect(ast).toBeInstanceOf(BinaryOperationNode);

            const plusNode = ast as BinaryOperationNode;
            expect(plusNode.operator).toBe('+');
            expect(plusNode.left).toBeInstanceOf(NaturalNode);

            const multiplyNode = plusNode.right as BinaryOperationNode;
            expect(multiplyNode.operator).toBe('*');
        });

        it('단항 연산자를 파싱할 수 있다', () => {
            const negativeAst = parse('-42');
            expect(negativeAst).toBeInstanceOf(UnaryOperationNode);
            expect((negativeAst as UnaryOperationNode).operator).toBe('-');

            const notAst = parse('!true');
            expect(notAst).toBeInstanceOf(UnaryOperationNode);
            expect((notAst as UnaryOperationNode).operator).toBe('!');
        });

        it('비교 연산자를 파싱할 수 있다', () => {
            const operators = ['>', '>=', '<', '<=', '==', '!='];
            operators.forEach(op => {
                const ast = parse(`5 ${op} 3`);
                expect(ast).toBeInstanceOf(BinaryOperationNode);
                expect((ast as BinaryOperationNode).operator).toBe(op);
            });
        });
    });

    describe('단위 변환 파싱', () => {
        it('단위가 있는 숫자를 파싱할 수 있다', () => {
            const ast = parse('5km');
            expect(ast).toBeInstanceOf(WithUnitNode);
            expect((ast as WithUnitNode).value).toBe(5);
            expect((ast as WithUnitNode).unit).toBe('km');
        });

        it('단위 변환 표현식을 파싱할 수 있다', () => {
            const ast = parse('5km to m');
            expect(ast).toBeInstanceOf(UnitConversionNode);

            const convNode = ast as UnitConversionNode;
            expect(convNode.targetUnit).toBe('m');

            const sourceNode = convNode.expression as WithUnitNode;
            expect(sourceNode.value).toBe(5);
            expect(sourceNode.unit).toBe('km');
        });

        it('복합 단위 변환 표현식을 파싱할 수 있다', () => {
            const ast = parse('(2km + 3km) to m');
            expect(ast).toBeInstanceOf(UnitConversionNode);
            expect((ast as UnitConversionNode).targetUnit).toBe('m');
        });
    });

    describe('함수 관련 파싱', () => {
        it('함수 선언을 파싱할 수 있다', () => {
            const ast = parse('fn add(x, y) = x + y');
            expect(ast).toBeInstanceOf(FunctionDeclarationNode);

            const funcNode = ast as FunctionDeclarationNode;
            expect(funcNode.name).toBe('add');
            expect(funcNode.parameters).toEqual(['x', 'y']);

            const bodyNode = funcNode.body as BinaryOperationNode;
            expect(bodyNode.operator).toBe('+');
        });

        it('매개변수가 없는 함수 선언을 파싱할 수 있다', () => {
            const ast = parse('fn pi() = 3.14');
            expect(ast).toBeInstanceOf(FunctionDeclarationNode);
            expect((ast as FunctionDeclarationNode).parameters).toEqual([]);
        });

        it('함수 호출을 파싱할 수 있다', () => {
            const ast = parse('add(1, 2)');
            expect(ast).toBeInstanceOf(FunctionCallNode);

            const callNode = ast as FunctionCallNode;
            expect(callNode.name).toBe('add');
            expect(callNode.args).toHaveLength(2);
            expect(callNode.args[0]).toBeInstanceOf(NaturalNode);
            expect(callNode.args[1]).toBeInstanceOf(NaturalNode);
        });

        it('중첩된 함수 호출을 파싱할 수 있다', () => {
            const ast = parse('max(min(1, 2), 3)');
            expect(ast).toBeInstanceOf(FunctionCallNode);

            const outerCall = ast as FunctionCallNode;
            expect(outerCall.name).toBe('max');
            expect(outerCall.args[0]).toBeInstanceOf(FunctionCallNode);
        });
    });

    describe('변수 할당', () => {
        it('기본 할당을 파싱할 수 있다', () => {
            const ast = parse('x = 42');
            expect(ast).toBeInstanceOf(AssignmentNode);

            const assignNode = ast as AssignmentNode;
            expect((assignNode.left as VariableNode).name).toBe('x');
            expect(assignNode.value).toBeInstanceOf(NaturalNode);
        });

        it('연쇄 할당을 파싱할 수 있다', () => {
            const ast = parse('x = y = 42');
            expect(ast).toBeInstanceOf(AssignmentNode);

            const firstAssign = ast as AssignmentNode;
            expect((firstAssign.left as VariableNode).name).toBe('x');
            expect(firstAssign.value).toBeInstanceOf(AssignmentNode);
        });
    });

    describe('에러 처리', () => {
        it('잘못된 함수 선언에 대해 에러를 발생시킨다', () => {
            expect(() => parse('fn 123() = 456')).toThrow();
            expect(() => parse('fn test(123) = 456')).toThrow();
        });

        it('잘못된 함수 호출에 대해 에러를 발생시킨다', () => {
            expect(() => parse('test(,')).toThrow();
            expect(() => parse('test(1,)')).toThrow();
        });

        it('괄호를 닫지 않는 경우 에러를 발생시킨다', () => {
            expect(() => parse('(1 + 2')).toThrow();
        });
    });

    describe('삼항 연산자 파싱', () => {
        it('기본적인 삼항 연산을 파싱할 수 있다', () => {
            const ast = parse('x > 10 ? 1 : 0');
            expect(ast).toBeInstanceOf(TernaryOperationNode);

            const ternaryNode = ast as TernaryOperationNode;
            expect(ternaryNode.condition).toBeInstanceOf(BinaryOperationNode);
            expect(ternaryNode.trueExpression).toBeInstanceOf(NaturalNode);
            expect(ternaryNode.falseExpression).toBeInstanceOf(NaturalNode);
        });

        it('중첩된 삼항 연산을 파싱할 수 있다', () => {
            const ast = parse('x > 20 ? y > 10 ? 1 : 2 : 3');
            expect(ast).toBeInstanceOf(TernaryOperationNode);
        });

        it('잘못된 삼항 연산 구문에서 에러를 발생시킨다', () => {
            expect(() => parse('x > 10 ? 1')).toThrow("Expected ':' in ternary operation");
        });
    });

    describe('단위 변환과 연산 파싱', () => {
        it('단위 변환과 나눗셈을 함께 파싱할 수 있다', () => {
            const ast = parse('40 to kb / 40');
            
            expect(ast).toBeInstanceOf(BinaryOperationNode);
            expect((ast as BinaryOperationNode).operator).toBe('/');
            
            const left = (ast as BinaryOperationNode).left;
            expect(left).toBeInstanceOf(UnitConversionNode);
            expect((left as UnitConversionNode).targetUnit).toBe('kb');
            
            const value = (left as UnitConversionNode).expression;
            expect(value).toBeInstanceOf(NaturalNode);
            expect((value as NaturalNode).value).toBe(40);
            
            const right = (ast as BinaryOperationNode).right;
            expect(right).toBeInstanceOf(NaturalNode);
            expect((right as NaturalNode).value).toBe(40);
        });
    });
});
