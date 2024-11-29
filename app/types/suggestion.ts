export interface Suggestion {
    text: string;
    type: 'keyword' | 'unit' | 'variable' | 'function' | 'constant';
    description?: string;
}
