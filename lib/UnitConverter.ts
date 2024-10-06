// UnitConverter.ts
export class UnitConverter {
    private static unitConversion: { [key: string]: number } = {
        m: 1.0,
        km: 1000.0,
        cm: 0.01,
        mm: 0.001,
        kb: 1024.0,
        mb: 1024.0 * 1024,
        gb: 1024.0 * 1024 * 1024,
    };

    static convert(value: number, sourceUnit: string, targetUnit: string): number {
        const sourceFactor = this.unitConversion[sourceUnit];
        const targetFactor = this.unitConversion[targetUnit];
        if (sourceFactor === undefined) throw new Error(`Unknown unit: ${sourceUnit}`);
        if (targetFactor === undefined) throw new Error(`Unknown unit: ${targetUnit}`);
        return (value * sourceFactor) / targetFactor;
    }

    static isSupported(unit: string): boolean {
        return this.unitConversion.hasOwnProperty(unit);
    }
}
