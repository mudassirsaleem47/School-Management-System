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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Package, 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = API_URL;

const ItemMaster = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    // Form fields
    const [itemName, setItemName] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    const fetchItems = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Inventory/Item/${currentUser._id}`);
            setItems(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch items", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        if (!currentUser) return;
        try {
            const res = await axios.get(`${API_BASE}/Inventory/Category/${currentUser._id}`);
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!itemName || !itemCategory) {
            showToast("Item Name and Category are required", "error");
            return;
        }

        setProcessing(true);
        try {
            const payload = {
                school: currentUser._id,
                itemName,
                itemCategory,
                unit,
                description
            };

            if (editId) {
                await axios.put(`${API_BASE}/Inventory/Item/${editId}`, payload);
                showToast("Item updated successfully", "success");
            } else {
                await axios.post(`${API_BASE}/Inventory/Item`, payload);
                showToast("Item added successfully", "success");
            }

            resetForm();
            fetchItems();
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
        setItemName('');
        setItemCategory('');
        setUnit('');
        setDescription('');
    };

    const handleEdit = (item) => {
        setEditId(item._id);
        setItemName(item.itemName);
        setItemCategory(item.itemCategory);
        setUnit(item.unit || '');
        setDescription(item.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_BASE}/Inventory/Item/${id}`);
            showToast("Item deleted", "success");
            fetchItems();
        } catch (error) {
            console.error(error);
            showToast("Delete failed", "error");
        }
    };

    const filteredItems = items.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Items</h2>
                    <p className="text-muted-foreground">Define and manage all inventory items</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground"/> List of Items
                        </CardTitle>
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
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
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No items found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="pl-6 font-medium">{item.itemName}</TableCell>
                                        <TableCell>{item.itemCategory}</TableCell>
                                        <TableCell>{item.unit || 'N/A'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(item._id)}>
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
                <DialogContent>
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{editId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                            <DialogDescription>Define the basic details of the inventory item.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Item Name *</Label>
                                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Item Category *</Label>
                                <Select value={itemCategory} onValueChange={setItemCategory} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.length === 0 ? (
                                            <div className="p-2 text-xs text-muted-foreground text-center">No categories found. Create one first.</div>
                                        ) : (
                                            categories.map((cat) => (
                                                <SelectItem key={cat._id} value={cat.categoryName}>
                                                    {cat.categoryName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. pcs, kg, box" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ItemMaster;
