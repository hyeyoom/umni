import React from 'react';
import {Suggestion} from '../types/suggestion';

interface AutoCompleteProps {
    suggestions: Suggestion[];
    onSelect: (suggestion: Suggestion) => void;
    position: { top: number; left: number };
    visible: boolean;
    selectedIndex: number;
}

export default function AutoComplete({suggestions, onSelect, position, visible, selectedIndex}: AutoCompleteProps) {
    if (!visible || suggestions.length === 0) return null;

    return (
        <div
            className="autocomplete-container"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => onSelect(suggestion)}
                >
                    <span className={`type-indicator ${suggestion.type}`}>
                        {suggestion.type[0].toUpperCase()}
                    </span>
                    <span className="suggestion-text">{suggestion.text}</span>
                    {suggestion.description && (
                        <span className="suggestion-description">
                            {suggestion.description}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
