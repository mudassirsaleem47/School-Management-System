import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, GraduationCap, Users, BookOpen, Trash2, X, MoreHorizontal, Pencil, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const ShowClasses = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowAddModal(true);
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    // --- State Management ---
    const [sclasses, setSclasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Add Class Modal State
    const [sclassName, setSclassName] = useState(""); 
    const [classIncharge, setClassIncharge] = useState("");
    const [selectedSections, setSelectedSections] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Class State
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEditClass, setCurrentEditClass] = useState(null);

    // Delete Confirmation State
    const [deleteConfig, setDeleteConfig] = useState({ open: false, type: null, id: null, subId: null });


    // --- 1. Fetch Classes ---
    const fetchClasses = React.useCallback(async () => {
        if (!currentUser || !currentUser._id) return;

        setLoading(true);
        try {
            const result = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            if (Array.isArray(result.data)) {
                setSclasses(result.data);
            } else {
                setSclasses([]);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setSclasses([]);
            } else {
                toast.error("Error fetching classes");
            }
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // --- Fetch Teachers ---
    const fetchTeachers = React.useCallback(async () => {
        if (!currentUser || !currentUser._id) return;

        try {
            const result = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
            if (Array.isArray(result.data)) {
                setTeachers(result.data);
            }
        } catch (err) {
            console.error("Error fetching teachers:", err);
        }
    }, [currentUser]);

    // --- Fetch Sections ---
    const fetchSections = React.useCallback(async () => {
        if (!currentUser?._id) return;
        try {
            const res = await axios.get(`${API_BASE}/Sections/${currentUser._id}`);
            if (Array.isArray(res.data)) {
                setAvailableSections(res.data);
            }
        } catch (err) {
            console.error("Error fetching sections:", err);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
            fetchTeachers();
            fetchSections();
        }
    }, [currentUser, fetchClasses, fetchTeachers, fetchSections]);

    // --- 2. Add/Edit Class ---
    const addClass = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const data = {
                sclassName: sclassName,
                school: currentUser._id,
                classIncharge: classIncharge || undefined,
                sections: selectedSections
            };
            
            await axios.post(`${API_BASE}/SclassCreate`, data);
            
            setSclassName("");
            setClassIncharge("");
            setSelectedSections([]);
            setShowAddModal(false);
            fetchClasses();
            toast.success("Class added successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding class");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (cls) => {
        setCurrentEditClass(cls);
        setSclassName(cls.sclassName);
        setClassIncharge(cls.classIncharge?._id || "");
        setSelectedSections(cls.sections?.map(s => s._id) || []);
        setShowEditModal(true);
    };

    const updateClass = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = {
                sclassName: sclassName,
                classIncharge: classIncharge || undefined,
                sections: selectedSections
            };
            await axios.put(`${API_BASE}/SclassUpdate/${currentEditClass._id}`, data);
            setShowEditModal(false);
            setSclassName("");
            setClassIncharge("");
            setSelectedSections([]);
            setCurrentEditClass(null);
            fetchClasses();
            toast.success("Class updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error updating class");
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- 3. Delete Class/Section Config ---
    const handleDeleteRequest = (type, id, subId = null) => {
        setDeleteConfig({ open: true, type, id, subId });
    };

    const confirmDelete = async () => {
        const { type, id, subId } = deleteConfig;
        try {
            if (type === 'class') {
                await axios.delete(`${API_BASE}/Sclass/${id}`);
                toast.success("Class deleted successfully!");
            } else if (type === 'section') {
                await axios.delete(`${API_BASE}/Sclass/${id}/Section/${subId}`);
                toast.success("Section deleted successfully!");
            }
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast.error(`Error deleting ${type}`);
        }
        setDeleteConfig({ open: false, type: null, id: null, subId: null });
    };

    const handleAddSection = async (classId, sectionName, form) => {
        if (!sectionName) return;
        try {
            await axios.put(`${API_BASE}/Sclass/${classId}/Section`, { sectionName });
            fetchClasses();
            toast.success("Section added successfully!");
            form.reset();
        } catch (err) {
            toast.error("Failed to add section");
        }
    };

    const handleQuickAssignSection = async (cls, sectionId) => {
        try {
            const currentSectionIds = cls.sections?.map(s => s._id) || [];
            if (currentSectionIds.includes(sectionId)) return;
            
            const updatedSections = [...currentSectionIds, sectionId];
            const data = {
                sclassName: cls.sclassName,
                classIncharge: cls.classIncharge?._id || undefined,
                sections: updatedSections
            };
            
            await axios.put(`${API_BASE}/SclassUpdate/${cls._id}`, data);
            fetchClasses();
            toast.success("Section assigned successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error assigning section");
        }
    };

    const handleQuickRemoveSection = async (cls, sectionId) => {
        try {
            const currentSectionIds = cls.sections?.map(s => s._id) || [];
            const updatedSections = currentSectionIds.filter(id => id !== sectionId);
            
            const data = {
                sclassName: cls.sclassName,
                classIncharge: cls.classIncharge?._id || undefined,
                sections: updatedSections
            };
            
            await axios.put(`${API_BASE}/SclassUpdate/${cls._id}`, data);
            fetchClasses();
            toast.success("Section removed successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error removing section");
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manage Classes</h2>
                    <p className="text-muted-foreground mt-1">Create and manage your school classes and sections</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} size="lg">
                    <Plus className="mr-2 h-4 w-4" /> Add Class
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : sclasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/20 border-dashed">
                        <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium">No classes found</h3>
                        <p className="text-muted-foreground mt-2">Get started by creating your first class.</p>
                        <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Create Class
                        </Button>
                    </div>
                ) : (
                        <div className="flex flex-col gap-4">
                    {sclasses.map((item) => (
                        <Card key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all duration-200 p-4 gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 flex-1 w-full">
                                <div className="min-w-[200px] flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-bold text-primary">{item.sclassName}</CardTitle>
                                    </div>
                                    <span className="text-xs text-muted-foreground">ID: {item._id.slice(-4)}</span>
                                    {item.classIncharge && (
                                        <Badge variant="secondary" className="w-fit mt-1 font-normal bg-secondary/50">
                                            Incharge: {item.classIncharge.name}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Sections</Label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {item.sections && item.sections.length > 0 ? (
                                            item.sections.map((sec) => (
                                                <Badge
                                                    key={sec._id}
                                                    variant="outline"
                                                    className="bg-background text-foreground shrink-0 border-border group relative pr-7"
                                                >
                                                    {sec.sectionName}
                                                    <button 
                                                        onClick={() => handleQuickRemoveSection(item, sec._id)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 opacity-50 hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                                                        title="Remove section"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded-md">No sections added</span>
                                        )}
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-6 w-6 rounded-full shrink-0">
                                                    <span className="sr-only">Assign Section</span>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Add Section</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {availableSections.filter(s => !item.sections?.find(is => is._id === s._id)).length > 0 ? (
                                                    availableSections
                                                        .filter(s => !item.sections?.find(is => is._id === s._id))
                                                        .map(s => (
                                                            <DropdownMenuItem key={s._id} onClick={() => handleQuickAssignSection(item, s._id)}>
                                                                {s.sectionName}
                                                            </DropdownMenuItem>
                                                        ))
                                                ) : (
                                                    <DropdownMenuItem disabled>No more sections</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 self-end sm:self-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <span className="sr-only">Actions</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigate(`/admin/students?class=${item._id}`)}>
                                            <Users className="mr-2 h-4 w-4" /> View Students
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Class
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteRequest('class', item._id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Class
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Class Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Class</DialogTitle>
                        <DialogDescription>
                            Create a new class for your school. You can add sections later.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addClass} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sclassName">Class Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="sclassName"
                                placeholder="e.g. Class 10, Grade 9"
                                value={sclassName}
                                onChange={(e) => setSclassName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="incharge">Class Incharge (Optional)</Label>
                            <Select value={classIncharge} onValueChange={setClassIncharge}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher._id} value={teacher._id}>
                                            {teacher.name} ({teacher.subject})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Select Sections</Label>
                                {availableSections.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all-sections"
                                            checked={selectedSections.length === availableSections.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedSections(availableSections.map(s => s._id));
                                                } else {
                                                    setSelectedSections([]);
                                                }
                                            }}
                                        />
                                        <label htmlFor="select-all-sections" className="text-sm font-medium leading-none cursor-pointer">
                                            Select All
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-[150px] overflow-y-auto">
                                {availableSections.map((section) => (
                                    <div key={section._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`section-${section._id}`}
                                            checked={selectedSections.includes(section._id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedSections([...selectedSections, section._id]);
                                                } else {
                                                    setSelectedSections(selectedSections.filter(id => id !== section._id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`section-${section._id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {section.sectionName}
                                        </label>
                                    </div>
                                ))}
                                {availableSections.length === 0 && (
                                    <p className="text-xs text-muted-foreground col-span-2 text-center py-2">No sections found. Please add sections first.</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Adding..." : "Add Class"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={deleteConfig.open} onOpenChange={(open) => !open && setDeleteConfig({ ...deleteConfig, open: false })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            {deleteConfig.type === 'class' ? ' class and all its sections' : ' section'}
                            from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Edit Class Modal */}
            <Dialog open={showEditModal} onOpenChange={(open) => {
                setShowEditModal(open);
                if (!open) {
                    setSclassName("");
                    setClassIncharge("");
                    setSelectedSections([]);
                    setCurrentEditClass(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>
                            Update class information and incharge.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={updateClass} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-sclassName">Class Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="edit-sclassName"
                                placeholder="e.g. Class 10"
                                value={sclassName}
                                onChange={(e) => setSclassName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-incharge">Class Incharge (Optional)</Label>
                            <Select value={classIncharge} onValueChange={setClassIncharge}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher._id} value={teacher._id}>
                                            {teacher.name} ({teacher.subject})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Select Sections</Label>
                                {availableSections.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="edit-select-all-sections"
                                            checked={selectedSections.length === availableSections.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedSections(availableSections.map(s => s._id));
                                                } else {
                                                    setSelectedSections([]);
                                                }
                                            }}
                                        />
                                        <label htmlFor="edit-select-all-sections" className="text-sm font-medium leading-none cursor-pointer">
                                            Select All
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-[150px] overflow-y-auto">
                                {availableSections.map((section) => (
                                    <div key={section._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-section-${section._id}`}
                                            checked={selectedSections.includes(section._id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedSections([...selectedSections, section._id]);
                                                } else {
                                                    setSelectedSections(selectedSections.filter(id => id !== section._id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`edit-section-${section._id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {section.sectionName}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update Class"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};


export default ShowClasses;
