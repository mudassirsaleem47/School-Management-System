import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, BellRing, Send, AlertCircle, Calendar } from 'lucide-react';
import API_URL from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isPast, differenceInDays } from 'date-fns';
import { TablePagination } from '@/components/TablePagination';

const API_BASE = API_URL;

const FeeReminder = () => {
    const { currentUser, activeSession } = useAuth();
    const { showToast } = useToast();
    const isTeacher = currentUser?.userType === 'teacher';
    const schoolId = isTeacher ? (currentUser?.school?._id || currentUser?.school) : currentUser?._id;

    const [pendingFees, setPendingFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [sendingId, setSendingId] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter lists
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, activeSession]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sessionQuery = activeSession ? `?session=${activeSession._id}` : '';
            
            const [feesRes, classRes] = await Promise.all([
                axios.get(`${API_BASE}/PendingFees/${schoolId}${sessionQuery}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`)
            ]);
            
            setPendingFees(Array.isArray(feesRes.data) ? feesRes.data : []);
            setClasses(Array.isArray(classRes.data) ? classRes.data : []);
            
        } catch (error) {
            console.error("Error fetching pending fees:", error);
            showToast("Failed to load pending fees", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (feeId, studentName) => {
        try {
            setSendingId(feeId);
            const res = await axios.post(`${API_BASE}/Fee/Remind/${feeId}`);
            
            showToast(res.data.message || `Reminder sent successfully to ${studentName}`, "success");
        } catch (error) {
            console.error("Error sending reminder:", error);
            showToast(error.response?.data?.message || "Failed to send reminder. Check email settings.", "error");
        } finally {
            setSendingId(null);
        }
    };

    const handleSendBulkReminder = async () => {
        try {
            setLoading(true);
            const feeIds = filteredFees.map(f => f._id);
            if(feeIds.length === 0) return;

            const promises = feeIds.map(id => axios.post(`${API_BASE}/Fee/Remind/${id}`).catch(err => err));
            const results = await Promise.all(promises);
            
            const successCount = results.filter(r => r && r.status === 200).length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                showToast(`Bulk reminders sent to all ${successCount} pending students successfully`, "success");
            } else if (successCount > 0) {
                showToast(`Sent ${successCount} reminders, failed to send ${failCount}.`, "warning");
            } else {
                showToast("Failed to send reminders. Check SMTP settings or student emails.", "error");
            }

        } catch (error) {
            console.error("Error in bulk reminders:", error);
            showToast("An error occurred during bulk operation", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredFees = useMemo(() => {
        return pendingFees.filter(fee => {
            const stuName = fee.student?.name?.toLowerCase() || '';
            const rollNum = fee.student?.rollNum?.toString().toLowerCase() || '';
            const sclassId = fee.student?.sclassName?._id || fee.student?.sclassName;
            
            const matchesSearch = stuName.includes(searchQuery.toLowerCase()) || rollNum.includes(searchQuery.toLowerCase());
            const matchesClass = filterClass === 'all' || sclassId === filterClass;

            return matchesSearch && matchesClass;
        });
    }, [pendingFees, searchQuery, filterClass]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterClass]);

    const totalPages = Math.ceil(filteredFees.length / rowsPerPage);
    const paginatedFees = filteredFees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const getStatusBadge = (status, dueDate) => {
        const past = dueDate ? isPast(new Date(dueDate)) : false;
        
        if (status === 'Overdue' || past) return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Overdue</Badge>;
        if (status === 'Partial') return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Partial</Badge>;
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
    };

    const formatCurrency = (amt) => `PKR ${Number(amt).toLocaleString()}`;

    // Metrics calculation
    const totalPendingAmount = filteredFees.reduce((acc, f) => acc + (f.pendingAmount || 0), 0);
    const overdueCount = pendingFees.filter(f => isPast(new Date(f.dueDate)) || f.status === 'Overdue').length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fee Reminders</h2>
                    <p className="text-muted-foreground mt-1">Manage pending fees and send payment reminders to parents.</p>
                </div>
                <Button onClick={handleSendBulkReminder} className="bg-primary hover:bg-primary/90" disabled={filteredFees.length === 0 || loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
                    Remind All
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="flex flex-col justify-center p-6 gap-2">
                        <div className="flex items-center text-muted-foreground text-sm font-medium">
                            <AlertCircle className="w-4 h-4 mr-2 text-rose-500" />
                            Overdue Records
                        </div>
                        <span className="text-3xl font-bold text-rose-600">{overdueCount}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex flex-col justify-center p-6 gap-2">
                        <div className="flex items-center text-muted-foreground text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                            Total Pending Fees
                        </div>
                        <span className="text-3xl font-bold text-amber-600">{pendingFees.length}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex flex-col justify-center p-6 gap-2 bg-primary/5 border-primary/20">
                        <div className="flex items-center text-muted-foreground text-sm font-medium">
                            <Send className="w-4 h-4 mr-2 text-primary" />
                            Total Pending Amount
                        </div>
                        <span className="text-3xl font-bold text-primary">{formatCurrency(totalPendingAmount)}</span>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 flex-1 w-full">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name or roll no..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterClass} onValueChange={setFilterClass}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : filteredFees.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                            No pending fees found. Great job!
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead>Amount Due</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFees.map((fee) => (
                                        <TableRow key={fee._id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="font-medium text-primary">
                                                    {fee.student?.name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Roll: {fee.student?.rollNum || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{fee.student?.sclassName?.sclassName || '—'}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{fee.feeStructure?.feeName || 'General Fee'}</div>
                                                <div className="text-xs text-muted-foreground">{fee.feeStructure?.feeType || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-amber-600">
                                                {formatCurrency(fee.pendingAmount)}
                                            </TableCell>
                                            <TableCell>
                                                {fee.dueDate ? format(new Date(fee.dueDate), 'dd MMM, yyyy') : 'No Date'}
                                                {fee.dueDate && isPast(new Date(fee.dueDate)) && (
                                                    <div className="text-[10px] text-red-500 mt-0.5 font-medium">
                                                        {differenceInDays(new Date(), new Date(fee.dueDate))} days late
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(fee.status, fee.dueDate)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="hover:border-primary border border-transparent shadow-sm bg-background"
                                                    onClick={() => handleSendReminder(fee._id, fee.student?.name)}
                                                    disabled={sendingId === fee._id}
                                                >
                                                    {sendingId === fee._id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <BellRing className="h-4 w-4 text-primary" />}
                                                    <span className="sr-only">Remind</span>
                                                </Button>
                                            </TableCell>
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
                                totalRows={filteredFees.length}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FeeReminder;
