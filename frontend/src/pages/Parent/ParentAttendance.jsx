
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const ParentAttendance = () => {
    const { currentUser } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                if (!currentUser?._id) return;
                const res = await axios.get(`${API_URL}/Attendance/Student/${currentUser._id}`);
                setAttendance(res.data);
            } catch (err) {
                console.error("Error fetching attendance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [currentUser]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Present':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Present</Badge>;
            case 'Absent':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>;
            case 'Late':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Late</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Record</h2>
                    <p className="text-muted-foreground mt-1">Detailed attendance history for {currentUser?.name}</p>
                </div>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>
                                Total Days: {attendance.length} | 
                                Present: {attendance.filter(a => a.status === 'Present').length} | 
                                Absent: {attendance.filter(a => a.status === 'Absent').length}
                            </CardDescription>
                        </div>
                        <CalendarCheck className="h-8 w-8 text-primary opacity-20" />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                            No attendance records found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remark</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map((record) => (
                                    <TableRow key={record._id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(record.date), 'dd MMMM yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(record.status)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {record.remark || "-"}
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

export default ParentAttendance;
