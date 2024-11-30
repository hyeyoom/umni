export function getCurrentWord(textarea: HTMLTextAreaElement | null): string {
    if (!textarea) return '';

    const cursorPosition = textarea.selectionStart;
    const text = textarea.value;
    const textBeforeCursor = text.slice(0, cursorPosition);

    // 숫자 뒤에 오는 단어도 감지하도록 정규식 수정
    const match = textBeforeCursor.match(/[a-zA-Z0-9_가-힣]+$/);
    return match ? match[0] : '';
}

export function calculateAutoCompletePosition(
    textarea: HTMLTextAreaElement,
    currentWord: string
) {
    const rect = textarea.getBoundingClientRect();
    const cursorPosition = textarea.selectionStart || 0;
    const text = textarea.value;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineNumber = lines.length - 1;
    const currentLine = lines[currentLineNumber];

    const lineHeight = 1.5 * 2.4 * 16; // fontSize * lineHeight * 16(rem to px)
    const charWidth = 14.4; // fontSize * 0.6 * 16(rem to px)

    const top = rect.top + (currentLineNumber * lineHeight) + lineHeight - textarea.scrollTop;
    const left = rect.left + (currentLine.length - currentWord.length) * charWidth;

    return {
        top: top + window.scrollY,
        left: left
    };
} 