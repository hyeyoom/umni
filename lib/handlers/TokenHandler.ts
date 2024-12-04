import { Token, NaturalToken, RealToken, WithUnitToken } from '@/lib/tokens';

export class TokenHandler {
    handleNumber(input: string, position: { value: number }): Token {
        const start = position.value;
        let hasDot = false;
        
        while (position.value < input.length) {
            const char = input[position.value];
            if (char === '.') {
                if (hasDot) {
                    throw new Error('Invalid number format');
                }
                hasDot = true;
            } else if (!/[0-9]/.test(char)) {
                break;
            }
            position.value++;
        }

        const numberStr = input.substring(start, position.value);
        const value = Number(numberStr);

        const unitStart = position.value;
        while (position.value < input.length && /[a-zA-Z]/.test(input[position.value])) {
            position.value++;
        }

        if (position.value > unitStart) {
            const unit = input.substring(unitStart, position.value);
            return new WithUnitToken(value, unit);
        }

        return hasDot ? new RealToken(value) : new NaturalToken(value);
    }
} 