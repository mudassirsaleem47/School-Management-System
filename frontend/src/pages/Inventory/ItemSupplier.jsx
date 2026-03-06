import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Truck, 
    Plus, 
    Search, 
    Trash2, 
    Edit2 
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

const API_BASE = API_URL;

const ItemSupplierMaster = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    // Form fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [contactPersonName, setContactPersonName] = useState('');
    const [contactPersonPhone, setContactPersonPhone] = useState('');
    const [contactPersonEmail, setContactPersonEmail] = useState('');
    const [description, setDescription] = useState('');

    const fetchSuppliers = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Inventory/Supplier/${currentUser._id}`);
            setSuppliers(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch suppliers", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name) {
            showToast("Supplier Name is required", "error");
            return;
        }

        setProcessing(true);
        try {
            const payload = {
                school: currentUser._id,
                name,
                phone,
                email,
                address,
                contactPersonName,
                contactPersonPhone,
                contactPersonEmail,
                description
            };

            if (editId) {
                await axios.put(`${API_BASE}/Inventory/Supplier/${editId}`, payload);
                showToast("Supplier updated successfully", "success");
            } else {
                await axios.post(`${API_BASE}/Inventory/Supplier`, payload);
                showToast("Supplier added successfully", "success");
            }

            resetForm();
            fetchSuppliers();
        } catch (error) {
            console.error(error);
            showToast("Operation failed", "error");
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setIsModalOpen(false);
        setEditId(null);
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setContactPersonName('');
        setContactPersonPhone('');
        setContactPersonEmail('');
        setDescription('');
    };

    const handleEdit = (supplier) => {
        setEditId(supplier._id);
        setName(supplier.name);
        setPhone(supplier.phone || '');
        setEmail(supplier.email || '');
        setAddress(supplier.address || '');
        setContactPersonName(supplier.contactPersonName || '');
        setContactPersonPhone(supplier.contactPersonPhone || '');
        setContactPersonEmail(supplier.contactPersonEmail || '');
        setDescription(supplier.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the supplier.")) return;
        try {
            await axios.delete(`${API_BASE}/Inventory/Supplier/${id}`);
            showToast("Supplier deleted", "success");
            fetchSuppliers();
        } catch (error) {
            console.error(error);
            showToast("Delete failed", "error");
        }
    };

    const filteredSuppliers = suppliers.filter(sup => 
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.contactPersonName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Item Supplier</h2>
                    <p className="text-muted-foreground">Manage and track inventory suppliers</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item Supplier
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="h-5 w-5 text-muted-foreground"/> List of Suppliers
                        </CardTitle>
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No suppliers found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Supplier Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Phone / Email</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSuppliers.map((sup) => (
                                    <TableRow key={sup._id}>
                                        <TableCell className="pl-6 font-medium">{sup.name}</TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{sup.contactPersonName || 'N/A'}</div>
                                            <div className="text-xs text-muted-foreground">{sup.contactPersonPhone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{sup.phone}</div>
                                            <div className="text-xs text-muted-foreground">{sup.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{sup.address || 'N/A'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(sup)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(sup._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{editId ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                            <DialogDescription>Enter supplier details and contact person information.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name *</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Supplier Business Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Business Phone" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Business Email" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" />
                                </div>
                            </div>
                            
                            <hr className="my-2" />
                            <h3 className="text-sm font-semibold text-muted-foreground">Contact Person Details</h3>
                            
                            <div className="space-y-2">
                                <Label>Contact Person Name</Label>
                                <Input value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} placeholder="Name of individual contact" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Person Phone</Label>
                                    <Input value={contactPersonPhone} onChange={(e) => setContactPersonPhone(e.target.value)} placeholder="Direct Phone number" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Person Email</Label>
                                    <Input type="email" value={contactPersonEmail} onChange={(e) => setContactPersonEmail(e.target.value)} placeholder="Direct Email" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes or additional information..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Supplier'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ItemSupplierMaster;
