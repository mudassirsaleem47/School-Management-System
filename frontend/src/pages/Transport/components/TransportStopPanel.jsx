import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, MapPin, Clock, DollarSign, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TransportStopPanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    const [routes, setRoutes] = useState([]);
    const [points, setPoints] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newStop, setNewStop] = useState({
        pickupPoint: '',
        distance: '',
        pickTime: '',
        dropTime: '',
        monthlyFee: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchRoutes();
            fetchPoints();
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedRoute) {
            fetchStops(selectedRoute);
        } else {
            setStops([]);
        }
    }, [selectedRoute]);

    const fetchRoutes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Transport/Route/${currentUser._id}`);
            setRoutes(res.data);
        } catch (err) { }
    };

    const fetchPoints = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Transport/PickupPoint/${currentUser._id}`);
            setPoints(res.data);
        } catch (err) { }
    };

    const fetchStops = async (routeId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Transport/RouteStop/${routeId}`);
            setStops(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!selectedRoute || !newStop.pickupPoint) return;

        try {
            setAdding(true);
            const payload = { ...newStop, route: selectedRoute, school: currentUser._id };
            await axios.post(`${API_BASE}/Transport/RouteStop`, payload);
            showToast('Stop added to route', 'success');
            setNewStop({ pickupPoint: '', distance: '', pickTime: '', dropTime: '', monthlyFee: '' });
            fetchStops(selectedRoute);
        } catch (err) {
            showToast('Failed to add stop', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this stop from route?')) return;
        try {
            await axios.delete(`${API_BASE}/Transport/RouteStop/${id}`);
            setStops(stops.filter(s => s._id !== id));
            showToast('Stop removed', 'success');
        } catch (err) {
            showToast('Failed to remove stop', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Route Stops & Fees</CardTitle>
                    <CardDescription>Configure pickup points, timings, and fees for each route.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1.5 block">Select Route</label>
                            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a route..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes.map(route => (
                                        <SelectItem key={route._id} value={route._id}>{route.routeTitle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedRoute ? (
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Add Stop Form */}
                            <div className="md:col-span-1 border rounded-lg p-4 bg-muted/30 h-fit">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add New Stop
                                </h3>
                                <form onSubmit={handleAdd} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Pickup Point</label>
                                        <Select value={newStop.pickupPoint} onValueChange={v => setNewStop({...newStop, pickupPoint: v})}>
                                            <SelectTrigger className="h-8"><SelectValue placeholder="Select Point" /></SelectTrigger>
                                            <SelectContent>
                                                {points.map(point => (
                                                    <SelectItem key={point._id} value={point._id}>{point.pickupPointName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Pick Time</label>
                                            <Input type="time" className="h-8" value={newStop.pickTime} onChange={e => setNewStop({...newStop, pickTime: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Drop Time</label>
                                            <Input type="time" className="h-8" value={newStop.dropTime} onChange={e => setNewStop({...newStop, dropTime: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Distance (km)</label>
                                            <Input type="number" step="0.1" className="h-8" value={newStop.distance} onChange={e => setNewStop({...newStop, distance: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Monthly Fee</label>
                                            <Input type="number" className="h-8" placeholder="Amount" value={newStop.monthlyFee} onChange={e => setNewStop({...newStop, monthlyFee: e.target.value})} required />
                                        </div>
                                    </div>
                                    <Button type="submit" size="sm" className="w-full mt-2" disabled={adding}>
                                        {adding ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                                        Add to Route
                                    </Button>
                                </form>
                            </div>

                            {/* Stops List */}
                            <div className="md:col-span-2">
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                ) : stops.length === 0 ? (
                                    <div className="text-center p-8 border rounded-lg border-dashed">No stops added to this route yet.</div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Pickup Point</TableHead>
                                                    <TableHead>Timings</TableHead>
                                                    <TableHead>Fee</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stops.map(stop => (
                                                    <TableRow key={stop._id}>
                                                        <TableCell>
                                                            <div className="font-medium flex items-center gap-2">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                {stop.pickupPoint?.pickupPointName || 'Unknown'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground ml-5">
                                                                {stop.distance ? `${stop.distance} km` : ''}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs space-y-1">
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <Clock className="h-3 w-3" /> P: {stop.pickTime || '--:--'}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-orange-600">
                                                                    <Clock className="h-3 w-3" /> D: {stop.dropTime || '--:--'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-sm flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                                {stop.monthlyFee}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(stop._id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            <Route className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p>Please select a route to view and manage its stops.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TransportStopPanel;
