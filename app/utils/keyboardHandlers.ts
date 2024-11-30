import {Suggestion} from "@/app/types/suggestion";

interface KeyboardHandlerParams {
    key: string;
    filteredSuggestions: Suggestion[];
    selectedIndex: number;
    autoCompleteVisible: boolean;
    onSelectIndex: (index: number) => void;
    onSelectSuggestion: (suggestion: Suggestion) => void;
    onHideAutoComplete: () => void;
}

export function handleKeyboardEvent({
                                        key,
                                        filteredSuggestions,
                                        selectedIndex,
                                        autoCompleteVisible,
                                        onSelectIndex,
                                        onSelectSuggestion,
                                        onHideAutoComplete,
                                    }: KeyboardHandlerParams): boolean {
    if (!autoCompleteVisible) return false;

    switch (key) {
        case 'ArrowDown':
            if (selectedIndex < filteredSuggestions.length - 1) {
                onSelectIndex(selectedIndex + 1);
            }
            return true;

        case 'ArrowUp':
            if (selectedIndex > 0) {
                onSelectIndex(selectedIndex - 1);
            }
            return true;

        case 'Tab':
            if (filteredSuggestions[selectedIndex]) {
                onSelectSuggestion(filteredSuggestions[selectedIndex]);
            }
            return true;

        case 'Escape':
            onHideAutoComplete();
            return true;

        default:
            return false;
    }
}
