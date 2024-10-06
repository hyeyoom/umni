// WithUnitToken.ts
import { NumberToken } from './NumberToken';

export class WithUnitToken extends NumberToken {
    static SUPPORT_UNITS = new Set(['m', 'cm', 'mm', 'km', 'kb', 'mb', 'gb']);

    constructor(public value: number, public unit: string) {
        super();
        if (!WithUnitToken.SUPPORT_UNITS.has(unit)) {
            throw new Error(`Unsupported unit: ${unit}`);
        }
    }
}
