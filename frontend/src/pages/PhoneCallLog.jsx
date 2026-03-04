import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import PhoneCallModal from '../components/form-popup/PhoneCallModal';
import { TablePagination } from '@/components/TablePagination';

// Icons
import {
    Edit,
    Trash2,
    Plus,
    Eye,
    PhoneIncoming,
    PhoneOutgoing,
    Search,
    Phone,
    Calendar,
    Filter,
    MoreHorizontal
} from 'lucide-react';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

const PhoneCallLog = () => {
    const { currentUser } = useAuth();
    
    // --- State Management ---
    const [phoneCalls, setPhoneCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCall, setCurrentCall] = useState(null);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState(null);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Filter/Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- 1. Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            setPhoneCalls([]); // Clear old list

            const response = await axios.get(`${API_BASE}/PhoneCalls/${schoolId}`);
            if (response.data && Array.isArray(response.data)) {
                setPhoneCalls(response.data);
            } else {
                setPhoneCalls([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching phone calls');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // --- 2. Action Handlers ---

    const handleFormSubmit = async (formData) => {
        try {
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const dataToSend = { ...formData, school: schoolId };
            
            if (currentCall) {
                // UPDATE
                await axios.put(`${API_BASE}/PhoneCall/${currentCall._id}`, dataToSend);
                toast.success("Phone call updated successfully");
            } else {
                // CREATE
                await axios.post(`${API_BASE}/PhoneCallCreate`, dataToSend);
                toast.success("Phone call recorded successfully");
            }

            setIsModalOpen(false);
            setCurrentCall(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save phone call");
        }
    };

    // Actual Delete Function
    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`${API_BASE}/PhoneCall/${itemToDelete}`);
            fetchData();
            toast.success("Phone call deleted");
        } catch (err) {
            console.error(err);
            toast.error("Error deleting phone call");
        }
        setItemToDelete(null);
        setIsDeleteOpen(false);
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleNameClick = (call) => {
        setDrawerData(call);
        setIsDrawerOpen(true);
    };



    // Edit Button Click Logic
    const handleEdit = (call) => {
        setCurrentCall(call);
        setIsModalOpen(true);
    };

    // Add Button Click Logic
    const handleAdd = () => {
        setCurrentCall(null);
        setIsModalOpen(true);
    };

    // Filter phone calls based on search & filter
    const filteredCalls = phoneCalls.filter((call) => {
        const matchesSearch =
            !searchQuery ||
            call.callerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            call.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            call.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || call.callType === typeFilter;

        return matchesSearch && matchesType;
    });

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter]);

    // Compute paginated data
    const totalPages = Math.ceil(filteredCalls.length / rowsPerPage);
    const paginatedCalls = filteredCalls.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary/90">Phone Call Log</h2>
                    <p className="text-muted-foreground">
                        Track and manage incoming and outgoing phone calls.
                    </p>
                </div>
                <Button onClick={handleAdd} className="ml-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Call
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <CardTitle className="text-lg font-medium">Recorded Calls</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search calls..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 w-full sm:w-[250px]"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Call Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Incoming">Incoming</SelectItem>
                                    <SelectItem value="Outgoing">Outgoing</SelectItem>
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
                    ) : filteredCalls.length === 0 ? (
                            <div className="text-center py-10">
                                <Phone className="mx-auto h-12 w-12 text-muted-foreground/20" />
                                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No calls found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? "Try adjusting your search filters." : "Start by adding a new phone call."}
                                </p>
                        </div>
                    ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Caller Name</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead className="hidden md:table-cell">Purpose</TableHead>
                                                <TableHead className="hidden md:table-cell">Duration</TableHead>
                                                <TableHead>Follow-up</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedCalls.map((call) => (
                                        <TableRow key={call._id}>
                                            <TableCell className="font-medium">
                                                <span
                                                    className="cursor-pointer hover:underline hover:text-primary transition-colors"
                                                    onClick={() => handleNameClick(call)}
                                                >
                                                    {call.callerName}
                                                </span>
                                            </TableCell>
                                            <TableCell>{call.phone}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={call.callType === 'Incoming' ? "success" : "secondary"}
                                                    className={`gap-1 ${call.callType === 'Incoming' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'}`}
                                                >
                                                    {call.callType === 'Incoming' ? <PhoneIncoming className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
                                                    {call.callType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{formatDateTime(call.callDate)}</span>
                                                    <span className="text-xs text-muted-foreground">{call.callTime}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={call.purpose}>
                                                {call.purpose || '-'}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{call.callDuration || '-'}</TableCell>
                                            <TableCell>
                                                {call.followUpRequired ? (
                                                    <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                                        Required
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
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                        <DropdownMenuItem onClick={() => handleEdit(call)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Record
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(call._id)} className="text-red-600 focus:text-red-600">
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
                                        totalRows={filteredCalls.length}
                                    />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Popup Modal Component */}
            <PhoneCallModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentCall}
                viewMode={false}
            />

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Call Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the call record for
                            <span className="font-semibold text-foreground"> {phoneCalls.find(c => c._id === itemToDelete)?.callerName}</span>.
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
                        <SheetTitle>Call Details</SheetTitle>
                        <SheetDescription>
                            Complete information for call with {drawerData?.callerName}
                        </SheetDescription>
                    </SheetHeader>
                    {drawerData && (
                        <div className="mt-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${drawerData.callType === 'Incoming' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {drawerData.callType === 'Incoming' ? <PhoneIncoming className="h-6 w-6" /> : <PhoneOutgoing className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{drawerData.callerName}</h3>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {drawerData.phone}
                                    </span>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Call Info */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Call Info</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Type</div>
                                        <div className="col-span-2">
                                            <Badge
                                                variant={drawerData.callType === 'Incoming' ? "success" : "secondary"}
                                                className={`gap-1 ${drawerData.callType === 'Incoming' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}
                                            >
                                                {drawerData.callType}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" /> Date
                                        </div>
                                        <div className="col-span-2 font-medium">
                                            {formatDateTime(drawerData.callDate)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Time</div>
                                        <div className="col-span-2 font-medium">{drawerData.callTime}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Duration</div>
                                        <div className="col-span-2">{drawerData.callDuration || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Purpose & Follow-up */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Details</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Purpose</div>
                                        <div className="text-sm p-3 bg-muted/30 rounded-md italic border">
                                            "{drawerData.purpose || 'No purpose recorded'}"
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs font-semibold text-gray-500 uppercase">Description / Notes</div>
                                        <div className="text-sm p-3 bg-muted/30 rounded-md border min-h-[60px]">
                                            {drawerData.description || 'No additional notes.'}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-md bg-amber-50/50 border-amber-100">
                                        <span className="text-sm font-medium text-amber-900">Follow-up Required?</span>
                                        {drawerData.followUpRequired ? (
                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">Yes</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">No</Badge>
                                        )}
                                    </div>
                                    {drawerData.followUpRequired && drawerData.followUpDate && (
                                        <div className="grid grid-cols-3 gap-2 text-sm pt-2">
                                            <div className="font-medium text-gray-500">Follow-up Date</div>
                                            <div className="col-span-2 font-medium text-amber-700">
                                                {formatDateTime(drawerData.followUpDate)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-2">
                                <Button className="w-full" variant="outline" onClick={() => {
                                    handleEdit(drawerData);
                                    setIsDrawerOpen(false);
                                }}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit Record
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default PhoneCallLog;

