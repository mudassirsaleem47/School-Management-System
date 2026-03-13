import React, { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import { X, Upload, FileText, Download, Eye, Trash2 } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/DatePicker";
import API_URL from '@/config/api';


const ComplainModal = ({ isOpen, onClose, onSubmit, initialData = null, viewMode = false }) => {
    // Form state
    const [formData, setFormData] = useState({
        complainBy: '',
        phone: '',
        date: new Date().toISOString(),
        description: '',
        actionTaken: '',
        assigned: '',
        note: '',
        document: ''
    });

    const [showFullImage, setShowFullImage] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                complainBy: initialData.complainBy || '',
                phone: initialData.phone || '',
                date: initialData.date || new Date().toISOString(),
                description: initialData.description || '',
                actionTaken: initialData.actionTaken || '',
                assigned: initialData.assigned || '',
                note: initialData.note || '',
                document: initialData.document || ''
            });
        } else {
            // Reset form when opening for "Add"
            setFormData({
                complainBy: '',
                phone: '',
                date: new Date().toISOString(),
                description: '',
                actionTaken: '',
                assigned: '',
                note: '',
                document: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, document: file }));
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, document: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Helper to check if document is an image
    const isImage = (doc) => {
        if (!doc) return false;
        if (doc instanceof File) {
            return doc.type.startsWith('image/');
        }
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(doc);
    };

    // Helper to get document URL
    const getDocUrl = (doc) => {
        if (!doc) return '';
        if (doc instanceof File) return URL.createObjectURL(doc);
        return doc.startsWith('http') ? doc : `${API_URL}/${doc}`;
    };

    // Custom File Display Component
    const FileDisplay = ({ doc }) => {
        if (!doc) return null;
        const isImg = isImage(doc);
        const url = getDocUrl(doc);
        const name = doc instanceof File ? doc.name : (typeof doc === 'string' ? doc.split(/[\\/]/).pop() : 'Document');

        return (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-muted">
                    {isImg ? <Eye className="h-5 w-5 text-muted-foreground" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    {isImg && (
                        <button 
                            type="button"
                            onClick={() => setShowFullImage(true)}
                            className="text-xs text-primary hover:underline"
                        >
                            View Image
                        </button>
                    )}
                </div>
                {!viewMode && (
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                )}
                {viewMode && !isImg && (
                    <Button variant="ghost" size="icon" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>
        );
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 max-h-[90vh] flex flex-col gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>{viewMode ? 'Complain Details' : (initialData ? 'Edit Complain' : 'Add New Complain')}</DialogTitle>
                    <DialogDescription>
                        {viewMode
                            ? 'Review the details of the complaint below.'
                            : 'Fill out the form below to log a new complaint.'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 max-h-[calc(90vh-140px)]">
                    <div className="pb-6">
                        {viewMode ? (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase">Complain By</Label>
                                        <div className="font-medium text-base">{formData.complainBy}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase">Date</Label>
                                        <div className="font-medium text-base">{formatDateTime(formData.date)}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase">Phone</Label>
                                        <div className="font-medium">{formData.phone || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase">Assigned To</Label>
                                        <div>
                                            {formData.assigned ? (
                                                <Badge variant="secondary">{formData.assigned}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase">Description</Label>
                                    <Card className="bg-muted/30 border-none shadow-none">
                                        <CardContent className="p-4 text-sm leading-relaxed">
                                            {formData.description}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Action Taken */}
                                {formData.actionTaken && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground text-xs uppercase">Action Taken</Label>
                                        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900 shadow-none">
                                            <CardContent className="p-4 text-sm leading-relaxed text-green-800 dark:text-green-300">
                                                {formData.actionTaken}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Notes & Documents */}
                                <div className="grid grid-cols-1 gap-6">
                                    {formData.note && (
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs uppercase">Note</Label>
                                            <p className="text-sm text-balance">{formData.note}</p>
                                        </div>
                                    )}

                                    {formData.document && (
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs uppercase">Attachment</Label>
                                            <FileDisplay doc={formData.document} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                                <form id="complain-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="complainBy">Complain By <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="complainBy"
                                                name="complainBy"
                                                value={formData.complainBy}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                                            <DatePicker
                                                id="date"
                                                value={formData.date}
                                                onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                                                placeholder="Select date"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="123-456-7890"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="assigned">Assigned To</Label>
                                            <Input
                                                id="assigned"
                                                name="assigned"
                                                value={formData.assigned}
                                                onChange={handleChange}
                                                placeholder="Staff Member / Department"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            placeholder="Detailed description of the complaint..."
                                            className="h-24 resize-none"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="actionTaken">Action Taken</Label>
                                        <Textarea
                                            id="actionTaken"
                                        name="actionTaken"
                                        value={formData.actionTaken}
                                        onChange={handleChange}
                                            placeholder="Steps taken to resolve..."
                                            className="h-20 resize-none"
                                    />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="note">Note</Label>
                                        <Textarea
                                            id="note"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                            placeholder="Internal notes..."
                                            className="h-16 resize-none"
                                    />
                                </div>

                                    <div className="grid gap-2">
                                        <Label>Attachment</Label>
                                    <div 
                                        onClick={handleFileClick}
                                            className={`
                                            border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors
                                            flex flex-col items-center justify-center text-center gap-2
                                            ${formData.document ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25'}
                                        `}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        
                                        {formData.document ? (
                                                <div className="w-full">
                                                    <FileDisplay doc={formData.document} />
                                                    <p className="text-xs text-muted-foreground mt-2">Click to replace file</p>
                                            </div>
                                        ) : (
                                            <>
                                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div className="text-sm font-medium">Click to upload document</div>
                                                        <div className="text-xs text-muted-foreground">Support for images and documents</div>
                                            </>
                                        )}
                                    </div>
                                    </div>
                            </form>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2">
                    {viewMode ? (
                        <Button type="button" onClick={onClose} className="w-full sm:w-auto">Close</Button>
                    ) : (
                        <div className="flex w-full sm:justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" form="complain-form">
                                {initialData ? 'Update Complain' : 'Save Complain'}
                            </Button>
                            </div>
                    )}
                </DialogFooter>
            </DialogContent>

            {/* Full-Size Image Dialog/Overlay */}
            {showFullImage && formData.document && (
                <div 
                    className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setShowFullImage(false)}
                >
                    <button 
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={getDocUrl(formData.document)} 
                        alt="Full size view"
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </Dialog>
    );
};

export default ComplainModal;
