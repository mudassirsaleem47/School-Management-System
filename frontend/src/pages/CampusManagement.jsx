import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext'; // Import Context
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api.js';
import {
    Building2, Plus, Edit, Trash2, MapPin, Phone, Mail,
    MoreVertical, School, Users, GraduationCap, CheckCircle2, XCircle, Search
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const CampusManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [campusStats, setCampusStats] = useState({});

    // Form State
    const [formData, setFormData] = useState({
        campusName: '',
        campusCode: '',
        address: '',
        city: '',
        phoneNumber: '',
        email: '',
        principalName: '',
        totalCapacity: '',
        isMain: false,
        status: 'Active'
    });
    const [formLoading, setFormLoading] = useState(false);

    const { fetchCampuses: refreshGlobalCampuses } = useCampus();
    const [searchParams, setSearchParams] = useSearchParams();

    // Fetch campuses
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchCampuses();
        }
    }, [currentUser]);

    // Handle Quick Action Query Param
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            handleOpenDialog();
            // Clear the query param so it doesn't persist
            setSearchParams({});
        }
    }, [searchParams]);

    // Generate Campus Code on Open
    useEffect(() => {
        if (isDialogOpen && !selectedCampus) {
            generateCampusCode();
        }
    }, [isDialogOpen]);

    const fetchCampuses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Campuses/${currentUser._id}`);
            if (response.data.success) {
                setCampuses(response.data.campuses);
                response.data.campuses.forEach(campus => fetchCampusStats(campus._id));
            }
        } catch (error) {
            console.error('Error fetching campuses:', error);
            showToast('Failed to load campuses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCampusStats = async (campusId) => {
        try {
            const response = await axios.get(`${API_URL}/CampusStats/${campusId}`);
            if (response.data.success) {
                setCampusStats(prev => ({ ...prev, [campusId]: response.data.stats }));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const generateCampusCode = () => {
        const timestamp = Date.now().toString().slice(-4);
        const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const code = `CMP-${timestamp}${randomNum}`;
        setFormData(prev => ({ ...prev, campusCode: code }));
    };

    // --- Handlers ---

    const handleOpenDialog = (campus = null) => {
        setSearchTerm(''); // Clear search to ensure visibility
        if (campus) {
            setSelectedCampus(campus);
            setFormData({
                campusName: campus.campusName || '',
                campusCode: campus.campusCode || '',
                address: campus.address || '',
                city: campus.city || '',
                phoneNumber: campus.phoneNumber || '',
                email: campus.email || '',
                principalName: campus.principalName || '',
                totalCapacity: campus.totalCapacity || '',
                isMain: campus.isMain || false,
                status: campus.status || 'Active'
            });
        } else {
            setSelectedCampus(null);
            setFormData({
                campusName: '',
                campusCode: '', // Will be generated
                address: '',
                city: '',
                phoneNumber: '',
                email: '',
                principalName: '',
                totalCapacity: '',
                isMain: false,
                status: 'Active'
            });
        }
        setIsDialogOpen(true);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.campusName.trim()) {
            showToast('Campus name is required', 'error');
            return;
        }

        try {
            setFormLoading(true);
            const payload = { ...formData, school: currentUser._id };

            if (selectedCampus) {
                const response = await axios.put(`${API_URL}/Campus/${selectedCampus._id}`, payload);
                if (response.data.success) showToast('Campus updated!', 'success');
            } else {
                const response = await axios.post(`${API_URL}/Campus`, payload);
                if (response.data.success) showToast('Campus created!', 'success');
            }
            fetchCampuses(); // Local update
            refreshGlobalCampuses(); // Global context update (Header/Selector)
            setIsDialogOpen(false);
        } catch (error) {
            showToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCampus) return;
        try {
            await axios.delete(`${API_URL}/Campus/${selectedCampus._id}`);
            showToast('Campus deleted', 'success');
            fetchCampuses(); // Local update
            refreshGlobalCampuses(); // Global context update
            setIsDeleteOpen(false);
            setSelectedCampus(null);
        } catch (error) {
            showToast('Failed to delete campus', 'error');
        }
    };

    // --- Computed ---
    const filteredCampuses = campuses.filter(c =>
        c.campusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStudents = Object.values(campusStats).reduce((acc, curr) => acc + (curr.totalStudents || 0), 0);
    const totalTeachers = Object.values(campusStats).reduce((acc, curr) => acc + (curr.totalTeachers || 0), 0);

    return (
        <div className="flex-1 space-y-6 p-8 md:p-12 pt-6 h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Campus Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Oversee and manage your institution's branches and campuses.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenDialog()} size="lg" className="shadow-lg hover:shadow-primary/20 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Campus
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campuses</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{campuses.length}</div>
                        <p className="text-xs text-muted-foreground">Active locations</p>
                    </CardContent>
                </Card>
                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all branches</p>
                    </CardContent>
                </Card>
                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">Teachers & Admins</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search Filter */}
            <div className="flex items-center space-x-2 bg-background p-1 border rounded-md w-full max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="Search campuses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 shadow-none h-8"
                />
            </div>

            {/* Campuses Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredCampuses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/10">
                    <School className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Campuses Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Get started by creating your first campus.</p>
                </div>
            ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                            {filteredCampuses.map((campus) => {
                                const stats = campusStats[campus._id] || {};
                                return (
                                    <Card key={campus._id} className={`group transition-all duration-300 border-l-4 ${campus.isMain ? 'border-l-primary' : 'border-l-transparent hover:border-l-muted-foreground/30'}`}>
                                        <CardHeader className="pb-3 relative">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <School className="h-5 w-5 text-primary" />
                                            </div>
                                                    <div>
                                                        <CardTitle className="text-lg leading-tight">{campus.campusName}</CardTitle>
                                                        <CardDescription className="opacity-90 flex items-center gap-1.5 mt-1">
                                                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">{campus.campusCode}</span>
                                                            {campus.isMain && <Badge variant="secondary" className="h-5 text-[10px]">Main Campus</Badge>}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(campus)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedCampus(campus); setIsDeleteOpen(true); }}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Campus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pb-3">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{campus.address || "No address provided"}{campus.city ? `, ${campus.city}` : ""}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Phone className="h-4 w-4 shrink-0" />
                                                    <span>{campus.phoneNumber || "N/A"}</span>
                                                </div>
                                                {campus.principalName && (
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <Users className="h-4 w-4 shrink-0" />
                                                        <span className="font-medium text-foreground">Principal: {campus.principalName}</span>
                                            </div>
                                                )}
                                            </div>

                                            {/* Mini Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Students</p>
                                                    <p className="text-lg font-bold text-primary mt-1">{stats.totalStudents || 0}</p>
                                                </div>
                                                <div className="text-center border-l border-r">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Teachers</p>
                                                    <p className="text-lg font-bold text-primary mt-1">{stats.totalTeachers || 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Classes</p>
                                                    <p className="text-lg font-bold text-primary mt-1">{stats.totalClasses || 0}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/20 py-3 flex items-center justify-between">
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${campus.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {campus.status === 'Active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                {campus.status}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">Capacity: {campus.totalCapacity || 'Unlimited'}</span>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedCampus ? 'Edit Campus' : 'Add New Campus'}</DialogTitle>
                        <DialogDescription>
                            Enter the details for this campus branch.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="campusName">Campus Name <span className="text-destructive">*</span></Label>
                                        <Input id="campusName" value={formData.campusName} onChange={(e) => handleFormChange('campusName', e.target.value)} placeholder="e.g. North Branch" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="campusCode">Campus Code</Label>
                                        <Input id="campusCode" value={formData.campusCode} disabled className="bg-muted font-mono" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={formData.address} onChange={(e) => handleFormChange('address', e.target.value)} placeholder="Full street address" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" value={formData.city} onChange={(e) => handleFormChange('city', e.target.value)} placeholder="City" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleFormChange('phoneNumber', e.target.value)} placeholder="+92..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="campus@school.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="principal">Principal Name</Label>
                                        <Input id="principal" value={formData.principalName} onChange={(e) => handleFormChange('principalName', e.target.value)} placeholder="Name of Principal" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Total Capacity</Label>
                                        <Input id="capacity" type="number" value={formData.totalCapacity} onChange={(e) => handleFormChange('totalCapacity', e.target.value)} placeholder="Max students" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(val) => handleFormChange('status', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/40">
                                    <Switch
                                        id="main-campus"
                                        checked={formData.isMain}
                                        onCheckedChange={(checked) => handleFormChange('isMain', checked)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="main-campus" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Mark as Main Campus
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            This campus will be treated as the headquarters.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Campus'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Campus</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedCampus?.campusName}</strong>? This action cannot be undone and may affect linked students/staff.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CampusManagement;
