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
    Tags, 
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

const ItemCategoryMaster = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    // Form fields
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');

    const fetchCategories = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Inventory/Category/${currentUser._id}`);
            setCategories(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch categories", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!categoryName) {
            showToast("Category Name is required", "error");
            return;
        }

        setProcessing(true);
        try {
            const payload = {
                school: currentUser._id,
                categoryName,
                description
            };

            if (editId) {
                await axios.put(`${API_BASE}/Inventory/Category/${editId}`, payload);
                showToast("Category updated successfully", "success");
            } else {
                await axios.post(`${API_BASE}/Inventory/Category`, payload);
                showToast("Category added successfully", "success");
            }

            resetForm();
            fetchCategories();
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
        setCategoryName('');
        setDescription('');
    };

    const handleEdit = (category) => {
        setEditId(category._id);
        setCategoryName(category.categoryName);
        setDescription(category.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the category.")) return;
        try {
            await axios.delete(`${API_BASE}/Inventory/Category/${id}`);
            showToast("Category deleted", "success");
            fetchCategories();
        } catch (error) {
            console.error(error);
            showToast("Delete failed", "error");
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Item Category</h2>
                    <p className="text-muted-foreground">Manage inventory item categories</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item Category
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Tags className="h-5 w-5 text-muted-foreground"/> List of Categories
                        </CardTitle>
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
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
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No categories found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="pl-6 font-medium">{cat.categoryName}</TableCell>
                                        <TableCell>{cat.description || 'N/A'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(cat._id)}>
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
                            <DialogTitle>{editId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                            <DialogDescription>Enter the name of the category for grouping items.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Category Name *</Label>
                                <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
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

export default ItemCategoryMaster;
