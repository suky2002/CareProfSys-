import React, { useEffect, useState } from 'react';
import ResultsPanel from './ResultsPanel';

export default function ResultsScreen() {
    const [results, setResults] = useState(null);
    const [recommendedJob, setRecommendedJob] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/result')
            .then((res) => res.json())
            .then((data) => {
                setResults(data);

                const jobList = [
                    {
                        title: 'Video Editor',
                        skills: ['Video Editing', 'Adobe Premiere', 'Lighting Design']
                    },
                    {
                        title: 'Sound Engineer',
                        skills: ['Audio Engineering', 'Mixing', 'OBS Studio']
                    }
                ];

                const bestMatch = jobList
                    .map((job) => ({
                        ...job,
                        matchCount: job.skills.filter((s) => data.skills.includes(s)).length
                    }))
                    .sort((a, b) => b.matchCount - a.matchCount)[0];

                setRecommendedJob(bestMatch?.title);
            });
    }, []);

    return <ResultsPanel results={results} recommendedJob={recommendedJob} />;
}