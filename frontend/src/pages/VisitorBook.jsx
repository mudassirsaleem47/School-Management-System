import React, { useState, useEffect } from "react";
import { formatDateTime } from '../utils/formatDateTime';
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import API_URL from "../config/api";
import VisitorModal from "../components/form-popup/VisitorModal";
import { TablePagination } from '@/components/TablePagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Pencil,
    Copy,
    Star,
    Trash2,
    Loader2,
    MoreHorizontal,
    Calendar,
    Phone,
    CreditCard,
    User
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const API_BASE = API_URL;

const VisitorBook = () => {
    const { currentUser } = useAuth();

    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit'
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState(null);

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const response = await axios.get(`${API_BASE}/Visitors/${schoolId}`);
            setVisitors(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching visitors');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedVisitor(null);
        setModalMode("add");
        setIsModalOpen(true);
    };



    const handleEdit = (visitor) => {
        setSelectedVisitor(visitor);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleCopy = (visitor) => {
        const copiedData = { ...visitor, _id: undefined, visitorName: `${visitor.visitorName} (Copy)` };
        setSelectedVisitor(copiedData);
        setModalMode("add");
        setIsModalOpen(true);
        toast.info("Creating copy of visitor record");
    };

    const handleFavorite = (visitor) => {
        toast.success(`${visitor.visitorName} marked as favorite`);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const oldVisitors = [...visitors];
            setVisitors((prev) => prev.filter((v) => v._id !== deleteId));
            setIsDeleteOpen(false);

            await axios.delete(`${API_BASE}/Visitor/${deleteId}`);
            toast.success("Visitor record deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete record");
            fetchData(); 
        }
    };

    const handleNameClick = (visitor) => {
        setDrawerData(visitor);
        setIsDrawerOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const payload = { ...formData, adminID: currentUser._id, school: schoolId };

            if (modalMode === "add") {
                const res = await axios.post(`${API_BASE}/VisitorCreate`, payload);
                setVisitors((prev) => [res.data, ...prev]);
                toast.success("Visitor added successfully");
            } else if (modalMode === "edit" && selectedVisitor) {
                await axios.put(`${API_BASE}/Visitor/${selectedVisitor._id}`, payload);

                setVisitors((prev) =>
                    prev.map((v) =>
                        v._id === selectedVisitor._id ? { ...v, ...formData } : v
                    )
                );
                toast.success("Visitor updated successfully");
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const filteredVisitors = visitors.filter((visitor) => {
        const query = searchQuery.toLowerCase();
        const staffName = visitor.staff?.name?.toLowerCase() || "";
        const studentName = visitor.student?.name?.toLowerCase() || "";

        return (
            (visitor.visitorName?.toLowerCase() || "").includes(query) ||
            (visitor.purpose?.toLowerCase() || "").includes(query) ||
            (visitor.phone?.toLowerCase() || "").includes(query) ||
            staffName.includes(query) ||
            studentName.includes(query)
        );
    });

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Compute paginated data
    const totalPages = Math.ceil(filteredVisitors.length / rowsPerPage);
    const paginatedVisitors = filteredVisitors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary/90">Visitor Book</h2>
                    <p className="text-muted-foreground">
                        Manage visitor records and history.
                    </p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Visitor
                </Button>
            </div>

            {/* Main Content */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <div>
                            <CardTitle>Visitors List</CardTitle>
                            <CardDescription>
                                A list of all visitors including their details and status.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, purpose..."
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
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading visitors...</span>
                            </div>
                        </div>
                    ) : filteredVisitors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/10 rounded-lg border border-dashed">
                            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                                <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No results found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                No visitors match your search criteria. Try adjusting filters or add a new visitor.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Visitor Name</TableHead>
                                                <TableHead>Contact Info</TableHead>
                                                <TableHead>Meeting With</TableHead>
                                                <TableHead>Status / Time</TableHead>
                                                <TableHead>Date/Time</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedVisitors.map((visitor) => (
                                                <TableRow key={visitor._id} className="hover:bg-muted/5 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 border">
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {visitor.visitorName?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className="font-medium text-foreground cursor-pointer hover:underline hover:text-primary transition-colors"
                                                                    onClick={() => handleNameClick(visitor)}
                                                                >
                                                                    {visitor.visitorName}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    {visitor.numberOfPerson > 1 ? (
                                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                                            {visitor.numberOfPerson} People
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1">
                                                                            <CreditCard className="h-3 w-3" /> {visitor.idCard || 'No ID'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {visitor.phone && (
                                                                <div className="flex items-center text-sm">
                                                                    <Phone className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                                    {visitor.phone}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-muted-foreground truncate max-w-[150px] italic" title={visitor.purpose}>
                                                                "{visitor.purpose}"
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium">
                                                                {visitor.meetingWith === 'Staff'
                                                                    ? visitor.staff?.name
                                                                    : visitor.student?.name}
                                                            </span>
                                                            <Badge variant="outline" className="w-fit text-[10px] h-4 px-1 text-muted-foreground">
                                                                {visitor.meetingWith}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 font-medium">IN</Badge>
                                                                <span className="text-xs font-medium text-foreground">{visitor.inTime}</span>
                                                            </div>
                                                            {visitor.outTime ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 font-medium">OUT</Badge>
                                                                    <span className="text-xs font-medium text-muted-foreground">{visitor.outTime}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <Badge variant="outline" className="text-[10px] px-1.5">OUT</Badge>
                                                                    <span className="text-xs text-muted-foreground">--:--</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Calendar className="mr-2 h-3.5 w-3.5" />
                                                            {formatDateTime(visitor.date)}
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
                                                                <DropdownMenuItem onClick={() => handleEdit(visitor)}>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleCopy(visitor)}>
                                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleFavorite(visitor)}>
                                                                    <Star className="mr-2 h-4 w-4" /> Mark Favorite
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => confirmDelete(visitor._id)} className="text-destructive focus:text-destructive">
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
                                        totalRows={filteredVisitors.length}
                                    />
                                </div>
                    )}
                </CardContent>
            </Card>

            {/* Visitor Modal */}
            <VisitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedVisitor}
                viewMode={false}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Visitor Record?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the visitor record for
                            <span className="font-semibold text-foreground"> {visitors.find(v => v._id === deleteId)?.visitorName}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Visitor Details</SheetTitle>
                        <SheetDescription>
                            Complete information for {drawerData?.visitorName}
                        </SheetDescription>
                    </SheetHeader>
                    {drawerData && (
                        <div className="mt-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                        {drawerData.visitorName?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{drawerData.visitorName}</h3>
                                    <Badge variant="outline" className="mt-1">
                                        {drawerData.visitorID || 'Visitors ID: N/A'}
                                    </Badge>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Visit Details */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Visit Info</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" /> Date
                                        </div>
                                        <div className="col-span-2 font-medium">
                                            {formatDateTime(drawerData.date)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <CreditCard className="h-3.5 w-3.5" /> ID Card
                                        </div>
                                        <div className="col-span-2">{drawerData.idCard || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" /> Persons
                                        </div>
                                        <div className="col-span-2">{drawerData.numberOfPerson}</div>
                                    </div>
                                    <div className="col-span-3 text-sm italic border-l-2 pl-3 py-1 bg-muted/20">
                                        "{drawerData.purpose}"
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Meeting With */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Meeting With</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Person</div>
                                        <div className="col-span-2 font-medium">
                                            {drawerData.meetingWith === 'Staff'
                                                ? drawerData.staff?.name
                                                : drawerData.student?.name}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="font-medium text-gray-500">Role</div>
                                        <div className="col-span-2">
                                            <Badge variant="secondary">{drawerData.meetingWith}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <iframe className="w-full h-px bg-muted my-2" />

                            {/* Timings */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Timing</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase">In Time</span>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {drawerData.inTime}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase">Out Time</span>
                                        {drawerData.outTime ? (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {drawerData.outTime}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">--:--</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-2">
                                <Button className="w-full" variant="outline" onClick={() => {
                                    handleEdit(drawerData);
                                    setIsDrawerOpen(false);
                                }}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Record
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default VisitorBook;
