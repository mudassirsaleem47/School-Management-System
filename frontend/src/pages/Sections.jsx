import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, LayoutGrid, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const Sections = () => {
    const { currentUser } = useAuth();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Add/Edit State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);
    const [sectionName, setSectionName] = useState("");

    const fetchSections = async () => {
        if (!currentUser?._id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Sections/${currentUser._id}`);
            setSections(res.data);
        } catch (err) {
            toast.error("Failed to fetch sections");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sectionName.trim()) return;
        setIsSubmitting(true);

        try {
            if (editMode) {
                await axios.put(`${API_BASE}/SectionUpdate/${currentSection._id}`, { sectionName });
                toast.success("Section updated successfully");
            } else {
                await axios.post(`${API_BASE}/SectionCreate`, { sectionName, school: currentUser._id });
                toast.success("Section created successfully");
            }
            setShowModal(false);
            setSectionName("");
            fetchSections();
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (section) => {
        setEditMode(true);
        setCurrentSection(section);
        setSectionName(section.sectionName);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this section?")) return;
        try {
            await axios.delete(`${API_BASE}/SectionDelete/${id}`);
            toast.success("Section deleted successfully");
            fetchSections();
        } catch (err) {
            toast.error("Failed to delete section");
        }
    };

    const openAddModal = () => {
        setEditMode(false);
        setSectionName("");
        setShowModal(true);
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manage Sections</h2>
                    <p className="text-muted-foreground mt-1">Define sections that can be assigned to classes.</p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" /> Add Section
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
            ) : sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/20 border-dashed">
                    <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No sections found</h3>
                    <p className="text-muted-foreground mt-2">Create sections like 'A', 'B', 'Morning', 'Evening'.</p>
                    <Button onClick={openAddModal} variant="outline" className="mt-6">
                        <Plus className="mr-2 h-4 w-4" /> Create Section
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sections.map((section) => (
                        <Card key={section._id} className="hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold">{section.sectionName}</CardTitle>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(section)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(section._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">Created: {new Date(section.createdAt).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editMode ? "Edit Section" : "Add New Section"}</DialogTitle>
                        <DialogDescription>
                            Enter the name of the section you want to {editMode ? "update" : "create"}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sectionName">Section Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="sectionName"
                                placeholder="e.g. A, B, Blue, Red"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editMode ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Sections;
