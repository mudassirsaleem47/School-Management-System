import React from 'react';
import SyllabusStatus from './components/SyllabusStatus';

const SyllabusTracker = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Syllabus Status</h2>
            </div>
            <SyllabusStatus />
        </div>
    );
};

export default SyllabusTracker;
