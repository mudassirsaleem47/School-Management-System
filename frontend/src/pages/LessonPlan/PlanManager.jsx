import React from 'react';
import LessonPlanManager from './components/LessonPlanManager';

const PlanManager = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Lesson Planner</h2>
            </div>
            <LessonPlanManager />
        </div>
    );
};

export default PlanManager;
