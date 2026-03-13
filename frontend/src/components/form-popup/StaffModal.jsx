import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../config/api.js';
import { Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/DatePicker";
import { PasswordField } from '@/components/ui/email-pass';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const StaffModal = ({ staff, onClose }) => {
    const { currentUser } = useAuth();
    const { campuses } = useCampus();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [designation, setDesignation] = useState('');
    const [campus, setCampus] = useState('');
    const [salary, setSalary] = useState('');
    const [joiningDate, setJoiningDate] = useState(new Date().toISOString());
    const [status, setStatus] = useState('active');
    const designations = [
        "Accountant",
        "Teacher",
        "Librarian",
        "Receptionist",
        "Admin Staff",
        "Driver",
        "Security Guard",
        "Peon",
        "Sweeper",
        "Other"
    ];

    useEffect(() => {
        if (staff) {
            // Edit mode
            setName(staff.name || '');
            setEmail(staff.email || '');
            setPassword(''); // Don't populate password
            setPhone(staff.phone || '');
            setDesignation(staff.designation || '');
            setCampus(staff.campus?._id || '');
            setSalary(staff.salary || '');
            setJoiningDate(staff.joiningDate || new Date().toISOString());
            setStatus(staff.status || 'active');
        } else {
            // Reset for add mode
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setDesignation('');
            setCampus('');
            setSalary('');
            setJoiningDate(new Date().toISOString());
            setStatus('active');
        }
    }, [staff]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || (!staff && !password) || !designation) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name,
                email,
                password,
                phone,
                designation,
                campus,
                salary,
                joiningDate,
                status,
                school: currentUser._id
            };

            // Remove empty fields
            Object.keys(payload).forEach(key => {
                if (!payload[key] && key !== 'salary') delete payload[key];
            });

            if (staff) {
                // Update
                delete payload.password; // Don't update password through this form
                const response = await axios.put(`${API_URL}/Staff/${staff._id}`, payload);
                if (response.data.success) {
                    showToast('Staff updated successfully', 'success');
                    onClose(true);
                }
            } else {
                // Create
                const response = await axios.post(`${API_URL}/Staff`, payload);
                if (response.data.success) {
                    showToast('Staff added successfully', 'success');
                    onClose(true);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save staff member';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose(false)}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
                    <DialogDescription>
                        {staff ? 'Update staff member details and assignments.' : 'Enter details to create a new staff account.'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <form id="staff-form" onSubmit={handleSubmit} className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {!staff && (
                            <PasswordField
                                label="Password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation *</Label>
                                <Select value={designation} onValueChange={setDesignation} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations.map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campus">Campus</Label>
                                <Select value={campus} onValueChange={setCampus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select campus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campuses.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.campusName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="joiningDate">Joining Date</Label>
                                <DatePicker
                                    id="joiningDate"
                                    value={joiningDate}
                                    onChange={(val) => setJoiningDate(val)}
                                    placeholder="Select joining date"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" type="button" onClick={() => onClose(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" form="staff-form" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {staff ? 'Update Staff Member' : 'Add Staff Member'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StaffModal;
