import {Environment} from '@/lib/Environment';
import {Suggestion} from "@/app/types/suggestion";

export const STATIC_SUGGESTIONS: Suggestion[] = [
    {text: 'fn', type: 'keyword', description: 'Function declaration'},
    {text: 'to', type: 'keyword', description: 'Unit conversion'},
    {text: 'times', type: 'keyword', description: 'Repeat operation'},
    {text: 'km', type: 'unit', description: 'Kilometers'},
    {text: 'm', type: 'unit', description: 'Meters'},
    {text: 'cm', type: 'unit', description: 'Centimeters'},
    {text: 'mm', type: 'unit', description: 'Millimeters'},
    {text: 'kb', type: 'unit', description: 'Kilobytes'},
    {text: 'mb', type: 'unit', description: 'Megabytes'},
    {text: 'gb', type: 'unit', description: 'Gigabytes'},
];

export function getAllSuggestions(environment: Environment): Suggestion[] {
    const suggestions = [...STATIC_SUGGESTIONS];

    // 변수 추가
    environment.variables.forEach((value, name) => {
        suggestions.push({
            text: name,
            type: 'variable',
            description: `User defined variable (${value.toString()})`
        });
    });

    // 상수 추가
    environment.constants.forEach((value, name) => {
        suggestions.push({
            text: name,
            type: 'constant',
            description: `Constant (${value.toString()})`
        });
    });

    // 사용자 정의 함수 추가
    environment.functions.forEach((func, name) => {
        const params = func.parameters.join(', ');
        suggestions.push({
            text: name,
            type: 'function',
            description: `Function (${params})`
        });
    });

    // 내장 함수 추가
    environment.builtInFunctions.forEach((_, name) => {
        suggestions.push({
            text: name,
            type: 'function',
            description: 'Built-in function'
        });
    });

    return suggestions;
}
