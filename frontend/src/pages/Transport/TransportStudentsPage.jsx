import React from 'react';
import StudentTransportPanel from './components/StudentTransportPanel';

const TransportStudentsPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Student Assignments</h2>
            </div>
            <StudentTransportPanel />
        </div>
    );
};

export default TransportStudentsPage;
