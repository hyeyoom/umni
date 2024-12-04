import { TokenHandler } from '@/lib/handlers/TokenHandler';
import { NaturalToken, RealToken, WithUnitToken, StringLiteralToken, IdentifierToken, FunctionDeclarationToken, SemanticOperatorToken, SemanticOperatorSymbol } from '@/lib/tokens';

describe('TokenHandler', () => {
    let handler: TokenHandler;

    beforeEach(() => {
        handler = new TokenHandler();
    });

    describe('handleNumber', () => {
        it('자연수를 처리할 수 있다', () => {
            const input = '42';
            const position = { value: 0 };
            
            const token = handler.handleNumber(input, position);
            
            expect(token).toBeInstanceOf(NaturalToken);
            expect((token as NaturalToken).value).toBe(42);
            expect(position.value).toBe(2);
        });

        it('실수를 처리할 수 있다', () => {
            const input = '3.14';
            const position = { value: 0 };
            
            const token = handler.handleNumber(input, position);
            
            expect(token).toBeInstanceOf(RealToken);
            expect((token as RealToken).value).toBe(3.14);
            expect(position.value).toBe(4);
        });

        it('잘못된 숫자 형식에 대해 에러를 발생시킨다', () => {
            const input = '3.14.15';
            const position = { value: 0 };
            
            expect(() => handler.handleNumber(input, position))
                .toThrow('Invalid number format');
        });

        it('숫자와 단위를 함께 처리할 수 있다', () => {
            const input = '5km';
            const position = { value: 0 };
            
            const token = handler.handleNumber(input, position);
            
            expect(token).toBeInstanceOf(WithUnitToken);
            expect((token as WithUnitToken).value).toBe(5);
            expect((token as WithUnitToken).unit).toBe('km');
            expect(position.value).toBe(3);
        });
    });

    describe('handleString', () => {
        it('큰따옴표로 둘러싸인 문자열을 처리할 수 있다', () => {
            const input = '"Hello, World"';
            const position = { value: 0 };
            
            const token = handler.handleString(input, position);
            
            expect(token).toBeInstanceOf(StringLiteralToken);
            expect((token as StringLiteralToken).value).toBe('Hello, World');
            expect(position.value).toBe(input.length);
        });

        it('작은따옴표로 둘러싸인 문자열을 처리할 수 있다', () => {
            const input = "'Hello, World'";
            const position = { value: 0 };
            
            const token = handler.handleString(input, position);
            
            expect(token).toBeInstanceOf(StringLiteralToken);
            expect((token as StringLiteralToken).value).toBe('Hello, World');
            expect(position.value).toBe(input.length);
        });

        it('종료되지 않은 문자열에 대해 에러를 발생시킨다', () => {
            const input = '"Hello, World';
            const position = { value: 0 };
            
            expect(() => handler.handleString(input, position))
                .toThrow('Unterminated string literal');
        });
    });

    describe('handleIdentifier', () => {
        it('영문 식별자를 처리할 수 있다', () => {
            const input = 'variable123';
            const position = { value: 0 };
            
            const token = handler.handleIdentifier(input, position);
            
            expect(token).toBeInstanceOf(IdentifierToken);
            expect((token as IdentifierToken).name).toBe('variable123');
            expect(position.value).toBe(input.length);
        });

        it('한글 식별자를 처리할 수 있다', () => {
            const input = '원의넓이';
            const position = { value: 0 };
            
            const token = handler.handleIdentifier(input, position);
            
            expect(token).toBeInstanceOf(IdentifierToken);
            expect((token as IdentifierToken).name).toBe('원의넓이');
            expect(position.value).toBe(input.length);
        });

        it('키워드를 처리할 수 있다', () => {
            const input = 'fn';
            const position = { value: 0 };
            
            const token = handler.handleIdentifier(input, position);
            
            expect(token).toBeInstanceOf(FunctionDeclarationToken);
        });

        it('to 키워드를 처리할 수 있다', () => {
            const input = 'to';
            const position = { value: 0 };
            
            const token = handler.handleIdentifier(input, position);
            
            expect(token).toBeInstanceOf(SemanticOperatorToken);
            expect((token as SemanticOperatorToken).symbol).toBe(SemanticOperatorSymbol.TO);
        });
    });
}); 