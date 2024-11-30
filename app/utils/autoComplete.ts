import {Suggestion} from '../types/suggestion';
import {getAllSuggestions} from './suggestions';
import {Environment} from '@/lib/Environment';

export function filterSuggestions(
    currentWord: string,
    environment: Environment
): Suggestion[] {
    if (!currentWord) return [];

    if (/^\d+$/.test(currentWord)) {
        return getAllSuggestions(environment).filter(s => s.type === 'unit');
    }

    if (/^\d+[a-zA-Z]+$/.test(currentWord)) {
        const unitPart = currentWord.match(/[a-zA-Z]+$/)?.[0] || '';
        return getAllSuggestions(environment).filter(s =>
            s.type === 'unit' && s.text.toLowerCase().startsWith(unitPart.toLowerCase())
        );
    }

    return getAllSuggestions(environment).filter(s =>
        s.text.toLowerCase().startsWith(currentWord.toLowerCase())
    );
}

export function handleSuggestionSelect(
    suggestion: Suggestion,
    code: string,
    cursorPos: number,
    currentWord: string
): string {
    const beforeCursor = code.slice(0, cursorPos);
    const afterCursor = code.slice(cursorPos);

    if (/^\d+$/.test(currentWord)) {
        // 숫자만 있는 경우, 숫자를 유지하고 단위를 추가
        return beforeCursor + suggestion.text + afterCursor;
    }

    if (/^\d+[a-zA-Z]+$/.test(currentWord)) {
        // 숫자+단위가 있는 경우, 숫자는 유지하고 단위만 교체
        const numberPart = currentWord.match(/^\d+/)?.[0] || '';
        const wordStart = cursorPos - currentWord.length;
        return code.slice(0, wordStart) + numberPart + suggestion.text + afterCursor;
    }

    // 일반적인 경우
    const wordStart = cursorPos - currentWord.length;
    return code.slice(0, wordStart) + suggestion.text + afterCursor;
}
