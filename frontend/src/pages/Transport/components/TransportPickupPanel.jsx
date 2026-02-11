import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TransportPickupPanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newPoint, setNewPoint] = useState({ pickupPointName: '', latitude: '', longitude: '' });

    useEffect(() => {
        if (currentUser) fetchPoints();
    }, [currentUser]);

    const fetchPoints = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Transport/PickupPoint/${currentUser._id}`);
            setPoints(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch pickup points', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newPoint.pickupPointName) return;

        try {
            setSubmitting(true);
            const payload = { ...newPoint, school: currentUser._id };
            await axios.post(`${API_BASE}/Transport/PickupPoint`, payload);
            showToast('Pickup point added successfully', 'success');
            setNewPoint({ pickupPointName: '', latitude: '', longitude: '' });
            fetchPoints();
        } catch (err) {
            showToast('Failed to add pickup point', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this pickup point?')) return;
        try {
            await axios.delete(`${API_BASE}/Transport/PickupPoint/${id}`);
            showToast('Pickup point deleted', 'success');
            setPoints(points.filter(p => p._id !== id));
        } catch (err) {
            showToast('Failed to delete pickup point', 'error');
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Add Pickup Point</CardTitle>
                    <CardDescription>Create a new stop location.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Point Name</label>
                            <Input 
                                placeholder="e.g. Main Gate, Station Rd" 
                                value={newPoint.pickupPointName}
                                onChange={e => setNewPoint({...newPoint, pickupPointName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Latitude</label>
                                <Input 
                                    placeholder="Optional" 
                                    value={newPoint.latitude}
                                    onChange={e => setNewPoint({...newPoint, latitude: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Longitude</label>
                                <Input 
                                    placeholder="Optional" 
                                    value={newPoint.longitude}
                                    onChange={e => setNewPoint({...newPoint, longitude: e.target.value})}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Point
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Pickup Points List</CardTitle>
                    <CardDescription>Manage all pickup locations used in routes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : points.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No pickup points found. Add one to get started.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Point Name</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {points.map(point => (
                                    <TableRow key={point._id}>
                                        <TableCell className="font-medium">{point.pickupPointName}</TableCell>
                                        <TableCell>
                                            {point.latitude && point.longitude ? (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {point.latitude}, {point.longitude}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(point._id)}>
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

export default TransportPickupPanel;
