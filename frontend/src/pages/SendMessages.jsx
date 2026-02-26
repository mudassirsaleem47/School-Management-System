import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Users, MessageCircle, Mail, MessageSquare, Search, Info, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import API_URL from '@/config/api';
const API_BASE = API_URL;

const SendMessages = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNameClick = (e, studentId) => {
        e.stopPropagation();
        const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${basePath}/students/${studentId}`);
    };
    
    // State Management
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Form State
    const [recipientGroup, setRecipientGroup] = useState('student'); // 'student' or 'staff'
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [contentSource, setContentSource] = useState('custom'); // 'custom' or 'template'
    const [deliveryChannel, setDeliveryChannel] = useState('whatsapp'); // 'whatsapp' or 'email'
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [designationFilter, setDesignationFilter] = useState('all');
    const [classes, setClasses] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            
            const [stuRes, staffRes, tempRes, classesRes, designationsRes] = await Promise.all([
                axios.get(`${API_BASE}/Students/${schoolId}`),
                axios.get(`${API_BASE}/Staff/${schoolId}`),
                axios.get(`${API_BASE}/MessageTemplates/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/Designations/${schoolId}`)
            ]);
            
            setStudents(Array.isArray(stuRes.data) ? stuRes.data : []);
            setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
            setTemplates(Array.isArray(tempRes.data) ? tempRes.data : []);
            setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
            setDesignations(Array.isArray(designationsRes.data) ? designationsRes.data : []);
            
        } catch (error) {
            showToast("Error loading data", "error");
        } finally {
            setLoading(false);
        }
    }, [currentUser._id, showToast]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    // Filter Recipients
    const filteredRecipients = recipientGroup === 'student'
        ? students.filter(student => {
            const matchesSearch = !searchQuery ||
                student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.phone?.includes(searchQuery);

            const matchesClass = classFilter === 'all' || student.class?._id === classFilter;

            return matchesSearch && matchesClass;
        })
        : staffList.filter(staff => {
            const matchesSearch = !searchQuery ||
                staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                staff.phone?.includes(searchQuery);

            const matchesDesignation = designationFilter === 'all' || staff.designation?._id === designationFilter;

            return matchesSearch && matchesDesignation;
        });

    // Handle Select All
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRecipients(filteredRecipients.map(r => r._id));
        } else {
            setSelectedRecipients([]);
        }
    };

    // Check if distinct valid values are all selected
    const isAllSelected = filteredRecipients.length > 0 &&
        filteredRecipients.every(r => selectedRecipients.includes(r._id));

    // Handle Individual Selection
    const handleRecipientSelect = (id, checked) => {
        if (checked) {
            setSelectedRecipients(prev => [...prev, id]);
        } else {
            setSelectedRecipients(prev => prev.filter(rid => rid !== id));
        }
    };

    // Handle Template Selection
    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t._id === templateId);
        if (template) {
            setCustomMessage(template.content);
        }
    };

    // Send Messages
    const handleSendMessages = async () => {
        if (selectedRecipients.length === 0) {
            showToast('Please select at least one recipient first!', 'error');
            return;
        }
        
        const message = contentSource === 'template' 
            ? templates.find(t => t._id === selectedTemplate)?.content 
            : customMessage;
            
        if (!message || message.trim() === '') {
            showToast('Message is required!', 'error');
            return;
        }

        try {
            setSending(true);
            
            await axios.post(`${API_BASE}/SendMessages`, {
                school: currentUser._id,
                recipientIds: selectedRecipients,
                recipientGroup: recipientGroup,
                message: message,
                messageType: deliveryChannel, // Send 'whatsapp' or 'email'
                templateId: selectedTemplate || null
            });
            
            showToast(`Message sent to ${selectedRecipients.length} recipients via ${deliveryChannel}!`, 'success');
            setSelectedRecipients([]);
            setCustomMessage('');
            setSelectedTemplate('');
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error sending message!';
            showToast(errorMsg, 'error');
        } finally {
            setSending(false);
        }
    };

    // Clear selection when switching tabs
    useEffect(() => {
        setSelectedRecipients([]);
        setSearchQuery('');
        setClassFilter('all');
        setDesignationFilter('all');
    }, [recipientGroup]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Broadcast Messages</h1>
                    <p className="text-muted-foreground mt-1">Send campaigns via WhatsApp or Email to students and staff.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                        {selectedRecipients.length} Selected
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side - List (8/12) */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                <Tabs value={recipientGroup} onValueChange={setRecipientGroup} className="w-full xl:w-auto">
                                    <TabsList>
                                        <TabsTrigger value="student" className="flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Students
                                        </TabsTrigger>
                                        <TabsTrigger value="staff" className="flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Staff
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 xl:justify-end w-full xl:w-auto">
                                    <div className="relative flex-1 sm:min-w-[200px] w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search name/phone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                    {recipientGroup === 'student' ? (
                                        <Select value={classFilter} onValueChange={setClassFilter}>
                                            <SelectTrigger className="w-full sm:w-[140px] h-9">
                                                <SelectValue placeholder="All Classes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Classes</SelectItem>
                                                {classes.map(cls => (
                                                    <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                            <Select value={designationFilter} onValueChange={setDesignationFilter}>
                                                <SelectTrigger className="w-full sm:w-[140px] h-9">
                                                    <SelectValue placeholder="All Roles" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Roles</SelectItem>
                                                    {designations.map(des => (
                                                    <SelectItem key={des._id} value={des._id}>{des.name || des.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <Separator />

                        <div className="bg-muted/50 px-4 py-3 flex items-center border-b">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                                    Select All ({filteredRecipients.length})
                                </Label>
                            </div>
                        </div>

                        <CardContent className="p-0 flex-1 min-h-[400px]">
                            <ScrollArea className="h-[500px] w-full">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <p>Loading recipients...</p>
                                    </div>
                                ) : filteredRecipients.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mb-3 opacity-20" />
                                        <p>No recipients found matching your filter.</p>
                                        </div>
                                    ) : (
                                            <div className="divide-y relative">
                                                {filteredRecipients.map((recipient) => {
                                                    const isSelected = selectedRecipients.includes(recipient._id);
                                                    return (
                                                        <div
                                                            key={recipient._id}
                                                    className={`flex items-center px-4 py-3 hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                                                >
                                                    <Checkbox
                                                        id={`recipient-${recipient._id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => handleRecipientSelect(recipient._id, checked)}
                                                        className="mr-4 mt-0.5 self-start"
                                                    />
                                                    <div className="flex-1 min-w-0 grid gap-0.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                        {recipientGroup === 'student' ? (
                                                                            <p className="font-medium text-sm truncate hover:underline cursor-pointer text-primary" onClick={(e) => handleNameClick(e, recipient._id)}>
                                                                                {recipient.name}
                                                                            </p>
                                                                        ) : (
                                                                                <Label
                                                                                    htmlFor={`recipient-${recipient._id}`}
                                                                                    className="text-sm font-medium cursor-pointer truncate"
                                                                                >
                                                                                    {recipient.name}
                                                                                </Label>
                                                                        )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{recipient.phone}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {recipientGroup === 'student'
                                                                ? `Class: ${recipient.sclassName?.sclassName || '-'} • Father: ${recipient.fatherName || '-'}`
                                                                : `${recipient.designation?.name || recipient.designation?.title || 'Staff'}`
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side - Composer (4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Composer
                            </CardTitle>
                            <CardDescription>Compose and send your message</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* Channel Selector */}
                            <div className="space-y-2">
                                <Label>Delivery Channel</Label>
                                <Tabs value={deliveryChannel} onValueChange={setDeliveryChannel} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> WhatsApp
                                        </TabsTrigger>
                                        <TabsTrigger value="email" className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> Email
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <Separator />

                            {/* Message Source */}
                            <div className="space-y-2">
                                <Label>Message Source</Label>
                                <Tabs value={contentSource} onValueChange={setContentSource} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="custom">Custom Message</TabsTrigger>
                                        <TabsTrigger value="template">Use Template</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Template Select */}
                            {contentSource === 'template' && (
                                <div className="space-y-2">
                                    <Label>Select Template</Label>
                                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(t => (
                                                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Text Area */}
                            <div className="space-y-2">
                                <Label>Message Content</Label>
                                <Textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="min-h-[160px] resize-y font-normal"
                                    disabled={contentSource === 'template' && selectedTemplate}
                                />
                                <div className="flex justify-end text-xs text-muted-foreground">
                                    {customMessage.length} characters
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recipients:</span>
                                    <span className="font-medium">{selectedRecipients.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Est. Time:</span>
                                    <span className="font-medium">~{Math.ceil(selectedRecipients.length * 0.5) || 1}s</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleSendMessages}
                                className="w-full shadow-md"
                                disabled={sending || selectedRecipients.length === 0}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Send Campaign
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SendMessages;

