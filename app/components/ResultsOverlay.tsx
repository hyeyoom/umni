import React from 'react';

interface ResultsOverlayProps {
    results: Array<{ line: number; result: string }>;
}

export function ResultsOverlay({results}: ResultsOverlayProps) {
    return (
        <div className="results-overlay">
            <div className="results-content">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className="result-line"
                        onClick={() => {
                            if (result.result) {
                                navigator.clipboard.writeText(result.result);
                            }
                        }}
                    >
                        {result.result}
                    </div>
                ))}
            </div>
        </div>
    );
}
