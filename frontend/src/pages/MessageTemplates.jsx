import React, { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, Copy, Clock, Search, FileText, Tag } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const MessageTemplates = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const editorRef = useRef(null);
    
    // State Management
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        content: ''
    });
    
    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Categories
    const categories = [
        { value: 'general', label: 'General' },
        { value: 'fee', label: 'Fee Related' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'exam', label: 'Exam/Result' },
        { value: 'event', label: 'Events' },
        { value: 'holiday', label: 'Holiday' },
        { value: 'other', label: 'Other' },
        { value: 'admission', label: 'Admission Confirmation' }
    ];

    // Fetch Templates
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const response = await axios.get(`${API_BASE}/MessageTemplates/${schoolId}`);
            setTemplates(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchTemplates();
    }, [currentUser]);

    // Modal Handlers
    const openModal = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setFormData({
                name: template.name,
                category: template.category,
                content: template.content
            });
        } else {
            setCurrentTemplate(null);
            setFormData({ name: '', category: 'general', content: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTemplate(null);
        setFormData({ name: '', category: 'general', content: '' });
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Strip HTML tags to check if content is empty
        const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
        if (!formData.name || !plainText) {
            showToast('All fields are required!', 'error');
            return;
        }

        try {
            const dataToSend = { ...formData, school: currentUser._id };
            
            if (currentTemplate) {
                await axios.put(`${API_BASE}/MessageTemplate/${currentTemplate._id}`, dataToSend);
                showToast('Template updated successfully!', 'success');
            } else {
                await axios.post(`${API_BASE}/MessageTemplateCreate`, dataToSend);
                showToast('New template created!', 'success');
            }
            
            closeModal();
            fetchTemplates();
        } catch (err) {
            showToast('Error saving template!', 'error');
        }
    };

    // Delete Logic
    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/MessageTemplate/${selectedDeleteId}`);
            fetchTemplates();
            showToast('Template deleted successfully!', 'success');
        } catch (err) {
            showToast('Error deleting template!', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setSelectedDeleteId(null);
        }
    };

    // Copy to Clipboard
    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content);
        showToast('Message copied to clipboard!', 'success');
    };

    // Filter Templates
    const filteredTemplates = templates.filter(template => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            template.name?.toLowerCase().includes(query) ||
            template.content?.toLowerCase().includes(query) ||
            template.category?.toLowerCase().includes(query)
        );
    });

    const insertTag = (tag) => {
        if (editorRef.current) {
            editorRef.current.insertText(tag);
        }
    };

    // Helper for badge variant
    const getBadgeVariant = (category) => {
        switch (category) {
            case 'fee': return 'destructive';
            case 'attendance': return 'default';
            case 'exam': return 'secondary';
            case 'event': return 'outline';
            case 'holiday': return 'secondary';
            case 'admission': return 'success';
            default: return 'outline';
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
                    <p className="text-muted-foreground mt-1">Manage reusable message templates for your campaigns</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Template
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                        <h3 className="text-lg font-semibold">No templates found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mb-4">
                            {templates.length === 0
                                ? "Get started by creating your first message template."
                                : "No templates match your search criteria."}
                        </p>
                        {templates.length === 0 && (
                            <Button onClick={() => openModal()}>
                                <Plus className="w-4 h-4 mr-2" /> Create Template
                            </Button>
                        )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <Card key={template._id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <Badge variant={getBadgeVariant(template.category)}>
                                            {categories.find(c => c.value === template.category)?.label || template.category}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground"
                                        onClick={() => copyToClipboard(template.content)}
                                        title="Copy content"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                    {template.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDateTime(template.createdAt)}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openModal(template)}>
                                        <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(template._id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle>{currentTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
                        <DialogDescription>
                            Create or edit a message template. Use dynamic tags to personalize.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6">
                        <form id="template-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Template Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Fee Reminder"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category} 
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Valid Content *</Label>
                                <RichTextEditor
                                    ref={editorRef}
                                    value={formData.content}
                                    onChange={(html) => setFormData({ ...formData, content: html })}
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Dynamic Tags (Click to insert)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { tag: '{{name}}', label: 'Student Name' },
                                        { tag: '{{father}}', label: 'Father Name' },
                                        { tag: '{{class}}', label: 'Class' },
                                        { tag: '{{section}}', label: 'Section' },
                                        { tag: '{{phone}}', label: 'Phone' },
                                        { tag: '{{fee_amount}}', label: 'Fee Amount' },
                                        { tag: '{{due_date}}', label: 'Due Date' },
                                        { tag: '{{school}}', label: 'School Name' },
                                        { tag: '{{email}}', label: 'Email' },
                                        { tag: '{{password}}', label: 'Password' },
                                        { tag: '{{roll_number}}', label: 'Roll Number' },
                                        { tag: '{{login_url}}', label: 'Login URL' }
                                    ].map(item => (
                                        <Badge
                                            key={item.tag}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-secondary transition-colors py-1.5"
                                            onClick={() => insertTag(item.tag)}
                                        >
                                            <Tag className="w-3 h-3 mr-1.5 text-muted-foreground" />
                                            {item.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-4 border-t">
                        <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
                        <Button type="submit" form="template-form">
                            {currentTemplate ? 'Update Template' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the message template.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MessageTemplates;

