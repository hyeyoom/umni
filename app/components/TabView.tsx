import React from 'react';
import {Tab} from '@/app/types/tab';

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
    return (
        <div className="tab-container">
            <div className="tab-list">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-title">{tab.title}</span>
                        <button
                            className="tab-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabRemove(tab.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button className="tab-add" onClick={onTabAdd}>
                    +
                </button>
            </div>
        </div>
    );
}
