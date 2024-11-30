import React from 'react';
import FloatingButton from './FloatingButton';

interface FloatingButtonsProps {
    onClear: () => void;
    onHelp: () => void;
}

export function FloatingButtons({onClear, onHelp}: FloatingButtonsProps) {
    return (
        <div className="floating-buttons">
            <FloatingButton type="clear" onClick={onClear}/>
            <FloatingButton type="help" onClick={onHelp}/>
        </div>
    );
}
