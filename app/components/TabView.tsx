import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../types/tab';
import { XMarkIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface TabViewProps {
    tabs: Tab[];
    activeTabId: string;
    onTabChange: (tabId: string) => void;
    onTabAdd: () => void;
    onTabRemove: (tabId: string) => void;
    onTabRename: (tabId: string, newTitle: string) => void;
}

export function TabView({
    tabs,
    activeTabId,
    onTabChange,
    onTabAdd,
    onTabRemove,
    onTabRename
}: TabViewProps) {
    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingTabId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTabId]);

    const handleTitleClick = (e: React.MouseEvent, tab: Tab) => {
        e.stopPropagation();
        setEditingTabId(tab.id);
        setEditingTitle(tab.title);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingTitle(e.target.value);
    };

    const handleTitleSubmit = () => {
        if (editingTabId && editingTitle.trim()) {
            onTabRename(editingTabId, editingTitle.trim());
        }
        setEditingTabId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleSubmit();
        } else if (e.key === 'Escape') {
            setEditingTabId(null);
        }
    };

    return (
        <div className="tab-container">
            <div className="tab-list">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <DocumentTextIcon className="tab-icon" />
                        {editingTabId === tab.id ? (
                            <input
                                ref={inputRef}
                                className="tab-title-input"
                                value={editingTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleSubmit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span 
                                className="tab-title"
                                onClick={(e) => handleTitleClick(e, tab)}
                            >
                                {tab.title}
                            </span>
                        )}
                        <button
                            className="tab-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabRemove(tab.id);
                            }}
                        >
                            <XMarkIcon className="tab-close-icon" />
                        </button>
                    </div>
                ))}
                <button className="tab-add" onClick={onTabAdd}>
                    <PlusIcon className="tab-add-icon" />
                </button>
            </div>
        </div>
    );
}
