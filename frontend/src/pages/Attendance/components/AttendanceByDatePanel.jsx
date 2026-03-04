import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';
import API_URL from '@/config/api';
import { TablePagination } from '@/components/TablePagination';

const API_BASE = API_URL;

const StatusBadge = ({ status }) => {
    if (status === 'Present') return (
        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3" /> Present
        </Badge>
    );
    if (status === 'Absent') return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 hover:bg-red-100">
            <XCircle className="h-3 w-3" /> Absent
        </Badge>
    );
    if (status === 'Late') return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1 hover:bg-yellow-100">
            <Clock className="h-3 w-3" /> Late
        </Badge>
    );
    return <Badge variant="outline">{status}</Badge>;
};

const AttendanceByDatePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (currentUser) fetchClasses();
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClasses(Array.isArray(res.data) ? res.data : []);
        } catch (err) { }
    };

    const fetchAttendance = async () => {
        if (!selectedClass || !selectedDate) return;
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_BASE}/Attendance/ForClass/${currentUser._id}/${selectedClass}/${selectedDate.toISOString()}`
            );
            setAttendance(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            showToast('Failed to fetch attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClass && selectedDate) fetchAttendance();
    }, [selectedClass, selectedDate]);

    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const totalAbsent = attendance.filter(a => a.status === 'Absent').length;
    const totalLate = attendance.filter(a => a.status === 'Late').length;

    // Reset pagination when class or date change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedClass, selectedDate]);

    // Compute paginated data
    const totalPages = Math.ceil(attendance.length / rowsPerPage);
    const paginatedAttendance = attendance.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>View Attendance</CardTitle>
                    <CardDescription>View attendance records by date.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
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
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20">
                                        <span className="text-2xl font-bold text-green-700">{totalPresent}</span>
                                        <span className="text-sm text-green-600">Present</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20">
                                        <span className="text-2xl font-bold text-red-700">{totalAbsent}</span>
                                        <span className="text-sm text-red-600">Absent</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20">
                                        <span className="text-2xl font-bold text-yellow-700">{totalLate}</span>
                                        <span className="text-sm text-yellow-600">Late</span>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Student List */}
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                </div>
                            ) : attendance.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No attendance records found for this date.
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Roll No</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Remark</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                                    {paginatedAttendance.map((record, i) => (
                                                <TableRow
                                                    key={record._id}
                                                    className={
                                                        record.status === 'Absent' ? 'bg-red-50/40 dark:bg-red-900/10' :
                                                            record.status === 'Late' ? 'bg-yellow-50/40 dark:bg-yellow-900/10' : ''
                                                    }
                                                >
                                                    <TableCell className="text-muted-foreground text-xs">{(currentPage - 1) * rowsPerPage + i + 1}</TableCell>
                                                    <TableCell className="font-medium">{record.student?.name || '—'}</TableCell>
                                                    <TableCell className="font-mono text-sm text-muted-foreground">{record.student?.rollNum || '—'}</TableCell>
                                                    <TableCell><StatusBadge status={record.status} /></TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{record.remark || '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                            <TablePagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                rowsPerPage={rowsPerPage}
                                                onRowsPerPageChange={(v) => { setRowsPerPage(v); setCurrentPage(1); }}
                                                totalRows={attendance.length}
                                            />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceByDatePanel;
