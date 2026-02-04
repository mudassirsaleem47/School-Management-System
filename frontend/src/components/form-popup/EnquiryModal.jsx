import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
    SelectGroup,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    IconUser,
    IconPhone,
    IconMail,
    IconMapPin,
    IconCalendar,
    IconSchool,
    IconUserPlus,
    IconNotes,
    IconLock,
    IconInfoCircle,
    IconUsers,
} from '@tabler/icons-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";

const EnquiryModal = ({ isOpen, onClose, onSubmit, initialData, classesList, teachersList, viewMode = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        assigned: '',
        reference: '',
        class: '',
        noOfChild: 1
    });

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                date: initialData.date ? initialData.date.split('T')[0] : '',
                class: initialData.class?._id || '',
                assigned: initialData.assigned?._id || ''
            };
            setFormData(formattedData);
        } else {
            // Reset form when opening for new entry
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                description: '',
                note: '',
                date: new Date().toISOString().split('T')[0],
                assigned: '',
                reference: '',
                class: '',
                noOfChild: 1
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // View Mode Render
    if (viewMode) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Enquiry Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this admission enquiry
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Student Information Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <IconUser className="w-4 h-4" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                                    <p className="text-sm font-medium">{formData.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Phone</Label>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <IconPhone className="w-3 h-3" />
                                        {formData.phone || '-'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <IconMail className="w-3 h-3" />
                                        {formData.email || '-'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Address</Label>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <IconMapPin className="w-3 h-3" />
                                        {formData.address || '-'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Number of Children</Label>
                                    <p className="text-sm font-medium">{formData.noOfChild || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admission Details Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <IconSchool className="w-4 h-4" />
                                    Admission Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Class</Label>
                                    <div className="mt-1">
                                        <Badge variant="secondary">
                                            {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Assigned Teacher</Label>
                                    <p className="text-sm font-medium">
                                        {teachersList.find(t => t._id === formData.assigned)?.name || 'Unassigned'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Enquiry Date</Label>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <IconCalendar className="w-3 h-3" />
                                        {formData.date ? new Date(formData.date).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        {formData.description && (
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <IconNotes className="w-4 h-4" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Note */}
                        {formData.note && (
                            <Card className="border-amber-200 bg-amber-50/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <IconLock className="w-4 h-4" />
                                        Admin Note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{formData.note}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reference */}
                        {formData.reference && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <IconInfoCircle className="w-4 h-4" />
                                        Reference
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{formData.reference}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Form Mode Render
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {initialData ? 'Edit Enquiry' : 'Add New Enquiry'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the enquiry details below' : 'Fill in the details to create a new enquiry'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        {/* Row 1: Name, Phone, Email */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field>
                                <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter student name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Field>
                        </div>

                        {/* Row 2: Date, Class, Teacher, Children */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Field>
                                <FieldLabel htmlFor="date">Date *</FieldLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-8 px-2.5",
                                                !formData.date && "text-muted-foreground"
                                            )}
                                        >
                                            <IconCalendar className="mr-2 h-4 w-4" />
                                            {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.date ? new Date(formData.date) : undefined}
                                            onSelect={(date) => setFormData(prev => ({ ...prev, date: date ? date.toISOString().split('T')[0] : '' }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="class">Select Class *</FieldLabel>
                                <Select
                                    value={formData.class}
                                    onValueChange={(value) => handleSelectChange('class', value)}
                                    required
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Choose a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {classesList.map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id}>
                                                    {cls.sclassName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="assigned">Assign Teacher</FieldLabel>
                                <Select
                                    value={formData.assigned}
                                    onValueChange={(value) => handleSelectChange('assigned', value)}
                                >
                                    <SelectTrigger id="assigned">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {teachersList.map((teacher) => (
                                                <SelectItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="noOfChild">Number of Children</FieldLabel>
                                <Input
                                    id="noOfChild"
                                    name="noOfChild"
                                    type="number"
                                    min="1"
                                    placeholder="Enter number"
                                    value={formData.noOfChild}
                                    onChange={handleChange}
                                />
                            </Field>
                        </div>

                        {/* Row 3: Address (Full Width) */}
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="address">Address</FieldLabel>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Other Full Width Fields */}
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter enquiry description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="note" className="flex items-center gap-2">
                                    Admin Note (Private)
                                </FieldLabel>
                                <Textarea
                                    id="note"
                                    name="note"
                                    placeholder="Add internal notes (only visible to admins)"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={2}
                                    className="border-amber-200 bg-amber-50/50"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="reference">Reference (Optional)</FieldLabel>
                                <Textarea
                                    id="reference"
                                    name="reference"
                                    placeholder="How did they know about us?"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    rows={2}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? 'Update Enquiry' : 'Save Enquiry'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EnquiryModal;
