import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const ApproveLeavePanel = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchLeaves();
        }
    }, [currentUser]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Attendance/Leave/List/${currentUser._id}`);
            setLeaves(res.data);
        } catch (err) {
            showToast('Failed to fetch leave requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${API_BASE}/Attendance/Leave/${id}`, { 
                status,
                approvedBy: currentUser._id
            });
            showToast(`Leave request ${status}`, 'success');
            setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Leave Requests</CardTitle>
                        <CardDescription>Manage student leave applications.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchLeaves}>Refresh</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : leaves.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                        No leave requests found.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaves.map(leave => (
                                <TableRow key={leave._id}>
                                    <TableCell>
                                        <div className="font-medium text-sm">{leave.student?.name}</div>
                                        <div className="text-xs text-muted-foreground">{leave.student?.rollNum}</div>
                                    </TableCell>
                                    <TableCell>{leave.sclass?.sclassName}</TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex flex-col">
                                            <span>From: {format(new Date(leave.dateFrom), 'dd MMM yyyy')}</span>
                                            <span>To: {format(new Date(leave.dateTo), 'dd MMM yyyy')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                                        {leave.reason}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            leave.status === 'Approved' ? 'success' : 
                                            leave.status === 'Rejected' ? 'destructive' : 'secondary'
                                        }>
                                            {leave.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {leave.status === 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(leave._id, 'Approved')}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(leave._id, 'Rejected')}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default ApproveLeavePanel;
