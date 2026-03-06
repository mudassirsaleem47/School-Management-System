import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import API_URL from '../config/api.js';
import { UserX, Search, Eye, CheckCircle, Calendar, User, Check, ArrowUpDown, Filter, MoreHorizontal } from 'lucide-react';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DisableReasonPage = () => {
    const { currentUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [studentToEnable, setStudentToEnable] = useState(null);
    const [enableLoading, setEnableLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNameClick = (e, studentId) => {
        e.stopPropagation();
        const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${basePath}/students/${studentId}`);
    };

    const reasons = ['Left School', 'Transferred', 'Expelled', 'Medical', 'Financial', 'Other'];

    const reasonColors = {
        'Left School': 'bg-blue-100 text-blue-700 border-blue-200',
        'Transferred': 'bg-purple-100 text-purple-700 border-purple-200',
        'Expelled': 'bg-red-100 text-red-700 border-red-200',
        'Medical': 'bg-green-100 text-green-700 border-green-200',
        'Financial': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };



    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Students/Disabled/${currentUser._id}`);
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch disabled students error:", error);
            toast.error("Error loading disabled students");
        } finally {
            setLoading(false);
        }
    }, [currentUser._id]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleEnableConfirm = async () => {
        if (!studentToEnable) return;
        try {
            setEnableLoading(true);
            await axios.put(`${API_URL}/Student/${studentToEnable._id}`, { status: 'Active' });
            toast.success("Student enabled successfully!");
            fetchData();
            setStudentToEnable(null);
        } catch (err) {
            console.error("Error enabling student:", err);
            toast.error("Error enabling student");
        } finally {
            setEnableLoading(false);
        }
    };



    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery || 
            student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNum?.toString().includes(searchQuery);
        const matchesReason = filterReason === 'all' || student.disableInfo?.reason === filterReason;
        return matchesSearch && matchesReason;
    });

    const getReasonStats = () => {
        const stats = {};
        reasons.forEach(reason => {
            stats[reason] = students.filter(s => s.disableInfo?.reason === reason).length;
        });
        return stats;
    };

    const stats = getReasonStats();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Disable Reasons</h2>
                    <p className="text-muted-foreground">
                        View and manage students who have been disabled or left.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Total Disabled</span>
                    <span className="text-2xl font-bold text-primary">{students.length}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reasons.map(reason => (
                    <Card key={reason} className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{reason}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{stats[reason] || 0}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <CardTitle className="text-lg font-medium">Disabled Students List</CardTitle>
                        <div className="flex gap-2 flex-1 md:flex-none">
                            <div className="relative w-full md:w-[250px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or roll no..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={filterReason} onValueChange={setFilterReason}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="All Reasons" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reasons</SelectItem>
                                    {reasons.map(reason => (
                                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <UserX className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No disabled students found</h3>
                                <p className="text-muted-foreground max-w-sm mt-1">
                                    {searchQuery || filterReason !== 'all' 
                                        ? "Try adjusting your search or filters to find what you're looking for."
                                        : "No students have been marked as disabled yet."}
                                </p>
                            </div>
                        ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Roll No</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead className="max-w-[200px]">Description</TableHead>
                                                <TableHead>Disabled Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={student.studentImage} />
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {student.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium hover:underline cursor-pointer text-primary" onClick={(e) => handleNameClick(e, student._id)}>{student.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {student.admissionNum}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.rollNum}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{student.sclassName?.sclassName || 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border-0 ${reasonColors[student.disableInfo?.reason] || 'bg-gray-100 text-gray-700'}`}>
                                                    {student.disableInfo?.reason || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <span className="truncate block text-muted-foreground" title={student.disableInfo?.description}>
                                                    {student.disableInfo?.description || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {student.disableInfo?.disabledDate 
                                                    ? formatDateTime(student.disableInfo.disabledDate)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowDetailsModal(true);
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setStudentToEnable(student)}
                                                            className="text-green-600 focus:text-green-600"
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Enable Student
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <StudentDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                student={selectedStudent}
            />

            <AlertDialog open={!!studentToEnable} onOpenChange={(open) => !open && setStudentToEnable(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enable Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to re-enable <strong>{studentToEnable?.name}</strong>?
                            They will be moved back to the active students list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={enableLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleEnableConfirm();
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={enableLoading}
                        >
                            {enableLoading ? "Enabling..." : "Enable Student"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DisableReasonPage;
