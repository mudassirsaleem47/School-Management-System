import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, CalendarIcon, Users, Save } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = API_URL;

const StaffAttendancePage = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [date, setDate] = useState(new Date());
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAttendance = async (selectedDate) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const res = await axios.get(`${API_BASE}/StaffAttendance/ForDate/${currentUser._id}/${dateStr}`);
            // Add local state for unsaved changes
            const processedData = res.data.map(s => ({
                ...s,
                currentStatus: s.attendanceStatus || 'Present', // Default to present if not marked
                currentRemark: s.remark || '',
                isDirty: false
            }));
            setStaff(processedData);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch staff attendance", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, currentUser]);

    const handleStatusChange = (staffId, status) => {
        setStaff(prev => prev.map(s =>
            s._id === staffId ? { ...s, currentStatus: status, isDirty: true } : s
        ));
    };

    const handleRemarkChange = (staffId, remark) => {
        setStaff(prev => prev.map(s =>
            s._id === staffId ? { ...s, currentRemark: remark, isDirty: true } : s
        ));
    };

    const markAllStatus = (status) => {
        setStaff(prev => prev.map(s => ({ ...s, currentStatus: status, isDirty: true })));
    };

    const handleSaveAttendance = async () => {
        try {
            setSaving(true);
            const attendanceData = staff.map(s => ({
                staffId: s._id,
                status: s.currentStatus,
                remark: s.currentRemark
            }));

            await axios.post(`${API_BASE}/StaffAttendance/Mark`, {
                school: currentUser._id,
                date: format(date, 'yyyy-MM-dd'),
                attendance: attendanceData
            });

            showToast("Attendance saved successfully", "success");
            // Refresh to clear dirty flags
            fetchAttendance(date);
        } catch (error) {
            console.error(error);
            showToast("Failed to save attendance", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAnyDirty = staff.some(s => s.isDirty);
    const allMarked = staff.every(s => s.attendanceStatus); // all have saved status
    
    // Stats
    const presentCount = staff.filter(s => s.currentStatus === 'Present').length;
    const absentCount = staff.filter(s => s.currentStatus === 'Absent').length;
    const leaveCount = staff.filter(s => s.currentStatus === 'Leave').length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Attendance</h2>
                    <p className="text-muted-foreground">Mark and manage daily attendance for all staff</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-white">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                                disabled={(date) => date > new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                    
                    <Button 
                        onClick={handleSaveAttendance} 
                        disabled={saving || (!isAnyDirty && allMarked)}
                        className={isAnyDirty ? 'bg-primary animate-pulse' : ''}
                    >
                        {saving ? (
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Attendance
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{staff.length}</p>
                            <p className="text-xs text-muted-foreground">Total Staff</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                            <p className="text-xs text-muted-foreground">Present</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-red-500/10 p-2 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                            <p className="text-xs text-muted-foreground">Absent</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{leaveCount}</p>
                            <p className="text-xs text-muted-foreground">On Leave</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            Attendance Roster 
                            {allMarked && !isAnyDirty && staff.length > 0 && 
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">Saved for Date</Badge>
                            }
                        </CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Search staff..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-[200px] h-9"
                            />
                            <div className="flex gap-1 bg-muted p-1 rounded-md">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllStatus('Present')}>All Present</Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllStatus('Absent')}>All Absent</Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No staff members found matching your search.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="pl-6 w-[300px]">Staff Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="pr-6 w-[250px]">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStaff.map((person) => (
                                    <TableRow 
                                        key={person._id} 
                                        className={`
                                            ${person.isDirty ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''} 
                                            hover:bg-muted/30
                                        `}
                                    >
                                        <TableCell className="pl-6">
                                            <div className="font-medium">{person.name}</div>
                                            <div className="text-xs text-muted-foreground">{person.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize font-normal text-xs">
                                                {person.role || 'Staff'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant={person.currentStatus === 'Present' ? 'default' : 'outline'}
                                                    className={`h-8 px-3 rounded-l-md rounded-r-none ${person.currentStatus === 'Present' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                                    onClick={() => handleStatusChange(person._id, 'Present')}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={person.currentStatus === 'Absent' ? 'default' : 'outline'}
                                                    className={`h-8 px-3 rounded-none border-x-0 ${person.currentStatus === 'Absent' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                                    onClick={() => handleStatusChange(person._id, 'Absent')}
                                                >
                                                    Absent
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={person.currentStatus === 'Late' ? 'default' : 'outline'}
                                                    className={`h-8 px-3 rounded-none ${person.currentStatus === 'Late' ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : ''}`}
                                                    onClick={() => handleStatusChange(person._id, 'Late')}
                                                >
                                                    Late
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={person.currentStatus === 'Leave' ? 'default' : 'outline'}
                                                    className={`h-8 px-3 rounded-r-md rounded-l-none border-l-0 ${person.currentStatus === 'Leave' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                                    onClick={() => handleStatusChange(person._id, 'Leave')}
                                                >
                                                    Leave
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <Input
                                                placeholder="Add remark..."
                                                value={person.currentRemark}
                                                onChange={(e) => handleRemarkChange(person._id, e.target.value)}
                                                className={`h-8 text-sm ${person.isDirty && person.currentRemark !== (person.remark || '') ? 'border-primary' : ''}`}
                                            />
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

export default StaffAttendancePage;
