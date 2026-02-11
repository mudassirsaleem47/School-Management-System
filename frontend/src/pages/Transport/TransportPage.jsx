import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bus, MapPin, Route, Users, Ticket, CheckSquare } from 'lucide-react';
import TransportPickupPanel from './components/TransportPickupPanel';
import TransportRoutePanel from './components/TransportRoutePanel';
import TransportVehiclePanel from './components/TransportVehiclePanel';
import TransportStopPanel from './components/TransportStopPanel';
import StudentTransportPanel from './components/StudentTransportPanel';

const TransportPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Transport Management</h2>
            </div>
            
            <Tabs defaultValue="pickup" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pickup" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Pickup Points
                    </TabsTrigger>
                    <TabsTrigger value="route" className="flex items-center gap-2">
                        <Route className="h-4 w-4" /> Routes
                    </TabsTrigger>
                    <TabsTrigger value="vehicle" className="flex items-center gap-2">
                        <Bus className="h-4 w-4" /> Vehicles
                    </TabsTrigger>
                    <TabsTrigger value="stops" className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" /> Route Stops & Fees
                    </TabsTrigger>
                    <TabsTrigger value="student" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Student Transport
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pickup" className="space-y-4">
                    <TransportPickupPanel />
                </TabsContent>
                
                <TabsContent value="route" className="space-y-4">
                    <TransportRoutePanel />
                </TabsContent>
                
                <TabsContent value="vehicle" className="space-y-4">
                    <TransportVehiclePanel />
                </TabsContent>
                
                <TabsContent value="stops" className="space-y-4">
                    <TransportStopPanel />
                </TabsContent>
                
                <TabsContent value="student" className="space-y-4">
                    <StudentTransportPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TransportPage;
