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
import { 
    Briefcase,
    Search,
    Edit,
    Trash2,
    Plus
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

const DesignationManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const fetchDesignations = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Designation/${currentUser._id}`);
            setDesignations(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch designations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Handle Open Add/Edit Modal
    const handleOpenModal = (designation = null) => {
        if (designation) {
            setSelectedDesignation(designation);
            setTitle(designation.name);
            setDescription(designation.description || '');
        } else {
            setSelectedDesignation(null);
            setTitle('');
            setDescription('');
        }
        setIsModalOpen(true);
    };

    // Handle Save (Create or Update)
    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            showToast("Designation title is required", "error");
            return;
        }

        try {
            setProcessing(true);
            const payload = {
                school: currentUser._id,
                name: title.trim(),
                description: description.trim()
            };

            if (selectedDesignation) {
                // Update
                await axios.put(`${API_BASE}/Designation/${selectedDesignation._id}`, payload);
                showToast("Designation updated successfully", "success");
            } else {
                // Create
                await axios.post(`${API_BASE}/Designation`, payload);
                showToast("Designation added successfully", "success");
            }
            
            setIsModalOpen(false);
            fetchDesignations();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to save designation", "error");
        } finally {
            setProcessing(false);
        }
    };

    // Handle Open Delete Modal
    const handleOpenDeleteModal = (designation) => {
        setSelectedDesignation(designation);
        setIsDeleteModalOpen(true);
    };

    // Handle Confirm Delete
    const handleDelete = async () => {
        try {
            setProcessing(true);
            await axios.delete(`${API_BASE}/Designation/${selectedDesignation._id}`);
            showToast("Designation deleted successfully", "success");
            setIsDeleteModalOpen(false);
            fetchDesignations();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete designation", "error");
        } finally {
            setProcessing(false);
        }
    };

    const filteredDesignations = designations.filter(d => 
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Designation Management</h2>
                    <p className="text-muted-foreground">Manage job titles and roles for your school staff</p>
                </div>
                
                <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Designation
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-muted-foreground"/> 
                            Staff Designations ({designations.length})
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search designations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-[250px] h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : designations.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <Briefcase className="h-12 w-12 mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium text-foreground">No Designations Found</p>
                            <p className="max-w-sm mt-2">Create designations like "Principal", "Teacher", or "Accountant" to better organize your staff.</p>
                            <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4">
                                Add First Designation
                            </Button>
                        </div>
                    ) : filteredDesignations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No designations matched your search.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="pl-6 w-[250px]">Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right pr-6 w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDesignations.map((designation) => (
                                    <TableRow key={designation._id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6 font-medium">
                                            {designation.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {designation.description || <span className="italic opacity-50">No description provided</span>}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleOpenModal(designation)}
                                                    title="Edit designation"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleOpenDeleteModal(designation)}
                                                    title="Delete designation"
                                                >
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

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{selectedDesignation ? 'Edit' : 'Add'} Designation</DialogTitle>
                            <DialogDescription>
                                {selectedDesignation ? 'Update the details for this designation.' : 'Enter details to create a new role or title.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="required">Designation Title</Label>
                                <Input 
                                    id="title" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Senior Science Teacher"
                                    autoFocus
                                    required
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input 
                                    id="description" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of responsibilities..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Saving..." : "Save Designation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-red-600">
                            Are you sure you want to delete the designation "{selectedDesignation?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            {processing ? "Deleting..." : "Yes, Delete It"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DesignationManagement;
