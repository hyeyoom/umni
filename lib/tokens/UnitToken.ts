// UnitToken.ts
import { Token } from './Token';

export class UnitToken extends Token {
    static SUPPORT_UNITS = new Set(['m', 'cm', 'mm', 'km', 'kb', 'mb', 'gb']);

    constructor(public name: string) {
        super();
        if (!UnitToken.SUPPORT_UNITS.has(name)) {
            throw new Error(`Unsupported unit: ${name}`);
        }
    }
}
