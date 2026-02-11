import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TransportRoutePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newRoute, setNewRoute] = useState({ routeTitle: '', fare: '', description: '' });

    useEffect(() => {
        if (currentUser) fetchRoutes();
    }, [currentUser]);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Transport/Route/${currentUser._id}`);
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch routes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newRoute.routeTitle) return;

        try {
            setSubmitting(true);
            const payload = { ...newRoute, school: currentUser._id };
            await axios.post(`${API_BASE}/Transport/Route`, payload);
            showToast('Route added successfully', 'success');
            setNewRoute({ routeTitle: '', fare: '', description: '' });
            fetchRoutes();
        } catch (err) {
            showToast('Failed to add route', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this route? ALL assigned stops will also become invalid.')) return;
        try {
            await axios.delete(`${API_BASE}/Transport/Route/${id}`);
            showToast('Route deleted', 'success');
            setRoutes(routes.filter(r => r._id !== id));
        } catch (err) {
            showToast('Failed to delete route', 'error');
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Create Route</CardTitle>
                    <CardDescription>Define a new transport route.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Route Title</label>
                            <Input 
                                placeholder="e.g. Route A, City Center" 
                                value={newRoute.routeTitle}
                                onChange={e => setNewRoute({...newRoute, routeTitle: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Basic Fare (Optional)</label>
                            <Input 
                                type="number" 
                                placeholder="Base fare amount" 
                                value={newRoute.fare}
                                onChange={e => setNewRoute({...newRoute, fare: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">You can set specific fees per stop later.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea 
                                placeholder="Route details..." 
                                value={newRoute.description}
                                onChange={e => setNewRoute({...newRoute, description: e.target.value})}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Create Route
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Managed Routes</CardTitle>
                    <CardDescription>List of all active transport routes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : routes.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No routes found. Create one to get started.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Route Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map(route => (
                                    <TableRow key={route._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Route className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p>{route.routeTitle}</p>
                                                    {route.fare > 0 && <span className="text-xs text-muted-foreground">Base: {route.fare}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                            {route.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(route._id)}>
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

export default TransportRoutePanel;
