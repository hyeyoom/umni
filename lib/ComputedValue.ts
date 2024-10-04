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
            return this.value.toString();
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

    export class NoOp extends ComputedValue {
        toString(): string {
            return '';
        }
    }

    export function formatNumber(value: number): string {
        return value.toString();
    }
}
