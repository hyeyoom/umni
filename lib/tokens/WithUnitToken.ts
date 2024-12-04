// WithUnitToken.ts
import { Token } from './Token';

export class WithUnitToken extends Token {
    static readonly SUPPORT_UNITS = new Set(['km', 'm', 'cm', 'mm', 'kb', 'mb', 'gb']);

    constructor(public value: number, public unit: string) {
        super();
        if (!WithUnitToken.SUPPORT_UNITS.has(unit)) {
            throw new Error('Unsupported unit');
        }
    }
}
