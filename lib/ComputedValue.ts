// ComputedValue.ts

export abstract class ComputedValue {
    toString(): string {
        return '';
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComputedValue {
    export abstract class Number extends ComputedValue {
    }

    export class Real extends Number {
        constructor(public value: number) {
            super();
        }

        toString(): string {
            return ComputedValue.formatNumber(this.value);
        }
    }

    export class Natural extends Number {
        constructor(public value: number) {
            super();
        }

        toString(): string {
            return ComputedValue.formatNumber(this.value);
        }
    }

    export class WithUnit extends Number {
        constructor(public value: number, public unit: string) {
            super();
        }

        toString(): string {
            return `${ComputedValue.formatNumber(this.value)}${this.unit}`;
        }
    }

    export class StringValue extends ComputedValue {
        constructor(public value: string) {
            super();
        }

        toString(): string {
            return this.value;
        }
    }

    export class FunctionIsDefined extends ComputedValue {
        toString(): string {
            return 'function';
        }
    }

    export function formatNumber(num: number): string {
        const isNegative = num < 0;
        const absoluteNum = Math.abs(num);

        const [integerPart, decimalPartRaw] = absoluteNum.toString().split('.');
        const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        let formattedDecimal = '';
        if (decimalPartRaw !== undefined && decimalPartRaw.length > 0) {
            formattedDecimal = '.' + decimalPartRaw.slice(0, 4);
        }

        return (isNegative ? '-' : '') + integerWithCommas + formattedDecimal;
    }
}
