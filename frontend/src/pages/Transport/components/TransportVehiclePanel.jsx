import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, Bus, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TransportVehiclePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        vehicleNumber: '', vehicleModel: '', driverName: '',
        driverLicense: '', driverContact: '', capacity: '', assignedRoute: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchVehicles();
            fetchRoutes();
        }
    }, [currentUser]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Transport/Vehicle/${currentUser._id}`);
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch vehicles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Transport/Route/${currentUser._id}`);
            setRoutes(res.data);
        } catch (err) { }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.vehicleNumber || !formData.driverName) {
            showToast('Please fill required fields (Number, Driver Name)', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const payload = { ...formData, school: currentUser._id };
            if (!payload.assignedRoute || payload.assignedRoute === 'unassigned') delete payload.assignedRoute;

            await axios.post(`${API_BASE}/Transport/Vehicle`, payload);
            showToast('Vehicle added successfully', 'success');
            setFormData({
                vehicleNumber: '', vehicleModel: '', driverName: '',
                driverLicense: '', driverContact: '', capacity: '', assignedRoute: ''
            });
            fetchVehicles();
        } catch (err) {
            showToast('Failed to add vehicle', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vehicle?')) return;
        try {
            await axios.delete(`${API_BASE}/Transport/Vehicle/${id}`);
            showToast('Vehicle deleted', 'success');
            setVehicles(vehicles.filter(v => v._id !== id));
        } catch (err) {
            showToast('Failed to delete vehicle', 'error');
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Add Vehicle</CardTitle>
                    <CardDescription>Register a new school bus or van.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vehicle Number <span className="text-red-500">*</span></label>
                            <Input placeholder="e.g. ABC-1234" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Capacity</label>
                                <Input type="number" placeholder="Seats" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Model</label>
                                <Input placeholder="Year/Make" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-sm font-medium">Driver Name <span className="text-red-500">*</span></label>
                            <Input placeholder="Full Name" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver Phone <span className="text-red-500">*</span></label>
                            <Input placeholder="0300-1234567" value={formData.driverContact} onChange={e => setFormData({...formData, driverContact: e.target.value})} required />
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-sm font-medium">Assign Route (Optional)</label>
                            <Select value={formData.assignedRoute} onValueChange={v => setFormData({...formData, assignedRoute: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">None</SelectItem>
                                    {routes.map(route => (
                                        <SelectItem key={route._id} value={route._id}>{route.routeTitle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Register Vehicle
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Fleet Management</CardTitle>
                    <CardDescription>View and manage all vehicles.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No vehicles registered.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Info</TableHead>
                                    <TableHead>Driver Details</TableHead>
                                    <TableHead>Assigned Route</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.map(vehicle => (
                                    <TableRow key={vehicle._id}>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                <Bus className="h-4 w-4 text-muted-foreground" />
                                                {vehicle.vehicleNumber}
                                            </div>
                                            <div className="text-xs text-muted-foreground ml-6">
                                                {vehicle.vehicleModel} • {vehicle.capacity} Seats
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm flex items-center gap-2">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                {vehicle.driverName}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 ml-5">
                                                <Phone className="h-3 w-3" /> {vehicle.driverContact}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {vehicle.assignedRoute ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {vehicle.assignedRoute.routeTitle}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(vehicle._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TransportVehiclePanel;
