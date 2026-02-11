import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';

const AttendanceByDatePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClasses(res.data);
        } catch (err) { }
    };

    const fetchAttendance = async () => {
        if (!selectedClass || !selectedDate) return;
        
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Attendance/ForClass/${currentUser._id}/${selectedClass}/${selectedDate.toISOString()}`);
            
            // We need student details too. The endpoint currently returns attendance records but maybe not populated student details fully
            // Actually, /ForClass returns attendance records. Does it Populate?
            // Let's check backend route. 
            // The route `Attendance.find(...)` does NOT populate student by default in the code I wrote.
            // I should update the backend route to populate student.
            
            setAttendance(res.data);
        } catch (err) {
            showToast('Failed to fetch attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Need to trigger fetch on changes
    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchAttendance();
        }
    }, [selectedClass, selectedDate]);

    // Stats
    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const totalAbsent = attendance.filter(a => a.status === 'Absent').length;
    const totalLate = attendance.filter(a => a.status === 'Late').length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>View Attendance</CardTitle>
                    <CardDescription>View attendance records by date.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1.5 block">Select Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1.5 block">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal border-input">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {format(selectedDate, 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => d && setSelectedDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {selectedClass && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 bg-green-50">
                                    <span className="text-2xl font-bold text-green-700">{totalPresent}</span>
                                    <span className="text-sm text-green-600">Present</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 bg-red-50">
                                    <span className="text-2xl font-bold text-red-700">{totalAbsent}</span>
                                    <span className="text-sm text-red-600">Absent</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-6 bg-yellow-50">
                                    <span className="text-2xl font-bold text-yellow-700">{totalLate}</span>
                                    <span className="text-sm text-yellow-600">Late</span>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Pending: Since we don't have student names populated yet, this table is less useful. 
                        We should fix the backend route or fetch students and map them on client side like the other panel. 
                        For now, I'll update the backend route to populate student.
                    */}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceByDatePanel;
