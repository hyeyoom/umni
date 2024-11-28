export interface Suggestion {
    text: string;
    type: 'keyword' | 'function' | 'unit' | 'variable';
    description?: string;
} 