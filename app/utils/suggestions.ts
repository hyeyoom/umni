import {Environment} from '@/lib/Environment';
import {Suggestion} from "@/app/types/suggestion";

export const STATIC_SUGGESTIONS: Suggestion[] = [
    {text: 'fn', type: 'keyword', description: '함수 선언'},
    {text: 'to', type: 'keyword', description: '단위 변환'},
    {text: 'times', type: 'keyword', description: '반복'},
    {text: 'km', type: 'unit', description: '킬로미터'},
    {text: 'm', type: 'unit', description: '미터'},
    {text: 'cm', type: 'unit', description: '센티미터'},
    {text: 'mm', type: 'unit', description: '밀리미터'},
    {text: 'kb', type: 'unit', description: '킬로바이트'},
    {text: 'mb', type: 'unit', description: '메가바이트'},
    {text: 'gb', type: 'unit', description: '기가바이트'},
];

export function getAllSuggestions(environment: Environment): Suggestion[] {
    const suggestions = [...STATIC_SUGGESTIONS];

    // 변수 추가
    environment.variables.forEach((value, name) => {
        suggestions.push({
            text: name,
            type: 'variable',
            description: `사용자 정의 변수 (${value.toString()})`
        });
    });

    // 상수 추가
    environment.constants.forEach((value, name) => {
        suggestions.push({
            text: name,
            type: 'constant',
            description: `상수 (${value.toString()})`
        });
    });

    // 사용자 정의 함수 추가
    environment.functions.forEach((func, name) => {
        const params = func.parameters.join(', ');
        suggestions.push({
            text: name,
            type: 'function',
            description: `함수 (${params})`
        });
    });

    // 내장 함수 추가
    environment.builtInFunctions.forEach((_, name) => {
        suggestions.push({
            text: name,
            type: 'function',
            description: '내장 함수'
        });
    });

    return suggestions;
}
