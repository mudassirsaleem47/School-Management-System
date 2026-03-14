import React, { useState, useEffect, useMemo } from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
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
    User,
    Phone,
    Mail,
    MapPin,
    Calendar as CalendarIcon,
    School,
    Users,
    FileText,
    Lock,
    Info,
    GraduationCap,
    CheckCircle2,
    CalendarDays
} from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EnquiryModal = ({ isOpen, onClose, onSubmit, initialData, classesList = [], teachersList = [], viewMode = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        note: '',
        date: new Date().toISOString(),
        assigned: '',
        reference: '',
        class: '',
        noOfChild: 1
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                date: initialData.date || new Date().toISOString(),
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
                date: new Date().toISOString(),
                assigned: '',
                reference: '',
                class: '',
                noOfChild: 1
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Required fields validation
        const newErrors = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.class) newErrors.class = "Class is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    // View Mode Render
    if (viewMode) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                            <User className="w-6 h-6" />
                            Enquiry Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete information about the admission enquiry for <span className="font-semibold text-foreground">{formData.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Student Information Card */}
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardHeader className="pb-3 bg-muted/10">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                                        <User className="w-4 h-4" />
                                        Applicant Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                                            <p className="font-medium text-base">{formData.name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Children</Label>
                                            <p className="font-medium flex items-center gap-1">
                                                <Users className="w-3 h-3 text-muted-foreground" />
                                                {formData.noOfChild}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Contact Details</Label>
                                        <div className="grid gap-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                                {formData.phone || '-'}
                                            </div>
                                            {formData.email && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                                    {formData.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Address</Label>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                                            {formData.address || 'No address provided'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Admission Details Card */}
                            <Card className="border-l-4 border-l-green-500 shadow-sm">
                                <CardHeader className="pb-3 bg-muted/10">
                                    <CardTitle className="text-base flex items-center gap-2 text-green-700">
                                        <School className="w-4 h-4" />
                                        Admission Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Interested Class</Label>
                                            <div>
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                                    <GraduationCap className="mr-1 h-3 w-3" />
                                                    {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Enquiry Date</Label>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <CalendarIcon className="w-3.5 h-3.5 text-green-600" />
                                                {formData.date ? formatDateTime(formData.date) : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Counselor</Label>
                                        {formData.assigned ? (
                                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-100">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">
                                                    {teachersList.find(t => t._id === formData.assigned)?.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-100">
                                                <Info className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-800">Unassigned</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card className="md:col-span-2 border-l-4 border-l-gray-400 shadow-sm">
                                <CardHeader className="pb-3 bg-muted/10">
                                    <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                                        <FileText className="w-4 h-4" />
                                        Description & Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {formData.description ? (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                                                {formData.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No description provided.</p>
                                    )}

                                    {formData.note && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-amber-600 uppercase tracking-wider flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Admin Private Note
                                            </Label>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-amber-50 p-3 rounded-md border border-amber-200 shadow-sm">
                                                {formData.note}
                                            </p>
                                        </div>
                                    )}

                                    {formData.reference && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reference Source</Label>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Source:</span> {formData.reference}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-gray-50/50">
                        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Form Mode Render
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold">
                        {initialData ? 'Edit Enquiry' : 'New Admission Enquiry'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details for this enquiry record.' : 'Enter details for a new student admission enquiry.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal Information
                        </h3>

                        {/* Row 1: Name, Phone, Email */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Student Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="focus-visible:ring-blue-500"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Primary Contact"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="focus-visible:ring-blue-500"
                                />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Row 2: Date, Class, Teacher, Children */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarDays className="mr-2 h-4 w-4" />
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
                                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Interested Class <span className="text-destructive">*</span></Label>
                                <Select
                                    value={formData.class}
                                    onValueChange={(value) => handleSelectChange('class', value)}
                                    required
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select Class" />
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
                                {errors.class && <p className="text-xs text-destructive">{errors.class}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assigned">Assign To</Label>
                                <Select
                                    value={formData.assigned}
                                    onValueChange={(value) => handleSelectChange('assigned', value)}
                                >
                                    <SelectTrigger id="assigned">
                                        <SelectValue placeholder="Select Staff" />
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="noOfChild">No. of Children</Label>
                                <Input
                                    id="noOfChild"
                                    name="noOfChild"
                                    type="number"
                                    min="1"
                                    value={formData.noOfChild}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Row 3: Address (Full Width) */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                placeholder="Full residential address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="resize-none focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2 mt-6">
                            <FileText className="w-4 h-4" /> Additional Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="description">Requirement / Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter specific requirements or details..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="resize-none focus-visible:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="note" className="flex items-center gap-2 text-amber-700">
                                        <Lock className="w-3 h-3" /> Admin Note (Private)
                                    </Label>
                                    <Textarea
                                        id="note"
                                        name="note"
                                        placeholder="Internal notes (hidden from printed reports)"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows={2}
                                        className="resize-none border-amber-200 bg-amber-50 focus-visible:ring-amber-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Reference / Source</Label>
                                    <Input
                                        id="reference"
                                        name="reference"
                                        placeholder="e.g. Website, Friend, Advertisement"
                                        value={formData.reference}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            {initialData ? 'Update Enquiry' : 'Save Enquiry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EnquiryModal;
