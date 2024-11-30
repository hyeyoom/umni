// ComputedValue.ts
export abstract class ComputedValue {
    abstract getType(): string;
    
    toString(): string {
        return '';
    }

    isCompatibleWith(other: ComputedValue): boolean {
        return this.getType() === other.getType();
    }
}

export abstract class NumberValue extends ComputedValue {
}

export class RealValue extends NumberValue {
    constructor(public value: number) {
        super();
    }

    getType(): string {
        return 'double';
    }

    toString(): string {
        return formatNumber(this.value);
    }
}

export class NaturalValue extends NumberValue {
    constructor(public value: number) {
        super();
    }

    getType(): string {
        return 'integer';
    }

    toString(): string {
        return formatNumber(this.value);
    }
}

export class WithUnitValue extends NumberValue {
    constructor(public value: number, public unit: string) {
        super();
    }

    getType(): string {
        return 'double with unit';
    }

    toString(): string {
        return `${formatNumber(this.value)}${this.unit}`;
    }
}

export class StringValue extends ComputedValue {
    constructor(public value: string) {
        super();
    }

    getType(): string {
        return 'string';
    }

    toString(): string {
        return this.value;
    }
}

export class LogicalValue extends ComputedValue {
    constructor(public value: boolean) {
        super();
    }

    getType(): string {
        return 'boolean';
    }

    toString(): string {
        return this.value.toString();
    }
}

export class FunctionIsDefined extends ComputedValue {
    getType(): string {
        return 'function';
    }

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
