import React, { useState, useEffect, useMemo } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import { useNavigate, useOutletContext, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import API_URL from '@/config/api';
import { motion, AnimatePresence } from 'framer-motion';
import StudentModal from '../components/form-popup/StudentModal';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';
import ConfirmDeleteModal from '../components/form-popup/ConfirmDeleteModal';

import {
    Users,
    Search,
    MoreHorizontal,
    Plus,
    Trash2,
    Pencil,
    Copy,
    Star,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = API_URL;

const StudentList = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { setExtraBreadcrumb } = useOutletContext() || {};
    
    const [searchParams, setSearchParams] = useSearchParams();
    const currentClassId = searchParams.get('class');

    // --- State Management ---
    // Remove local viewMode and selectedClass state
    // viewMode is derived from whether a class is selected
    const [viewType, setViewType] = useState('list'); // 'list' | 'grid'
    const [classesList, setClassesList] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Derived Selection
    const selectedClass = useMemo(() => {
        return classesList.find(c => c._id === currentClassId) || null;
    }, [classesList, currentClassId]);

    const viewMode = selectedClass ? 'students' : 'classes';

    // Selected Data
    const [selectedStudents, setSelectedStudents] = useState([]); // Array of IDs

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");

    // Reset state on class change
    useEffect(() => {
        setSearchQuery("");
        setViewType('list');
        setSelectedStudents([]);
    }, [currentClassId]);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [deleteId, setDeleteId] = useState(null); // Single delete
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false); // Bulk delete confirm

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (currentUser) {
            fetchInitialData();
        }
    }, [currentUser]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const [classesRes, studentsRes] = await Promise.all([
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/Students/${schoolId}`)
            ]);
            setClassesList(Array.isArray(classesRes.data) ? classesRes.data : []);

            const fetchedStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            setStudents(fetchedStudents);

            // Handle Search Navigation
            if (location.state?.searchTarget && fetchedStudents.length > 0) {
                const targetId = location.state.searchTarget;
                const targetStudent = fetchedStudents.find(s => s._id === targetId);

                if (targetStudent) {
                    // If filtering relies on class selection, we might need to select the class too.
                    // For now, let's just set the search query which filters across the currently selected class or all? 
                    // Wait, `filteredStudents` depends on `selectedClass`. 
                    // If filter doesn't show students without a class selected, we must select the class.
                    if (targetStudent.sclassName) {
                        setSearchParams({ class: targetStudent.sclassName._id });
                    }
                    setSearchQuery(targetStudent.name || "");

                    // Clear state
                    window.history.replaceState({}, document.title);
                }
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // --- Derived Data ---
    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];

        let filtered = students.filter(s => s.sclassName?._id === selectedClass._id);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(query) ||
                s.rollNum?.toString().includes(query) ||
                s.father?.name?.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [students, selectedClass, searchQuery]);

    // --- Handlers ---

    const handleClassClick = (cls) => {
        setSearchParams({ class: cls._id });
    };

    const handleNameClick = (student) => {
        // Determine base path based on current URL
        const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${basePath}/students/${student._id}`);
    };

    // Breadcrumb Effect
    useEffect(() => {
        if (setExtraBreadcrumb) {
            if (viewMode === 'students' && selectedClass) {
                setExtraBreadcrumb(selectedClass.sclassName);
            } else {
                setExtraBreadcrumb(null);
            }
        }
    }, [viewMode, selectedClass]);

    const handleBackToClasses = () => {
        setSearchParams({});
    };

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

    const toggleSelectStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(prev => prev.filter(sId => sId !== id));
        } else {
            setSelectedStudents(prev => [...prev, id]);
        }
    };

    // Actions
    const handleAddStudent = () => {
        navigate('/admin/admission');
    };

    const handleEditStudent = (student) => {
        setCurrentStudent(student);
        setIsAddModalOpen(true);
    };



    const handleCopy = (student) => {
        const copiedData = { ...student, _id: undefined, name: `${student.name} (Copy)`, rollNum: '' };
        setCurrentStudent(copiedData);
        setIsAddModalOpen(true);
        toast.info("Creating copy of student record");
    };

    const handleFavorite = (student) => {
        toast.success(`${student.name} marked as favorite`);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const payload = { ...formData, school: currentUser._id };

            // Handle Disable Logic
            if (payload.status === 'Disabled') {
                payload.disableInfo = {
                    reason: payload.disableReason, // Now using the selected enum
                    description: payload.disableDescription || "", // Optional description
                    disabledDate: new Date(),
                    disabledBy: currentUser._id
                };
                delete payload.disableReason;
                delete payload.disableDescription;
            }

            if (currentStudent) {
                // Clean payload for update
                const { password, ...updateData } = payload;
                await axios.put(`${API_BASE}/Student/${currentStudent._id}`, updateData);
                toast.success("Student updated successfully");
            } else {
                await axios.post(`${API_BASE}/StudentRegister`, payload);
                toast.success("Student registered successfully");
            }

            setIsAddModalOpen(false);
            fetchInitialData();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        }
    };

    // Delete Logic
    const handleDeleteSingle = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API_BASE}/Student/${deleteId}`);
            toast.success("Student deleted");
            setStudents(prev => prev.filter(s => s._id !== deleteId));
            setSelectedStudents(prev => prev.filter(id => id !== deleteId));
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete");
        }
        setDeleteId(null);
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        try {
            const deletePromises = selectedStudents.map(id => axios.delete(`${API_BASE}/Student/${id}`));
            await Promise.all(deletePromises);

            toast.success(`${selectedStudents.length} students deleted`);
            setStudents(prev => prev.filter(s => !selectedStudents.includes(s._id)));
            setSelectedStudents([]);
            setIsBulkDeleteOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete some students");
        }
    };

    // Helper: Get student count for a class
    const getCount = (classId) => students.filter(s => s.sclassName?._id === classId).length;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Student Management
                    </h2>
                    <p className="text-muted-foreground">
                        {viewMode === 'classes'
                            ? 'Select a class to view and manage students' 
                            : `Manage students, admissions, and records for ${selectedClass?.sclassName}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handleAddStudent} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
                {viewMode === 'classes' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4"
                        key="classes-grid"
                    >
                        {loading ? Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-xl" />
                        )) : classesList.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                No classes found. Create a class first.
                            </div>
                        ) : (
                            classesList.map((cls) => (
                                <Card
                                    key={cls._id}
                                    className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group overflow-hidden"
                                    onClick={() => handleClassClick(cls)}
                                >
                                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100" />
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex justify-between items-center text-xl">
                                            {cls.sclassName}
                                            <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                Class
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{cls.sections?.length || 0} Sections</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                            <Users className="h-4 w-4" />
                                            <span className="font-medium text-2xl">{getCount(cls._id)}</span>
                                            <span className="text-sm">Students</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/20 py-3 text-xs text-muted-foreground group-hover:bg-primary/5 transition-colors">
                                        Click to view students
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 pt-2"
                        key="student-table"
                    >
                        {/* Controls Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background p-1 rounded-lg">
                            {/* Search & Bulk Actions Group */}
                            <div className="flex flex-1 items-center gap-2 w-full">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, roll no..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Bulk Actions */}
                                    {selectedStudents.length > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md animate-in fade-in slide-in-from-right-5 border">
                                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                                                {selectedStudents.length} Selected
                                            </span>
                                            <div className="h-4 w-[1px] bg-border mx-2" />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setIsBulkDeleteOpen(true)}
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* View Switcher */}
                                <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
                                    <Button
                                        variant={viewType === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewType('list')}
                                        className="h-8 w-8"
                                        title="List View"
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewType === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewType('grid')}
                                        className="h-8 w-8"
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Students Content */}
                            {viewType === 'list' ? (
                                <div className="rounded-md border bg-card shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="w-[50px] pl-4">
                                                    <Checkbox
                                                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                                        onCheckedChange={toggleSelectAll}
                                                        aria-label="Select all"
                                                    />
                                                </TableHead>
                                                <TableHead className="text-xs font-bold uppercase">ID#</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Student Name</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Roll No</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Class (Section)</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Father Name</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">DOB</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Gender</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Mobile</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Religion</TableHead>
                                                <TableHead className="text-xs font-bold uppercase">Cast</TableHead>
                                                <TableHead className="text-right pr-6 text-xs font-bold uppercase">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                                                        No students found in this class.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                    filteredStudents.map((student) => (
                                                        <TableRow
                                                            key={student._id}
                                                            className={`group transition-colors ${selectedStudents.includes(student._id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                                        >
                                                            <TableCell className="pl-4">
                                                                <Checkbox
                                                                    checked={selectedStudents.includes(student._id)}
                                                                    onCheckedChange={() => toggleSelectStudent(student._id)}
                                                                    aria-label={`Select ${student.name}`}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-xs font-mono">
                                                                {student.admissionNum || 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8 border shrink-0">
                                                                        <AvatarImage src={`${API_BASE}/${student.studentPhoto}`} />
                                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span
                                                                            className="font-semibold text-sm hover:underline hover:text-primary cursor-pointer transition-colors truncate"
                                                                            onClick={() => handleNameClick(student)}
                                                                            title={student.name}
                                                                        >
                                                                            {student.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground truncate">{student.email || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                <Badge variant="secondary" className="font-mono text-[10px]">{student.rollNum}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {student.sclassName?.sclassName} ({student.section || 'N/A'})
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {student.father?.name || 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {student.dateOfBirth ? formatDateTime(student.dateOfBirth, { dateOnly: true }) : 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                <Badge variant="outline" className="text-[10px] py-0">{student.gender}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {student.mobileNumber || student.father?.phone || 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {student.religion || 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {student.caste || 'N/A'}
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
                                                                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleCopy(student)}>
                                                                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleFavorite(student)}>
                                                                            <Star className="mr-2 h-4 w-4" /> Mark Favorite
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(student._id)}>
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredStudents.length === 0 ? (
                                            <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
                                                No students found.
                                            </div>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <Card
                                                    key={student._id}
                                                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 group relative border-muted/60 ${selectedStudents.includes(student._id) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'}`}
                                                >
                                                {/* Selection Overlay/Checkbox */}
                                                <div className="absolute top-3 left-3 z-20">
                                                    <Checkbox
                                                        checked={selectedStudents.includes(student._id)}
                                                        onCheckedChange={() => toggleSelectStudent(student._id)}
                                                        className={`transition-all data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${selectedStudents.includes(student._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-background/80 backdrop-blur-sm border-muted-foreground/40`}
                                                    />
                                                </div>

                                                {/* Card Header / Banner */}
                                                <div className="h-28 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative">
                                                    <div className="absolute top-3 right-3">
                                                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm text-xs font-medium">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <CardContent className="pt-0 relative flex flex-col items-center pb-0">
                                                    {/* Avatar */}
                                                    <div className="relative -mt-12 mb-3 group-hover:scale-105 transition-transform duration-300">
                                                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                                            <AvatarImage src={`${API_BASE}/${student.studentPhoto}`} className="object-cover" />
                                                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                                                {student.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${student.status === 'Active' || !student.status ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    </div>

                                                    {/* Student Info */}
                                                    <div className="text-center w-full px-1 space-y-1 mb-6">
                                                            <h3
                                                                className="font-bold text-lg leading-tight truncate px-2 hover:underline hover:text-primary cursor-pointer transition-colors"
                                                                title={student.name}
                                                                onClick={() => handleNameClick(student)}
                                                            >
                                                            {student.name}
                                                        </h3>
                                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                            Roll No: {student.rollNum}
                                                        </div>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t py-4 px-2">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Father</span>
                                                            <span className="font-medium truncate text-foreground/90" title={student.father?.name || 'N/A'}>
                                                                {student.father?.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 text-right">
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</span>
                                                            <span className="font-medium truncate text-foreground/90" title={student.father?.phone || 'N/A'}>
                                                                {student.father?.phone || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                {/* Actions Footer */}
                                                <CardFooter className="p-0 border-t bg-muted/40 grid grid-cols-3 divide-x divide-border/60">

                                                    <Button
                                                        variant="ghost"
                                                        className="h-11 rounded-none w-full hover:bg-background hover:text-blue-600 transition-colors group/btn"
                                                        onClick={() => handleEditStudent(student)}
                                                        title="Edit Student"
                                                    >
                                                        <Pencil className="h-4 w-4 text-muted-foreground group-hover/btn:text-blue-600 transition-colors" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-11 rounded-none w-full hover:bg-background hover:text-destructive transition-colors group/btn"
                                                        onClick={() => setDeleteId(student._id)}
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-muted-foreground group-hover/btn:text-destructive transition-colors" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                        )}
                                </div>
                            )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <StudentModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentStudent}
                classesList={classesList}
            />



            {/* Single Delete Alert */}
            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteSingle}
                title="Delete Student?"
                description="This action cannot be undone. This will permanently delete the student account."
            />

            {/* Bulk Delete Alert */}
            <ConfirmDeleteModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedStudents.length} Students?`}
                description={`Are you sure you want to delete these ${selectedStudents.length} students? This action cannot be undone.`}
                confirmText="Delete All Selected"
            />

            {/* View Details Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Student Profile</SheetTitle>
                        <SheetDescription>
                            Complete profile information for {drawerData?.name}
                        </SheetDescription>
                    </SheetHeader>
                    {drawerData && (
                        <div className="mt-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg border border-dashed">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-3">
                                    <AvatarImage src={`${API_BASE}/${drawerData.studentPhoto}`} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                        {drawerData.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold">{drawerData.name}</h3>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">Roll: {drawerData.rollNum}</Badge>
                                    <Badge variant="secondary">{drawerData.sclassName?.sclassName || 'No Class'}</Badge>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Personal Details */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Personal Details</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Gender</div>
                                        <div className="col-span-2 capitalize">{drawerData.gender}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">DOB</div>
                                        <div className="col-span-2">
                                            {drawerData.dob ? formatDateTime(drawerData.dob, { dateOnly: true }) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Email</div>
                                        <div className="col-span-2 break-all">{drawerData.email || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Address</div>
                                        <div className="col-span-2">{drawerData.address || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Parents / Guardian */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Parent Information</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Father's Name</div>
                                        <div className="col-span-2 font-medium">{drawerData.fatherName || drawerData.father?.name || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Mother's Name</div>
                                        <div className="col-span-2">{drawerData.motherName || drawerData.mother?.name || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Phone</div>
                                        <div className="col-span-2 font-medium">{drawerData.phone || drawerData.father?.phone || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Academic Status */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">School Status</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Admission Date</div>
                                        <div className="col-span-2">
                                            {drawerData.admissionDate ? formatDateTime(drawerData.admissionDate) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Academic Year</div>
                                        <div className="col-span-2">
                                            {drawerData.academicYear || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Current Status</div>
                                        <div className="col-span-2">
                                            <Badge className={drawerData.status === 'Active' || !drawerData.status ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700'}>
                                                {drawerData.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 grid grid-cols-1 gap-3">
                                <Button className="w-full" onClick={() => {
                                    handleEditStudent(drawerData);
                                    setIsDrawerOpen(false);
                                }}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Student
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    );
};

export default StudentList;
