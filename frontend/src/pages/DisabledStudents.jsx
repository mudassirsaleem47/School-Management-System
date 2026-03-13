import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
    CheckCircle, Trash2, Eye, LayoutGrid, List as ListIcon,
    UserX, Search, AlertCircle, RotateCcw, X, MoreHorizontal, Filter,
    FileSpreadsheet, Ban
} from 'lucide-react';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';
import ConfirmDeleteModal from '../components/form-popup/ConfirmDeleteModal';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const DisabledStudents = () => {
    const { currentUser } = useAuth();
    const { setExtraBreadcrumb } = useOutletContext() || {};
    const navigate = useNavigate();
    const location = useLocation();

    const handleNameClick = (e, studentId) => {
        e.stopPropagation();
        const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${basePath}/students/${studentId}`);
    };
    
    // --- State Management ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    
    // Selection & Filters
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterReason, setFilterReason] = useState("all");

    // Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Confirmation State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'enable' | 'delete' | 'bulk-enable' | 'bulk-delete' 
        data: null
    });

    // --- 1. Data Fetching ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            setStudents([]);
            
            const response = await axios.get(`${API_BASE}/Students/Disabled/${schoolId}`);
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setStudents([]);
            } else {
                toast.error("Error loading disabled students");
            }
        } finally {
            setLoading(false);
        }
    }, [currentUser._id]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
        if (setExtraBreadcrumb) {
            setExtraBreadcrumb("Disabled Students");
        }
    }, [currentUser, fetchData, setExtraBreadcrumb]);

    // --- 2. Computed Data ---
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch = !searchQuery ||
                student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.rollNum?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.father?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterReason === 'all' || student.disableInfo?.reason === filterReason;

            return matchesSearch && matchesFilter;
        });
    }, [students, searchQuery, filterReason]);

    const stats = useMemo(() => {
        return {
            total: students.length,
            left: students.filter(s => s.disableInfo?.reason === 'Left School').length,
            transferred: students.filter(s => s.disableInfo?.reason === 'Transferred').length,
            expelled: students.filter(s => s.disableInfo?.reason === 'Expelled').length,
        };
    }, [students]);

    // --- 3. Action Handlers ---

    const handleAction = (type, data = null) => {
        setConfirmModal({ isOpen: true, type, data });
    };

    const confirmAction = async () => {
        const { type, data } = confirmModal;
        const promises = [];

        try {
            if (type === 'enable') {
                await axios.put(`${API_BASE}/Student/${data._id}`, { status: 'Active' });
                toast.success("Student enabled successfully!");
            } else if (type === 'delete') {
                await axios.delete(`${API_BASE}/Student/${data._id}`);
                toast.success("Student deleted permanently!");
            } else if (type === 'bulk-enable') {
                selectedStudents.forEach(id => {
                    promises.push(axios.put(`${API_BASE}/Student/${id}`, { status: 'Active' }));
                });
                await Promise.all(promises);
                toast.success(`${selectedStudents.length} students re-enabled!`);
                setSelectedStudents([]);
            } else if (type === 'bulk-delete') {
                selectedStudents.forEach(id => {
                    promises.push(axios.delete(`${API_BASE}/Student/${id}`));
                });
                await Promise.all(promises);
                toast.success(`${selectedStudents.length} records deleted permanently!`);
                setSelectedStudents([]);
            }
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        } finally {
            setConfirmModal({ isOpen: false, type: null, data: null });
        }
    };

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

    const toggleSelectStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(prev => prev.filter(sid => sid !== id));
        } else {
            setSelectedStudents(prev => [...prev, id]);
        }
    };

    // --- 4. Render Helpers ---

    const getReasonVariant = (reason) => {
        switch (reason) {
            case 'Left School': return 'default';
            case 'Transferred': return 'secondary';
            case 'Expelled': return 'destructive';
            case 'Medical': return 'outline';
            default: return 'secondary';
        }
    };

    const getModalContent = () => {
        const { type, data } = confirmModal;
        if (type === 'enable') return {
            title: "Re-enable Student?",
            desc: `Are you sure you want to re-active ${data?.name}? They will appear in the main student list again.`,
            confirmText: "Yes, Enable"
        };
        if (type === 'delete') return {
            title: "Delete Permanently?",
            desc: "This action cannot be undone. This will permanently delete the student and all their data.",
            confirmText: "Delete"
        };
        if (type === 'bulk-enable') return {
            title: `Re-enable ${selectedStudents.length} Students?`,
            desc: "Selected students will be moved back to the active list.",
            confirmText: "Enable All"
        };
        if (type === 'bulk-delete') return {
            title: `Delete ${selectedStudents.length} Students?`,
            desc: "This will permanently delete all selected student records. This cannot be undone.",
            confirmText: "Delete All"
        };
        return { title: "", desc: "", confirmText: "" };
    };

    const modalContent = getModalContent();

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            Disabled Students
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Manage records of students who have left, been transferred, or expelled.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Disabled', value: stats.total, icon: Ban, color: 'text-gray-500' },
                        { label: 'Left School', value: stats.left, icon: UserX, color: 'text-blue-500' },
                        { label: 'Transferred', value: stats.transferred, icon: RotateCcw, color: 'text-orange-500' },
                        { label: 'Expelled', value: stats.expelled, icon: AlertCircle, color: 'text-red-500' },
                    ].map((stat, i) => (
                        <Card key={i} className="shadow-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 opacity-20 ${stat.color}`} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background p-1 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-[350px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, roll, father..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterReason} onValueChange={setFilterReason}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by Reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Reasons</SelectItem>
                            <SelectItem value="Left School">Left School</SelectItem>
                            <SelectItem value="Transferred">Transferred</SelectItem>
                            <SelectItem value="Expelled">Expelled</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    {selectedStudents.length > 0 && (
                        <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-5">
                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                                {selectedStudents.length} Selected
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction('bulk-enable')}
                                className="h-9 border-green-200 hover:bg-green-50 text-green-700"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Enable
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction('bulk-delete')}
                                className="h-9 border-red-200 hover:bg-red-50 text-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                            <div className="h-6 w-[1px] bg-border mx-2" />
                        </div>
                    )}

                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className="h-8 w-8"
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className="h-8 w-8"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                ) : filteredStudents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed border-muted-foreground/25"
                        >
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <UserX className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">No disabled students found</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm text-center">
                                {searchQuery || filterReason !== 'all'
                                    ? "No results match your search or filter criteria."
                                    : "Students who are disabled/left will appear here."}
                            </p>
                            {(searchQuery || filterReason !== 'all') && (
                                <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(""); setFilterReason("all"); }}>
                                    Clear Filters
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="min-h-[400px]"
                            >
                                {viewMode === 'list' ? (
                                    <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                    <TableHead className="w-[50px] pl-4">
                                                        <Checkbox
                                                            checked={selectedStudents.length === filteredStudents.length}
                                                            onCheckedChange={toggleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Student Info</TableHead>
                                                    <TableHead>Class</TableHead>
                                                    <TableHead>Disable Info</TableHead>
                                                    <TableHead>Disabled Date</TableHead>
                                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStudents.map((student) => (
                                            <TableRow key={student._id} className={`group transition-colors ${selectedStudents.includes(student._id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                                                <TableCell className="pl-4">
                                                    <Checkbox
                                                        checked={selectedStudents.includes(student._id)}
                                                        onCheckedChange={() => toggleSelectStudent(student._id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-9 w-9 border">
                                                                    <AvatarImage src={student.studentPhoto?.startsWith('http') ? student.studentPhoto : `${API_BASE}/${student.studentPhoto}`} alt={student.name} />
                                                                    <AvatarFallback>{student.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span
                                                                        className="font-medium hover:underline cursor-pointer text-primary"
                                                                        onClick={(e) => handleNameClick(e, student._id)}
                                                                    >
                                                                        {student.name}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">{student.admissionNum}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-background">
                                                        {student.sclassName?.sclassName || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getReasonVariant(student.disableInfo?.reason)}>{student.disableInfo?.reason || 'Unknown'}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-mono">
                                                            {student.disableInfo?.disabledDate ? formatDateTime(student.disableInfo.disabledDate) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => { setCurrentStudent(student); setIsDetailsModalOpen(true); }}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction('enable', student)}>
                                                                <RotateCcw className="mr-2 h-4 w-4 text-green-600" /> Re-enable
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleAction('delete', student)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredStudents.map((student) => (
                                                <Card
                                                    key={student._id}
                                                    className={`overflow-hidden hover:shadow-lg transition-all group relative cursor-pointer ${selectedStudents.includes(student._id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                                    onClick={() => toggleSelectStudent(student._id)}
                                                >
                                        {selectedStudents.includes(student._id) && (
                                            <div className="absolute top-2 left-2 z-10">
                                                <CheckCircle className="h-6 w-6 text-primary fill-background" />
                                            </div>
                                        )}
                                        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-100 flex items-center justify-center relative">
                                            <div className="absolute top-2 right-2">
                                                <Badge variant={getReasonVariant(student.disableInfo?.reason)} className="shadow-sm">
                                                    {student.disableInfo?.reason}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardContent className="pt-0 relative flex flex-col items-center pb-6">
                                                        <Avatar className="h-20 w-20 border-4 border-background -mt-10 mb-3 shadow-md grayscale group-hover:grayscale-0 transition-all cursor-pointer" onClick={(e) => handleNameClick(e, student._id)}>
                                                 <AvatarImage src={student.studentPhoto?.startsWith('http') ? student.studentPhoto : `${API_BASE}/${student.studentPhoto}`} className="object-cover" />
                                                <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                                        <h3 className="font-bold text-lg text-center leading-tight mb-1 hover:underline cursor-pointer text-primary" onClick={(e) => handleNameClick(e, student._id)}>{student.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">Roll: {student.rollNum}</p>

                                            <div className="w-full grid grid-cols-2 gap-2 text-center text-sm border-t pt-2">
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">Class</span>
                                                    <span className="font-medium">{student.sclassName?.sclassName || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">Date</span>
                                                                <span className="font-medium">{student.disableInfo?.disabledDate ? formatDateTime(student.disableInfo.disabledDate) : '-'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-0 border-t bg-muted/50 grid grid-cols-2 divide-x">
                                            <Button variant="ghost" className="h-10 rounded-none w-full hover:text-green-600 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleAction('enable', student); }}>
                                                <RotateCcw className="h-4 w-4 mr-2" /> Enable
                                            </Button>
                                            <Button variant="ghost" className="h-10 rounded-none w-full hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleAction('delete', student); }}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                    </div>
                                )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Actions */}
            <ConfirmDeleteModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmAction}
                title={modalContent.title}
                description={modalContent.desc}
                confirmText={modalContent.confirmText}
            />

            {/* View Details */}
            <StudentDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                student={currentStudent}
            />
        </div>
    );
};

export default DisabledStudents;

