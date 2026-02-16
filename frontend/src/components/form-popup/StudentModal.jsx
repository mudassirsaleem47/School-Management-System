import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const StudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { currentUser } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        rollNum: '',
        password: '',
        sclassName: '',
        status: 'Active',
        disableReason: '',
        disableDescription: ''
    });

    const [showDisableReason, setShowDisableReason] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reasonDescription, setReasonDescription] = useState('');

    const disableReasonOptions = ['Left School', 'Transferred', 'Expelled', 'Medical', 'Financial', 'Other'];

    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Fetch classes for dropdown
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchClasses();
        }
    }, [isOpen, currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClassesList(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };
    
    // When initialData changes (Edit button clicked), fill the form
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                name: initialData.name || '',
                rollNum: initialData.rollNum || '',
                password: '', // Don't include password in edit mode
                sclassName: initialData.sclassName?._id || '',
                status: initialData.status || 'Active'
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                rollNum: '',
                password: '',
                sclassName: '',
                status: 'Active',
                disableReason: '',
                disableDescription: ''
            });
            setShowDisableReason(false);
            setSelectedReason('');
            setReasonDescription('');
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        if (name === 'status' && value === 'Disabled') {
            setShowDisableReason(true);
            return;
        }
        if (name === 'status' && value === 'Active') {
            // Setup for re-enabling if needed, but for now just update status
            setFormData({ ...formData, [name]: value, disableReason: '', disableDescription: '' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const confirmDisable = () => {
        if (!selectedReason) {
            return;
        }
        setFormData({
            ...formData,
            status: 'Disabled',
            disableReason: selectedReason,
            disableDescription: reasonDescription
        });
        setShowDisableReason(false);
    };

    const cancelDisable = () => {
        setSelectedReason('');
        setReasonDescription('');
        setShowDisableReason(false);
        // Status remains what it was before (likely Active if they were switching)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the student details below.' : 'Fill in the details to admit a new student.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                name="name" 
                                placeholder="Student's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rollNum">Roll Number <span className="text-destructive">*</span></Label>
                            <Input
                                id="rollNum"
                                name="rollNum"
                                type="number"
                                placeholder="Roll Number"
                                value={formData.rollNum}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Login Password (for Student & Parent Portal) {!initialData && <span className="text-destructive">*</span>}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={initialData ? "Leave blank to keep current password" : "Set password for login"}
                                value={formData.password}
                                onChange={handleChange}
                                required={!initialData}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sclassName">Select Class <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.sclassName} 
                                onValueChange={(value) => handleSelectChange('sclassName', value)}
                                required
                            >
                                <SelectTrigger id="sclassName">
                                    <SelectValue placeholder="Choose a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classesList.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.sclassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {initialData && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status} 
                                onValueChange={(value) => handleSelectChange('status', value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Disable Reason Confirmation Dialog Overlay */}
                    <Dialog open={showDisableReason} onOpenChange={(open) => !open && cancelDisable()}>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Disable Student Reason</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for disabling this student. This is required.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-2 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="disable-reason">Reason <span className="text-destructive">*</span></Label>
                                    <Select value={selectedReason} onValueChange={setSelectedReason}>
                                        <SelectTrigger id="disable-reason">
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {disableReasonOptions.map((reason) => (
                                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason-description">Description <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                    <Textarea
                                        id="reason-description"
                                        value={reasonDescription}
                                        onChange={(e) => setReasonDescription(e.target.value)}
                                        placeholder="Additional details..."
                                        className="resize-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={cancelDisable}>Cancel</Button>
                                <Button type="button" onClick={confirmDisable} disabled={!selectedReason}>Confirm Disable</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Update Student' : 'Save Student'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default StudentModal;
