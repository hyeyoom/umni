import { TokenHandler } from '@/lib/handlers/TokenHandler';
import { NaturalToken, RealToken, WithUnitToken } from '@/lib/tokens';

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
}); 