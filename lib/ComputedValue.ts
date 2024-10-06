// ComputedValue.ts
export abstract class ComputedValue {
    toString(): string {
        return '';
    }
}

export abstract class NumberValue extends ComputedValue {
}

export class RealValue extends NumberValue {
    constructor(public value: number) {
        super();
    }

    toString(): string {
        return formatNumber(this.value);
    }
}

export class NaturalValue extends NumberValue {
    constructor(public value: number) {
        super();
    }

    toString(): string {
        return formatNumber(this.value);
    }
}

export class WithUnitValue extends NumberValue {
    constructor(public value: number, public unit: string) {
        super();
    }

    toString(): string {
        return `${formatNumber(this.value)}${this.unit}`;
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

export class LogicalValue extends ComputedValue {
    constructor(public value: boolean) {
        super();
    }

    toString(): string {
        return this.value.toString();
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
