import React from 'react';

interface EditorAreaProps {
    editorRef: React.RefObject<HTMLTextAreaElement>;
    code: string;
    onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onBlur: () => void;
}

export function EditorArea({
                               editorRef,
                               code,
                               onInput,
                               onKeyDown,
                               onBlur
                           }: EditorAreaProps) {
    return (
        <textarea
            ref={editorRef}
            className="code-editor"
            value={code}
            onChange={onInput}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            placeholder="계산식을 입력하세요..."
            spellCheck={false}
        />
    );
}
