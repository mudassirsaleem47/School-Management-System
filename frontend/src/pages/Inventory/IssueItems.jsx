import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    PackageOpen,
    Search,
    Plus,
    CheckCircle2,
    CalendarIcon,
    Trash2
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const API_BASE = API_URL;

const IssueItems = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Form Data
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState('');
    const [note, setNote] = useState('');
    
    // Role selection state
    const [issuedToRole, setIssuedToRole] = useState('Staff');
    const [issuedToId, setIssuedToId] = useState('');
    
    // Dependent lists for dropdown
    const [staffList, setStaffList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    
    // Fetch issued items
    const fetchIssuedItems = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Inventory/IssueItem/${currentUser._id}`);
            setItems(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch issued items", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch lists (Staff/Students)
    const fetchUsers = async () => {
        if (!currentUser) return;
        try {
            const staffRes = await axios.get(`${API_BASE}/Staff/GetAll/${currentUser._id}`);
            setStaffList(staffRes.data);
            
            const studentRes = await axios.get(`${API_BASE}/Student/GetAll/${currentUser._id}`);
            setStudentList(studentRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchIssuedItems();
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Save issue item
    const handleIssueItem = async (e) => {
        e.preventDefault();
        if (!itemName || !category || !issuedToRole || !issuedToId || !issueDate || !returnDate) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setProcessing(true);
            const payload = {
                school: currentUser._id,
                itemName,
                category,
                issuedToRole,
                issuedToId,
                issueDate,
                returnDate,
                note
            };

            await axios.post(`${API_BASE}/Inventory/IssueItem`, payload);
            showToast("Item issued successfully", "success");
            
            // Reset form
            setIsModalOpen(false);
            setItemName('');
            setCategory('');
            setIssuedToId('');
            setReturnDate('');
            setNote('');
            
            fetchIssuedItems();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to issue item", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleReturnItem = async (id) => {
        try {
            await axios.put(`${API_BASE}/Inventory/IssueItem/${id}`, { status: 'Returned' });
            showToast("Item marked as returned", "success");
            fetchIssuedItems();
        } catch (error) {
            console.error(error);
            showToast("Failed to update status", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.delete(`${API_BASE}/Inventory/IssueItem/${id}`);
            showToast("Record deleted", "success");
            fetchIssuedItems();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete record", "error");
        }
    };

    const filteredItems = items.filter(item => 
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuedToUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Issue Items</h2>
                    <p className="text-muted-foreground">Manage and track inventory items assigned to staff and students</p>
                </div>
                
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Issue Item
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageOpen className="h-5 w-5 text-muted-foreground"/> 
                            Issued Inventory
                        </CardTitle>
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items or users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center border border-dashed rounded-lg m-4">
                            <PackageOpen className="h-12 w-12 mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium text-foreground">No Items Issued</p>
                            <p className="max-w-sm mt-2 text-sm">Issue inventory like books, laptops, or equipment to track them here.</p>
                            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4">
                                Issue First Item
                            </Button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No records matched your search.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 whitespace-nowrap">
                                        <TableHead className="pl-6">Item details</TableHead>
                                        <TableHead>Issued To</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="font-medium text-primary">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground">{item.category}</div>
                                                {item.note && <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={item.note}>Note: {item.note}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.issuedToUser?.name}</div>
                                                <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5">{item.issuedToRole}</Badge>
                                                    <span>
                                                        {item.issuedToRole === 'Staff' 
                                                            ? (item.issuedToUser?.role || 'Staff')
                                                            : (item.issuedToUser?.sclassName || 'Student')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3 text-muted-foreground"/>
                                                    <span>Issue: {format(new Date(item.issueDate), 'dd MMM, yyyy')}</span>
                                                </div>
                                                <div className="text-sm flex items-center gap-1 mt-1 text-red-600/80">
                                                    <CalendarIcon className="h-3 w-3"/>
                                                    <span>Return: {format(new Date(item.returnDate), 'dd MMM, yyyy')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.status === 'Issued' ? (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-medium">Issued</Badge>
                                                ) : (
                                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Returned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2 items-center">
                                                    {item.status === 'Issued' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="h-8 gap-1 bg-primary"
                                                            onClick={() => handleReturnItem(item._id)}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Return
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(item._id)}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

            {/* Issue Item Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleIssueItem}>
                        <DialogHeader>
                            <DialogTitle>Issue New Item</DialogTitle>
                            <DialogDescription>
                                Assign an inventory item to a staff member or student.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="required">User Type</Label>
                                    <Select value={issuedToRole} onValueChange={(val) => {
                                        setIssuedToRole(val);
                                        setIssuedToId(''); // reset selection on role change
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Staff">Staff</SelectItem>
                                            <SelectItem value="Student">Student</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="required">Select {issuedToRole}</Label>
                                    <Select value={issuedToId} onValueChange={setIssuedToId} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Choose ${issuedToRole.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {issuedToRole === 'Staff' 
                                                ? staffList.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.role || 'Staff'})</SelectItem>)
                                                : studentList.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.sclassName})</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="required">Item Name</Label>
                                    <Input 
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="e.g. Dell Laptop"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="required">Category</Label>
                                    <Input 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g. Electronics, Books"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="required">Issue Date</Label>
                                    <Input 
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="required">Return Date</Label>
                                    <Input 
                                        type="date"
                                        value={returnDate}
                                        min={issueDate} // cannot return before issue
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Note / Remarks (Optional)</Label>
                                <Input 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any physical damages or specific serial number..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing || !issuedToId}>
                                {processing ? "Issuing..." : "Confirm Issue"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IssueItems;
