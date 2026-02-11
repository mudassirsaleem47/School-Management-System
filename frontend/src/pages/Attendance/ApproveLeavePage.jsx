import React from 'react';
import ApproveLeavePanel from './components/ApproveLeavePanel';

const ApproveLeavePage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Approve Leave</h2>
            </div>
            <ApproveLeavePanel />
        </div>
    );
};

export default ApproveLeavePage;
