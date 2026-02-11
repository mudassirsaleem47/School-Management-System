import React from 'react';
import AttendanceByDatePanel from './components/AttendanceByDatePanel';

const AttendanceByDatePage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Attendance By Date</h2>
            </div>
            <AttendanceByDatePanel />
        </div>
    );
};

export default AttendanceByDatePage;
