import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, CheckSquare, XSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import API_URL from '@/config/api';

const StudentAttendancePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNameClick = (e, studentId) => {
        e.stopPropagation();
        const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${basePath}/students/${studentId}`);
    };
    const API_BASE = API_URL;

    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: { status: 'Present', remark: '' } }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchClasses = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE}/SClasses/${currentUser._id}`);
            setClasses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Classes fetch error:", error);
            showToast("Error fetching classes", "error");
        }
    }, [currentUser._id, API_BASE, showToast]);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser, fetchClasses]);

    const fetchData = useCallback(async () => {
        if (!selectedClass) return;
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const [stuRes, attRes] = await Promise.all([
                axios.get(`${API_BASE}/Students/${schoolId}`),
                axios.get(`${API_BASE}/Attendance/ForClass/${schoolId}/${selectedClass}/${selectedDate.toISOString()}`)
            ]);

            // Filter students by selected class on frontend
            const allStudents = Array.isArray(stuRes.data) ? stuRes.data : [];
            const studentsList = allStudents.filter(s => s.sclassName?._id === selectedClass || s.sclassName === selectedClass);
            setStudents(studentsList);

            const attendanceMap = {};
            if (Array.isArray(attRes.data)) {
                attRes.data.forEach(item => {
                    attendanceMap[item.student?._id || item.student] = {
                        status: item.status,
                        remark: item.remark || ''
                    };
                });
            }

            // Initialize missing students as Present
            studentsList.forEach(student => {
                if (!attendanceMap[student._id]) {
                    attendanceMap[student._id] = { status: 'Present', remark: '' };
                }
            });

            setAttendanceData(attendanceMap);
        } catch (error) {
            console.error("Data fetch error:", error);
            showToast("Error loading data", "error");
        } finally {
            setLoading(false);
        }
    }, [selectedClass, selectedDate, API_BASE, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarkChange = (studentId, remark) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remark }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                school: currentUser._id,
                sclass: selectedClass,
                date: selectedDate,
                attendance: Object.keys(attendanceData).map(studentId => ({
                    student: studentId,
                    status: attendanceData[studentId].status,
                    remark: attendanceData[studentId].remark
                }))
            };

            await axios.post(`${API_BASE}/Attendance/Mark`, payload);
            showToast('Attendance saved successfully', 'success');
        } catch (err) {
            showToast('Failed to save attendance', 'error');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const markAll = (status) => {
        const newData = { ...attendanceData };
        Object.keys(newData).forEach(id => {
            newData[id].status = status;
        });
        setAttendanceData(newData);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Take Attendance</CardTitle>
                    <CardDescription>Select class and date to mark attendance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <label className="text-sm font-medium">Select Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-1/3 space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal border-input">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedClass && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle>Student List</CardTitle>
                            <CardDescription>Mark attendance for the selected date.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => markAll('Present')}>All Present</Button>
                            <Button variant="outline" size="sm" onClick={() => markAll('Absent')}>All Absent</Button>
                            <Button onClick={handleSave} disabled={saving || students.length === 0}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Attendance'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : students.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                No students found in this class.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Roll No</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Remark</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student._id}>
                                                <TableCell className="font-medium hover:underline cursor-pointer text-primary" onClick={(e) => handleNameClick(e, student._id)}>{student.name}</TableCell>
                                                <TableCell>{student.rollNum}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                                                ${attendanceData[student._id]?.status === 'Present' ? 'bg-green-600 border-green-600' : 'border-muted-foreground'}`}
                                                                onClick={() => handleStatusChange(student._id, 'Present')}>
                                                                {attendanceData[student._id]?.status === 'Present' && <CheckSquare className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-sm">Present</span>
                                                        </label>
                                                        
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                                                ${attendanceData[student._id]?.status === 'Absent' ? 'bg-red-600 border-red-600' : 'border-muted-foreground'}`}
                                                                onClick={() => handleStatusChange(student._id, 'Absent')}>
                                                                {attendanceData[student._id]?.status === 'Absent' && <XSquare className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-sm">Absent</span>
                                                        </label>
                                                        
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                                                ${attendanceData[student._id]?.status === 'Late' ? 'bg-yellow-500 border-yellow-500' : 'border-muted-foreground'}`}
                                                                onClick={() => handleStatusChange(student._id, 'Late')}>
                                                                {attendanceData[student._id]?.status === 'Late' && <Clock className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-sm">Late</span>
                                                        </label>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        placeholder="Optional remark" 
                                                        className="h-8 w-[200px]"
                                                        value={attendanceData[student._id]?.remark || ''}
                                                        onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default StudentAttendancePanel;
