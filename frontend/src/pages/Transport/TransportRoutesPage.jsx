import React from 'react';
import TransportRoutePanel from './components/TransportRoutePanel';

const TransportRoutesPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Routes Management</h2>
            </div>
            <TransportRoutePanel />
        </div>
    );
};

export default TransportRoutesPage;
