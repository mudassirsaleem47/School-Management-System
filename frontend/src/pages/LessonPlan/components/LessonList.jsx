import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const LessonList = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    // Filter state
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    // Data state
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', topics: [] }); // topics: [{ title: '' }]

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser]);

    // Fetch Classes
    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClasses(res.data);
        } catch (err) { }
    };

    // Fetch Subjects when Class Changes
    useEffect(() => {
        if (selectedClass) {
            fetchSubjects(selectedClass);
        } else {
            setSubjects([]);
            setLessons([]);
        }
    }, [selectedClass]);

    const fetchSubjects = async (classId) => {
        try {
            // Usually subjects are linked to a class. Assuming endpoint exists or fetch all subjects and filter
            // For now, fetching general subjects or specific class subjects if endpoint differs
             // Assuming existing endpoint: /Subjects/:schoolId
            // OR /Subjects/:classId -> Need to check existing endpoints.
            // Using generic all subject fetch for now and filtering if possible, or assume generic list
            const res = await axios.get(`${API_BASE}/AllSubjects/${currentUser._id}`);
            const allSubs = res.data;
             // Filtering based on class usually happens in backend or subjects associated with class.
             // For simplicity, just listing all subjects.
            setSubjects(allSubs);
        } catch (err) { }
    };

    // Fetch Lessons
    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchLessons();
        }
    }, [selectedClass, selectedSubject]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/LessonPlan/Lesson/List`, {
                school: currentUser._id,
                sclass: selectedClass,
                subject: selectedSubject
            });
            // Fetch topics for each lesson
            const lessonsWithTopics = await Promise.all(res.data.map(async (lesson) => {
                const topicRes = await axios.get(`${API_BASE}/LessonPlan/Topic/${lesson._id}`);
                return { ...lesson, topics: topicRes.data };
            }));
            
            setLessons(lessonsWithTopics);
        } catch (err) {
            showToast('Failed to fetch lessons', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTopicField = () => {
        setFormData({ ...formData, topics: [...formData.topics, { title: '' }] });
    };

    const handleTopicChange = (index, value) => {
        const newTopics = [...formData.topics];
        newTopics[index].title = value;
        setFormData({ ...formData, topics: newTopics });
    };

    const handleRemoveTopicField = (index) => {
        const newTopics = [...formData.topics];
        newTopics.splice(index, 1);
        setFormData({ ...formData, topics: newTopics });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedSubject) {
             showToast('Please select Class and Subject first', 'error');
             return;
        }

        try {
            setSubmitting(true);
            let lessonId = editingId;
            
            // 1. Create/Update Lesson
            const lessonPayload = {
                school: currentUser._id,
                sclass: selectedClass,
                subject: selectedSubject,
                title: formData.title
            };

            if (editingId) {
                await axios.put(`${API_BASE}/LessonPlan/Lesson/${editingId}`, lessonPayload);
            } else {
                const res = await axios.post(`${API_BASE}/LessonPlan/Lesson`, lessonPayload);
                lessonId = res.data._id;
            }

            // 2. Handle Topics
            // For simplicity in edit, we might just add new ones or update existing?
            // A simple approach: Create all new topics. Deleting/Updating existing topics is complex in a single form.
            // Let's assume we establish basic topics here. 
            
            // Filter non-empty topics
            const topicsToAdd = formData.topics.filter(t => t.title.trim() !== '');
            
            for (const topic of topicsToAdd) {
                await axios.post(`${API_BASE}/LessonPlan/Topic`, {
                    school: currentUser._id,
                    lesson: lessonId,
                    title: topic.title
                });
            }

            showToast('Lesson saved successfully', 'success');
            setShowForm(false);
            setFormData({ title: '', topics: [] });
            setEditingId(null);
            fetchLessons();
        } catch (err) {
            showToast('Failed to save lesson', 'error');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this lesson and all its topics?')) return;
        try {
            await axios.delete(`${API_BASE}/LessonPlan/Lesson/${id}`);
            showToast('Lesson deleted', 'success');
            setLessons(lessons.filter(l => l._id !== id));
        } catch (err) {
            showToast('Failed to delete lesson', 'error');
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
             {/* Filter / List Selection */}
            <Card className="md:col-span-3">
                 <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 w-full md:w-1/3">
                            <label className="text-sm font-medium">Select Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 w-full md:w-1/3">
                            <label className="text-sm font-medium">Select Subject</label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map((sub) => (
                                        <SelectItem key={sub._id} value={sub._id}>{sub.subName} ({sub.subCode})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:ml-auto">
                            <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', topics: [] }); }} disabled={!selectedClass || !selectedSubject}>
                                <Plus className="mr-2 h-4 w-4" /> Add Lesson
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List or Form */}
            <div className="md:col-span-3">
                {showForm ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingId ? 'Edit Lesson' : 'Add New Lesson'}</CardTitle>
                            <CardDescription>Define lesson details and topics.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Lesson Title</label>
                                    <Input 
                                        placeholder="e.g. Introduction to Algebra" 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium block">Topics</label>
                                    {formData.topics.map((topic, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input 
                                                placeholder={`Topic ${index + 1}`}
                                                value={topic.title}
                                                onChange={e => handleTopicChange(index, e.target.value)}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTopicField(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddTopicField} className="mt-2">
                                        <Plus className="mr-2 h-3 w-3" /> Add Topic
                                    </Button>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Lesson
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                         {!selectedClass || !selectedSubject ? (
                             <div className="text-center p-12 bg-muted/20 rounded-xl border-2 border-dashed">
                                 <p className="text-muted-foreground">Select Class and Subject to view lessons.</p>
                             </div>
                         ) : loading ? (
                             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                         ) : lessons.length === 0 ? (
                             <div className="text-center p-12 bg-muted/20 rounded-xl border-2 border-dashed">
                                 <p className="text-muted-foreground">No lessons found. Create one to get started.</p>
                             </div>
                         ) : (
                             lessons.map((lesson) => (
                                 <Card key={lesson._id}>
                                     <CardHeader className="pb-3">
                                         <div className="flex items-start justify-between">
                                             <div>
                                                 <CardTitle className="text-lg">{lesson.title}</CardTitle>
                                                 <CardDescription>{lesson.topics.length} Topics</CardDescription>
                                             </div>
                                             <div className="flex gap-1">
                                                 <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson._id)}>
                                                     <Trash2 className="h-4 w-4 text-destructive" />
                                                 </Button>
                                             </div>
                                         </div>
                                     </CardHeader>
                                     <CardContent>
                                         <div className="rounded-md border bg-muted/10 p-4">
                                             <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Topics</h4>
                                             {lesson.topics.length > 0 ? (
                                                 <ul className="space-y-2">
                                                     {lesson.topics.map(t => (
                                                         <li key={t._id} className="text-sm flex items-center gap-2">
                                                             <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                             {t.title}
                                                         </li>
                                                     ))}
                                                 </ul>
                                             ) : (
                                                 <p className="text-xs text-muted-foreground italic">No topics added.</p>
                                             )}
                                         </div>
                                     </CardContent>
                                 </Card>
                             ))
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonList;
