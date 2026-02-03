import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EnquiryModal from '../components/form-popup/EnquiryModal';
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
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
    EmptyMedia,
} from '@/components/ui/empty';
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconEye,
    IconCheck,
    IconSearch,
    IconUserPlus,
    IconUsers,
    IconPhone,
    IconCalendar,
    IconSchool,
    IconLoader2,
} from '@tabler/icons-react';

const API_BASE = "http://localhost:5000";

const AdmissionEnquiry = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [enquiries, setEnquiries] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [teachersList, setTeachersList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEnquiry, setCurrentEnquiry] = useState(null);
    
    // Delete Confirmation State
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // View Mode State
    const [viewMode, setViewMode] = useState(false);

    // --- 1. Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;

            setEnquiries([]);
            setClassesList([]);
            setTeachersList([]);
            
            const [enqRes, classRes, teachRes] = await Promise.all([
                axios.get(`${API_BASE}/EnquiryList/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/Teachers/${schoolId}`).catch(() => ({ data: [] }))
            ]);

            setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
            setClassesList(classRes.data);
            setTeachersList(teachRes.data);
        } catch (err) {
            showToast("Error loading data", "error");
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
            const dataToSend = { ...formData, school: currentUser._id };
            
            if (currentEnquiry) {
                await axios.put(`${API_BASE}/EnquiryUpdate/${currentEnquiry._id}`, dataToSend);
            } else {
                await axios.post(`${API_BASE}/EnquiryCreate`, dataToSend);
            }

            setIsModalOpen(false);
            setCurrentEnquiry(null);
            fetchData();
            showToast("Enquiry saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save enquiry.", "error");
        }
    };

    // Delete Logic
    const handleDelete = (id) => {
        if (selectedDeleteId === id) {
            confirmDelete();
        } else {
            setSelectedDeleteId(id);
            setTimeout(() => setSelectedDeleteId(prev => prev === id ? null : prev), 3000);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/EnquiryDelete/${selectedDeleteId}`);
            fetchData();
            showToast("Enquiry deleted successfully!", "success");
        } catch (err) {
            showToast("Error deleting enquiry", "error");
        }
        setSelectedDeleteId(null);
    };

    // View Button Click Logic
    const handleView = (enquiry) => {
        setCurrentEnquiry(enquiry);
        setViewMode(true);
        setIsModalOpen(true);
    };

    // Edit/Add Logic
    const handleEdit = (enquiry) => {
        setCurrentEnquiry(enquiry);
        setViewMode(false);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentEnquiry(null);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Filter enquiries based on search query
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

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admission Enquiries</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all incoming admission enquiries
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <IconPlus className="w-4 h-4" />
                    Add Enquiry
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enquiries.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total admission enquiries
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                        <IconUserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enquiries.filter(e => e.assigned).length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Assigned to teachers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enquiries.filter(e => !e.assigned).length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting assignment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Enquiries List</CardTitle>
                    <CardDescription>
                        View and manage all admission enquiries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, phone, class..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <IconLoader2 className="animate-spin" />
                                </EmptyMedia>
                                <EmptyTitle>Loading enquiries...</EmptyTitle>
                                <EmptyDescription>Please wait while we fetch the data</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : enquiries.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <IconUsers />
                                    </EmptyMedia>
                                    <EmptyTitle>No enquiries yet</EmptyTitle>
                                    <EmptyDescription>
                                        Get started by adding your first enquiry
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onClick={handleAdd} className="gap-2">
                                        <IconPlus className="w-4 h-4" />
                                        Add Enquiry
                                    </Button>
                                </EmptyContent>
                            </Empty>
                    ) : filteredEnquiries.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <IconSearch />
                                        </EmptyMedia>
                                        <EmptyTitle>No results found</EmptyTitle>
                                        <EmptyDescription>
                                            No enquiries match your search criteria
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                    ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Class</TableHead>
                                                    <TableHead>Assigned To</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                    {filteredEnquiries.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <IconPhone className="w-3 h-3 text-muted-foreground" />
                                                    {item.phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="gap-1">
                                                    <IconSchool className="w-3 h-3" />
                                                    {item.class?.sclassName || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.assigned?.name ? (
                                                    <Badge variant="outline" className="gap-1">
                                                        <IconUserPlus className="w-3 h-3" />
                                                        {item.assigned.name}
                                                    </Badge>
                                                ) : (
                                                        <span className="text-xs text-muted-foreground">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <IconCalendar className="w-3 h-3" />
                                                    {new Date(item.date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleView(item)}
                                                        title="View details"
                                                    >
                                                        <IconEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit enquiry"
                                                    >
                                                        <IconEdit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant={selectedDeleteId === item._id ? "destructive" : "ghost"}
                                                        size="icon"
                                                        onClick={() => handleDelete(item._id)}
                                                        title={selectedDeleteId === item._id ? "Click to confirm" : "Delete enquiry"}
                                                    >
                                                        {selectedDeleteId === item._id ? (
                                                            <IconCheck className="w-4 h-4" />
                                                        ) : (
                                                                <IconTrash className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                            </TableBody>
                                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Popup Modal Component */}
            <EnquiryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentEnquiry}
                classesList={classesList}
                teachersList={teachersList}
                viewMode={viewMode}
            />
        </div>
    );
};

export default AdmissionEnquiry;