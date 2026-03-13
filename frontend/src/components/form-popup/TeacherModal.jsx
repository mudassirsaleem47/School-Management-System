import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/DatePicker";
import { PasswordField } from '@/components/ui/email-pass';

const TeacherModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    // Form state - if initialData exists (Edit mode), use it, otherwise keep empty
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        subject: '',
        qualification: '',
        experience: 0,
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });

    // When initialData changes (Edit button clicked), fill the form
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : '',
                // Don't include password in edit mode
                password: ''
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                subject: '',
                qualification: '',
                experience: 0,
                salary: '',
                joiningDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {initialData ? 'Edit Teacher' : 'Add New Teacher'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the teacher details below.' : 'Fill in the details to add a new teacher to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Row 1: Name, Email, Password */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                name="name" 
                                value={formData.name}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="teacher@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <PasswordField
                            label={`Password ${!initialData ? '*' : ''}`}
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!initialData}
                            placeholder={initialData ? "Leave blank to keep current" : "Min 8 chars"}
                        />
                    </div>

                    {/* Row 2: Phone, Subject, Qualification */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel" 
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                            <Input
                                id="subject"
                                name="subject" 
                                placeholder="e.g. Mathematics"
                                value={formData.subject}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualification <span className="text-destructive">*</span></Label>
                            <Input
                                id="qualification"
                                name="qualification" 
                                placeholder="e.g. M.Sc, B.Ed"
                                value={formData.qualification}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    {/* Row 3: Experience, Salary, Joining Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience (Years)</Label>
                            <Input
                                id="experience"
                                name="experience"
                                type="number"
                                min="0" 
                                placeholder="0"
                                value={formData.experience}
                                onChange={handleChange} 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary">Salary <span className="text-destructive">*</span></Label>
                            <Input
                                id="salary"
                                name="salary"
                                type="number"
                                min="0" 
                                placeholder="Monthly Amount"
                                value={formData.salary}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="joiningDate">Joining Date</Label>
                            <DatePicker
                                id="joiningDate"
                                value={formData.joiningDate}
                                onChange={(val) => setFormData(prev => ({ ...prev, joiningDate: val }))}
                                placeholder="Select joining date"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? 'Update Teacher' : 'Save Teacher'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TeacherModal;
