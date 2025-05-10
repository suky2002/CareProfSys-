// components/ResultsPanel.jsx
import React from 'react';

export default function ResultsPanel({ results, recommendedJob }) {
    if (!results) return <p>Loading results...</p>;

    return (
        <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-2">Matching Results</h2>

            <p><strong>Matching Score:</strong> {results.score?.toFixed(2)}%</p>

            <p className="mt-2">
                <strong>Skills Found:</strong>{' '}
                {results.skills && results.skills.length > 0
                    ? results.skills.join(', ')
                    : 'None'}
            </p>

            {recommendedJob && (
                <p className="mt-2">
                    <strong>Recommended Job:</strong> {recommendedJob}
                </p>
            )}
        </div>
    );
}