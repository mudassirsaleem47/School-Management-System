import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ComplainModal from '../components/form-popup/ComplainModal';
import { TablePagination } from '@/components/TablePagination';
import {
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    AlertCircle,
    Check,

    MoreHorizontal,
    Phone,
    Calendar
} from 'lucide-react';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const ComplainPage = () => {
    const { currentUser } = useAuth();
    
    // --- State Management ---
    const [complains, setComplains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplain, setSelectedComplain] = useState(null);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState(null);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // --- 1. Data Fetching ---
    useEffect(() => {
        if (currentUser) {
            fetchComplains();
        }
    }, [currentUser]);

    const fetchComplains = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const res = await axios.get(`${API_BASE}/Complains/${schoolId}`);
            setComplains(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching complains');
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Action Handlers ---
    const handleAdd = () => {
        setSelectedComplain(null);
        setIsModalOpen(true);
    };

    const handleNameClick = (complain) => {
        setDrawerData(complain);
        setIsDrawerOpen(true);
    };

    const handleEdit = (complain) => {
        setSelectedComplain(complain);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`${API_BASE}/Complain/${itemToDelete}`);
            toast.success('Complain deleted successfully');
            fetchComplains();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting complain');
        }
        setItemToDelete(null);
        setIsDeleteOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {
            const formDataToSend = new FormData();
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            formDataToSend.append('school', schoolId);
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    if (key === 'document') {
                        if (formData[key] instanceof File) {
                            formDataToSend.append(key, formData[key]);
                        } 
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });
            
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (selectedComplain) {
                await axios.put(`${API_BASE}/Complain/${selectedComplain._id}`, formDataToSend, config);
                toast.success('Complain updated successfully');
            } else {
                await axios.post(`${API_BASE}/ComplainCreate`, formDataToSend, config);
                toast.success('Complain added successfully');
            }
            
            setIsModalOpen(false);
            fetchComplains();
        } catch (error) {
            console.error(error);
            toast.error('Error saving complain');
        }
    };

    const filteredComplains = complains.filter(complain =>
        complain.complainBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complain.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complain.assigned?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Compute paginated data
    const totalPages = Math.ceil(filteredComplains.length / rowsPerPage);
    const paginatedComplains = filteredComplains.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Complain</h2>
                    <p className="text-muted-foreground">
                        Manage and track all complaints from students and staff.
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Complain
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <CardTitle className="text-lg font-medium">Complaint List</CardTitle>
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : filteredComplains.length === 0 ? (
                            <div className="text-center py-10">
                                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/20" />
                                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No complaints found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm ? "Try adjusting your search terms." : "Start by adding a new complaint."}
                                </p>
                            </div>
                        ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Complain By</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Date/Time</TableHead>
                                                <TableHead className="max-w-[300px]">Description</TableHead>
                                                <TableHead>Assigned</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedComplains.map((complain) => (
                                                <TableRow key={complain._id}>
                                                    <TableCell className="font-medium">
                                                        <span
                                                            className="cursor-pointer hover:underline hover:text-primary transition-colors"
                                                            onClick={() => handleNameClick(complain)}
                                                        >
                                                            {complain.complainBy}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{complain.phone || '-'}</TableCell>
                                                    <TableCell>
                                                        {formatDateTime(complain.date)}
                                                    </TableCell>
                                                    <TableCell className="max-w-[300px]">
                                                        <p className="truncate text-muted-foreground" title={complain.description}>
                                                            {complain.description}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        {complain.assigned ? (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200">
                                                                {complain.assigned}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
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
                                                                <DropdownMenuItem onClick={() => handleEdit(complain)}>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Record
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleDeleteClick(complain._id)} className="text-red-600 focus:text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Record
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
                                        totalRows={filteredComplains.length}
                                    />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ComplainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedComplain}
                viewMode={false}
            />

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Complaint?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the complaint record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setItemToDelete(null); setIsDeleteOpen(false); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Details Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Complaint Details</SheetTitle>
                        <SheetDescription>
                            Full details for complaint by {drawerData?.complainBy}
                        </SheetDescription>
                    </SheetHeader>
                    {drawerData && (
                        <div className="mt-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{drawerData.complainBy}</h3>
                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                        {drawerData.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {drawerData.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Main Details */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Complaint Info</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Type</div>
                                        <div className="col-span-2">
                                            <Badge variant="outline">{drawerData.complainType || 'General'}</Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Source</div>
                                        <div className="col-span-2">{drawerData.source || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" /> Date
                                        </div>
                                        <div className="col-span-2 font-medium">
                                            {formatDateTime(drawerData.date)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Description</h3>
                                <div className="p-3 bg-muted/30 rounded-md border text-sm italic">
                                    "{drawerData.description || 'No description provided.'}"
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Resolution Status */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Resolution</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Assigned To</div>
                                        <div className="col-span-2">
                                            {drawerData.assigned ? (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                                                    {drawerData.assigned}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Action Taken</div>
                                        <div className="col-span-2">{drawerData.actionTaken || 'Pending'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Note</div>
                                        <div className="col-span-2 text-muted-foreground">{drawerData.note || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments */}
                            {drawerData.document && (
                                <div className="pt-2">
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`${API_BASE}/${drawerData.document}`} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4 mr-2" /> View Attached Document
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 flex gap-2">
                                <Button className="w-full" variant="outline" onClick={() => {
                                    handleEdit(drawerData);
                                    setIsDrawerOpen(false);
                                }}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Complaint
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ComplainPage;

