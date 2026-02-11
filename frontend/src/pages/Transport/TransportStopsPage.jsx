import React from 'react';
import TransportStopPanel from './components/TransportStopPanel';

const TransportStopsPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stops Configuration</h2>
            </div>
            <TransportStopPanel />
        </div>
    );
};

export default TransportStopsPage;
