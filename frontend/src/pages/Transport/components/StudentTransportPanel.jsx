import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, Search, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const StudentTransportPanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    // Data lists
    const [assignments, setAssignments] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [stops, setStops] = useState([]);
    const [students, setStudents] = useState([]);
    
    // UI state
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form state
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedStop, setSelectedStop] = useState('');
    
    useEffect(() => {
        if (currentUser) {
            fetchAssignments();
            fetchRoutes();
            fetchStudents(); // Ideally this should be a search, but for now fetch all
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedRoute) {
            fetchStops(selectedRoute);
        } else {
            setStops([]);
        }
    }, [selectedRoute]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Transport/StudentTransport/${currentUser._id}`);
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
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

    const fetchStops = async (routeId) => {
        try {
            const res = await axios.get(`${API_BASE}/Transport/RouteStop/${routeId}`);
            setStops(res.data);
        } catch (err) { }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
            setStudents(res.data);
        } catch (err) { }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedStop) return;

        try {
            setAssigning(true);
            const payload = {
                school: currentUser._id,
                student: selectedStudent,
                routeStop: selectedStop,
                // We can add vehicle derived from route later
            };
            await axios.post(`${API_BASE}/Transport/StudentTransport`, payload);
            showToast('Student assigned to transport', 'success');
            setSelectedStudent('');
            setSelectedStop('');
            // Refresh list
            fetchAssignments();
        } catch (err) {
            showToast('Failed to assign student', 'error');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemove = async (id) => {
        if (!confirm('Remove student from transport?')) return;
        try {
            await axios.delete(`${API_BASE}/Transport/StudentTransport/${id}`);
            showToast('Assignment removed', 'success');
            setAssignments(assignments.filter(a => a._id !== id));
        } catch (err) {
            showToast('Failed to remove assignment', 'error');
        }
    };

    // Filter students based on search
    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.rollNum?.toString().includes(searchQuery)
    ).slice(0, 10); // Limit results

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Assignment Form */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Assign Transport</CardTitle>
                    <CardDescription>Link a student to a route stop.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Name or Roll No..." 
                                    className="pl-9" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger>
                                    <SelectValue placeholder={searchQuery ? "Select from results" : "Select Student"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(s => (
                                            <SelectItem key={s._id} value={s._id}>{s.name} ({s.sclassName?.sclassName || 'N/A'})</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No students found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-sm font-medium">Select Route</label>
                            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                                <SelectTrigger><SelectValue placeholder="Choose Route" /></SelectTrigger>
                                <SelectContent>
                                    {routes.map(r => (
                                        <SelectItem key={r._id} value={r._id}>{r.routeTitle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Pickup Point</label>
                            <Select value={selectedStop} onValueChange={setSelectedStop} disabled={!selectedRoute}>
                                <SelectTrigger><SelectValue placeholder="Choose Stop" /></SelectTrigger>
                                <SelectContent>
                                    {stops.length > 0 ? (
                                        stops.map(s => (
                                            <SelectItem key={s._id} value={s._id}>
                                                {s.pickupPoint?.pickupPointName} (Fee: {s.monthlyFee})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No stops available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={assigning || !selectedStudent || !selectedStop}>
                            {assigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            Assign Student
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Assignments List */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Transport Students</CardTitle>
                    <CardDescription>List of students availing transport facility.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No studentsassigned to transport.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Route / Stop</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map(assign => (
                                    <TableRow key={assign._id}>
                                        <TableCell className="font-medium">
                                            {assign.student?.name}
                                            <div className="text-xs text-muted-foreground">Roll: {assign.student?.rollNum}</div>
                                        </TableCell>
                                        <TableCell>
                                            {assign.student?.sclassName?.sclassName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {assign.routeStop?.pickupPoint?.pickupPointName || 'Unknown Stop'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Fee: {assign.routeStop?.monthlyFee}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(assign._id)}>
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

export default StudentTransportPanel;
