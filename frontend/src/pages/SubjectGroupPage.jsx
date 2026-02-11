import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
    Layers, Plus, Edit, Trash2, BookOpen, Search, Loader2,
    GraduationCap, CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE = import.meta.env.VITE_API_URL;

const SubjectGroup = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [groups, setGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        subjects: [],
        status: 'Active'
    });

    useEffect(() => {
        if (currentUser) {
            fetchGroups();
            fetchSubjects();
        }
    }, [currentUser]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/SubjectGroups/${currentUser._id}`);
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error fetching subject groups', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_BASE}/AllSubjects/${currentUser._id}`);
            setSubjects(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    // Filtered groups for search
    const filteredGroups = groups.filter(g =>
        g.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDialog = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                groupName: group.groupName || '',
                description: group.description || '',
                subjects: group.subjects?.map(s => s._id) || [],
                status: group.status || 'Active'
            });
        } else {
            setEditingGroup(null);
            setFormData({
                groupName: '',
                description: '',
                subjects: [],
                status: 'Active'
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.groupName.trim()) {
            showToast('Group name is required', 'error');
            return;
        }
        if (formData.subjects.length === 0) {
            showToast('Please select at least one subject', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData, school: currentUser._id };

            if (editingGroup) {
                await axios.put(`${API_BASE}/SubjectGroup/${editingGroup._id}`, payload);
                showToast('Subject group updated!', 'success');
            } else {
                await axios.post(`${API_BASE}/SubjectGroupCreate`, payload);
                showToast('Subject group created!', 'success');
            }
            fetchGroups();
            setIsDialogOpen(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error saving subject group', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`${API_BASE}/SubjectGroup/${itemToDelete._id}`);
            showToast('Subject group deleted!', 'success');
            fetchGroups();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error deleting subject group', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const toggleSubject = (subjectId) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subjectId)
                ? prev.subjects.filter(id => id !== subjectId)
                : [...prev.subjects, subjectId]
        }));
    };

    const selectAllSubjects = () => {
        if (formData.subjects.length === subjects.length) {
            setFormData(prev => ({ ...prev, subjects: [] }));
        } else {
            setFormData(prev => ({ ...prev, subjects: subjects.map(s => s._id) }));
        }
    };

    // Stats
    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.status === 'Active').length;
    const totalSubjectsInGroups = groups.reduce((acc, g) => acc + (g.subjects?.length || 0), 0);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subject Groups</h1>
                    <p className="text-muted-foreground mt-1">Organize subjects into logical groups for scheduling and exams.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Subject Group
                </Button>
            </div>

            <Separator />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Layers className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Groups</p>
                                <p className="text-2xl font-bold">{totalGroups}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Groups</p>
                                <p className="text-2xl font-bold">{activeGroups}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Subjects Assigned</p>
                                <p className="text-2xl font-bold">{totalSubjectsInGroups}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Layers className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No Subject Groups Found</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                {searchTerm ? 'Try a different search term.' : 'Create your first subject group to organize subjects.'}
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => handleOpenDialog()} className="mt-4 gap-2">
                                    <Plus className="h-4 w-4" /> Add Subject Group
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Group Name</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGroups.map((group, idx) => (
                                    <TableRow key={group._id}>
                                        <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{group.groupName}</p>
                                                {group.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{group.description}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {group.subjects?.slice(0, 4).map(sub => (
                                                    <Badge key={sub._id} variant="secondary" className="text-[11px]">
                                                        {sub.subName}
                                                    </Badge>
                                                ))}
                                                {group.subjects?.length > 4 && (
                                                    <Badge variant="secondary" className="text-[11px]">
                                                        +{group.subjects.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={group.status === 'Active' ? 'default' : 'secondary'}>
                                                {group.status === 'Active' ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {group.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(group)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => { setItemToDelete(group); setDeleteDialogOpen(true); }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit Subject Group' : 'New Subject Group'}</DialogTitle>
                        <DialogDescription>
                            {editingGroup ? 'Update the subject group details.' : 'Create a new group to organize subjects together.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Group Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={formData.groupName}
                                onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                                placeholder="e.g. Science Group, Arts Group"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Optional description..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Subjects <span className="text-destructive">*</span></Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAllSubjects}
                                    className="h-7 text-xs"
                                >
                                    {formData.subjects.length === subjects.length && subjects.length > 0 ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                            <div className="border rounded-lg max-h-48 overflow-y-auto">
                                {subjects.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No subjects found. Create subjects first.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {subjects.map(sub => (
                                            <label
                                                key={sub._id}
                                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                                            >
                                                <Checkbox
                                                    checked={formData.subjects.includes(sub._id)}
                                                    onCheckedChange={() => toggleSubject(sub._id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{sub.subName}</p>
                                                    <p className="text-[11px] text-muted-foreground">{sub.subCode}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {formData.subjects.length > 0 && (
                                <p className="text-xs text-muted-foreground">{formData.subjects.length} subject(s) selected</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editingGroup ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject Group</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>"{itemToDelete?.groupName}"</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setItemToDelete(null); }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SubjectGroup;
