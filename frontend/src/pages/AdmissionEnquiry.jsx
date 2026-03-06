import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import API_URL from '../config/api.js';
import { TablePagination } from '@/components/TablePagination';
import EnquiryModal from '../components/form-popup/EnquiryModal';
import ConfirmDeleteModal from '../components/form-popup/ConfirmDeleteModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Copy,
    Star,
    Phone,
    Calendar,
    Users,
    UserPlus,
    School,
    GraduationCap,
    CheckCircle2,
    Clock,
    User,
    Mail,
    MapPin
} from 'lucide-react';

const API_BASE = API_URL;

const AdmissionEnquiry = () => {
    const { currentUser } = useAuth();
    
    // --- State Management ---
    const [enquiries, setEnquiries] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [teachersList, setTeachersList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEnquiry, setCurrentEnquiry] = useState(null);
    
    // Delete Confirmation State
    const [deleteItem, setDeleteItem] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // --- 1. Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;

            const [enqRes, classRes, teachRes] = await Promise.all([
                axios.get(`${API_BASE}/EnquiryList/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/Teachers/${schoolId}`).catch(() => ({ data: [] }))
            ]);

            setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
            setClassesList(Array.isArray(classRes.data) ? classRes.data : []);
            setTeachersList(Array.isArray(teachRes.data) ? teachRes.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // --- 2. Action Handlers ---

    // Add/Edit Submit Logic
    const handleFormSubmit = async (formData) => {
        try {
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const dataToSend = { ...formData, school: schoolId };
            
            // Check if it's an update (has _id) or a new creation (no _id or it's a copy)
            // Note: Copies have undefined _id, so they fall into the 'else' block
            if (currentEnquiry && currentEnquiry._id) {
                await axios.put(`${API_BASE}/EnquiryUpdate/${currentEnquiry._id}`, dataToSend);
                toast.success("Enquiry updated successfully!");
            } else {
                await axios.post(`${API_BASE}/EnquiryCreate`, dataToSend);
                toast.success("Enquiry created successfully!");
            }

            setIsModalOpen(false);
            setCurrentEnquiry(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save enquiry.");
        }
    };

    // Delete Logic
    const confirmDelete = async () => {
        if (!deleteItem) return;
        try {
            await axios.delete(`${API_BASE}/EnquiryDelete/${deleteItem._id}`);
            fetchData();
            toast.success("Enquiry deleted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Error deleting enquiry");
        }
        setDeleteItem(null);
    };

    const handleNameClick = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setIsDrawerOpen(true);
    };

    // Edit/Add/Copy Actions

    const handleEdit = (enquiry) => {
        setCurrentEnquiry(enquiry);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentEnquiry(null);
        setIsModalOpen(true);
    };

    const handleCopy = (enquiry) => {
        // Create a copy object.
        // Important: _id must be removed/undefined so the form treats it as new.
        const copiedData = {
            ...enquiry,
            _id: undefined, 
            name: `${enquiry.name} (Copy)`
        };
        setCurrentEnquiry(copiedData);
        setCurrentEnquiry(copiedData);
        setIsModalOpen(true);
        toast.info("Creating copy of enquiry");
    };

    const handleFavorite = (enquiry) => {
        toast.success(`${enquiry.name} marked as favorite!`);
        // Placeholder for favorite logic
    };

    // Filter enquiries
    const filteredEnquiries = enquiries.filter((enquiry) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            enquiry.name?.toLowerCase().includes(query) ||
            enquiry.phone?.toLowerCase().includes(query) ||
            enquiry.class?.sclassName?.toLowerCase().includes(query) ||
            enquiry.assigned?.name?.toLowerCase().includes(query)
        );
    });

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Compute paginated data
    const totalPages = Math.ceil(filteredEnquiries.length / rowsPerPage);
    const paginatedEnquiries = filteredEnquiries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Counts for cards
    const totalEnquiries = enquiries.length;
    const assignedEnquiries = enquiries.filter(e => e.assigned).length;
    const pendingEnquiries = enquiries.filter(e => !e.assigned).length;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary/90">Admission Enquiries</h2>
                    <p className="text-muted-foreground">
                        Manage and track incoming admission requests and student follow-ups.
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4" /> Add Enquiry
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Enquiries</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalEnquiries}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total registered enquiries
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Assigned</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{assignedEnquiries}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Handled by teachers/staff
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{pendingEnquiries}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting assignment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <div>
                            <CardTitle>Enquiries List</CardTitle>
                            <CardDescription>
                                A list of all admission enquiries including their details and status.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search enquiries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                <span>Loading data...</span>
                            </div>
                        </div>
                    ) : filteredEnquiries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/10 rounded-lg border border-dashed">
                                <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">No results found</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    No enquiries match your search criteria. Try adjusting filters or add a new enquiry.
                                </p>
                            </div>
                    ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Applicant Name</TableHead>
                                                <TableHead>Contact Info</TableHead>
                                                <TableHead>Class Interest</TableHead>
                                                <TableHead>Status / Assigned</TableHead>
                                                <TableHead>Date/Time</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedEnquiries.map((item) => (
                                        <TableRow key={item._id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-medium text-foreground hover:underline hover:text-primary transition-colors"
                                                        onClick={() => handleNameClick(item)}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    {item.noOfChild > 1 && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Users className="h-3 w-3" /> {item.noOfChild} Children
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Phone className="mr-2 h-3 w-3" />
                                                        {item.phone}
                                                    </div>
                                                    {item.email && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Mail className="mr-2 h-3 w-3" />
                                                            {item.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                                    <GraduationCap className="mr-1 h-3 w-3" />
                                                    {item.class?.sclassName || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.assigned?.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Assigned
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">to {item.assigned.name}</span>
                                                    </div>
                                                ) : (
                                                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            Pending
                                                        </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="mr-2 h-3 w-3" />
                                                    {formatDateTime(item.date)}
                                                </div>
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
                                                        <DropdownMenuItem onClick={() => handleNameClick(item)}>
                                                          <Users className="mr-2 h-4 w-4" />
                                                          View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCopy(item)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleFavorite(item)}>
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Mark Favorite
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                        totalRows={filteredEnquiries.length}
                                    />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <ConfirmDeleteModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={confirmDelete}
                title="Are you absolutely sure?"
                description={
                    <span>
                        This action cannot be undone. This will permanently delete the enquiry for
                        <span className="font-medium text-foreground"> {deleteItem?.name} </span>
                        and remove it from the system.
                    </span>
                }
                confirmText="Delete"
            />

            {/* Form Modal */}
            <EnquiryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentEnquiry}
                classesList={classesList}
                teachersList={teachersList}
                viewMode={false}
            />

            {/* Details Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Enquiry Details</SheetTitle>
                        <SheetDescription>
                            Detailed information for {selectedEnquiry?.name}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedEnquiry && (
                        <div className="mt-6 space-y-6">
                            {/* Personal Info Section */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Personal Information</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Full Name</div>
                                        <div className="col-span-2 font-medium">{selectedEnquiry.name}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" /> Phone
                                        </div>
                                        <div className="col-span-2">{selectedEnquiry.phone}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5" /> Email
                                        </div>
                                        <div className="col-span-2">{selectedEnquiry.email || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Children</div>
                                        <div className="col-span-2">{selectedEnquiry.noOfChild}</div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Academic Section */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Academic Interest</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <GraduationCap className="h-3.5 w-3.5" /> Class
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                {selectedEnquiry.class?.sclassName || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" /> Date
                                        </div>
                                        <div className="col-span-2">{formatDateTime(selectedEnquiry.date)}</div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Status Section */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Status & Assignment</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Status</div>
                                        <div className="col-span-2">
                                            {selectedEnquiry.assigned ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                    Assigned
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {selectedEnquiry.assigned && (
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="font-medium text-gray-500 flex items-center gap-2">
                                                <User className="h-3.5 w-3.5" /> Assigned To
                                            </div>
                                            <div className="col-span-2 font-medium">
                                                {selectedEnquiry.assigned.name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-2">
                                <Button className="w-full" variant="outline" onClick={() => {
                                    handleEdit(selectedEnquiry);
                                    setIsDrawerOpen(false);
                                }}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Details
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdmissionEnquiry;