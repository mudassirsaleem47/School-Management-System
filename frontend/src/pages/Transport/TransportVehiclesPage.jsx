import React from 'react';
import TransportVehiclePanel from './components/TransportVehiclePanel';

const TransportVehiclesPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Vehicles Management</h2>
            </div>
            <TransportVehiclePanel />
        </div>
    );
};

export default TransportVehiclesPage;
