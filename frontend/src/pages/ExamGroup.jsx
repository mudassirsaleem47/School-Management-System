import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { formatDateTime } from '../utils/formatDateTime';
import { DatePicker } from "@/components/ui/DatePicker";
import { BookOpen, Plus, Edit, Trash2, Calendar, Clock, Award, MapPin, ListChecks, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const ExamGroup = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Group dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Add Exam dialog
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [selectedGroupForExam, setSelectedGroupForExam] = useState(null);
  const [examSchedules, setExamSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [examForm, setExamForm] = useState({
    subject: '', class: '', examDate: '', startTime: '',
    duration: '', totalMarks: '', passingMarks: '', roomNumber: '', instructions: ''
  });

  const [formData, setFormData] = useState({
    groupName: '', academicYear: new Date().getFullYear().toString(), description: '', status: 'Active'
  });

  useEffect(() => {
    if (currentUser) { fetchGroups(); fetchClasses(); }
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`);
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching exam groups', 'error');
    } finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (error) { console.error('Error fetching classes:', error); }
  };

  const fetchExamSchedules = async (groupId) => {
    try {
      setLoadingSchedules(true);
      const res = await axios.get(`${API_BASE}/ExamSchedules/Group/${groupId}`);
      setExamSchedules(Array.isArray(res.data) ? res.data : []);
    } catch { setExamSchedules([]); }
    finally { setLoadingSchedules(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!formData.groupName || !formData.academicYear || !formData.status) {
        showToast('Please fill in all required fields', 'error'); return;
      }
      const payload = { ...formData, school: currentUser._id };
      if (editingGroup) {
        await axios.put(`${API_BASE}/ExamGroup/${editingGroup._id}`, payload);
        showToast('Exam group updated!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamGroupCreate`, payload);
        showToast('Exam group created!', 'success');
      }
      resetForm(); fetchGroups();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving exam group', 'error');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({ groupName: group.groupName, academicYear: group.academicYear, description: group.description || '', status: group.status });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => { setItemToDelete(id); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`${API_BASE}/ExamGroup/${itemToDelete}`);
      showToast('Exam group deleted!', 'success'); fetchGroups();
    } catch (error) { showToast(error.response?.data?.message || 'Error deleting', 'error'); }
    setDeleteDialogOpen(false); setItemToDelete(null);
  };

  const resetForm = () => {
    setFormData({ groupName: '', academicYear: new Date().getFullYear().toString(), description: '', status: 'Active' });
    setEditingGroup(null); setIsDialogOpen(false);
  };

  const openExamDialog = (group) => {
    setSelectedGroupForExam(group); setExamSchedules([]);
    fetchExamSchedules(group._id); setExamDialogOpen(true);
  };

  const resetExamForm = () => {
    setExamForm({ subject: '', class: '', examDate: '', startTime: '', duration: '', totalMarks: '', passingMarks: '', roomNumber: '', instructions: '' });
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!examForm.subject || !examForm.class || !examForm.examDate || !examForm.startTime || !examForm.duration || !examForm.totalMarks || !examForm.passingMarks) {
      showToast('Please fill in all required fields', 'error'); return;
    }
    try {
      await axios.post(`${API_BASE}/ExamScheduleCreate`, {
        ...examForm, examGroup: selectedGroupForExam._id, school: currentUser._id,
        duration: Number(examForm.duration), totalMarks: Number(examForm.totalMarks), passingMarks: Number(examForm.passingMarks),
      });
      showToast('Exam added!', 'success'); resetExamForm(); fetchExamSchedules(selectedGroupForExam._id);
    } catch (error) { showToast(error.response?.data?.message || 'Error adding exam', 'error'); }
  };

  const handleDeleteExam = async (scheduleId) => {
    try {
      await axios.delete(`${API_BASE}/ExamSchedule/${scheduleId}`);
      showToast('Exam deleted!', 'success'); fetchExamSchedules(selectedGroupForExam._id);
    } catch { showToast('Error deleting exam', 'error'); }
  };

  const StatusBadge = ({ status }) => {
    let cls = "";
    switch (status) {
      case 'Active': cls = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200"; break;
      case 'Inactive': cls = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200"; break;
      case 'Completed': cls = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"; break;
      default: cls = "bg-gray-100 text-gray-700";
    }
    return <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-xs ${cls}`}>{status}</Badge>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Groups</h1>
          <p className="text-muted-foreground mt-1">Organize exams by term, semester, or academic year</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" /> Create Exam Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Exam Group' : 'Create Exam Group'}</DialogTitle>
              <DialogDescription>{editingGroup ? 'Update the details for this exam group.' : 'Add a new exam group to your academic calendar.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input id="groupName" name="groupName" value={formData.groupName} onChange={handleInputChange} placeholder="e.g., Mid Term 2024" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input id="academicYear" name="academicYear" value={formData.academicYear} onChange={handleInputChange} placeholder="e.g., 2024" required />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Optional description..." className="resize-none" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm} type="button">Cancel</Button>
              <Button onClick={handleSubmit}>{editingGroup ? 'Update Group' : 'Create Group'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* List / Table View */}
      {groups.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No exam groups yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">Create your first exam group to start scheduling exams.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="font-semibold">Group Name</TableHead>
                  <TableHead className="font-semibold">Academic Year</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                <TableRow key={group._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{group.groupName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {group.academicYear}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={group.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {group.description || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openExamDialog(group)}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Exam
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(group._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Exam Dialog */}
      <Dialog open={examDialogOpen} onOpenChange={(open) => { if (!open) { setExamDialogOpen(false); resetExamForm(); } }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              {selectedGroupForExam?.groupName} — Exams
            </DialogTitle>
            <DialogDescription>Add exam schedule entries for this group.</DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleAddExam} className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Add New Exam</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject *</Label>
                <Input placeholder="e.g. Mathematics" value={examForm.subject} onChange={e => setExamForm(p => ({ ...p, subject: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Class *</Label>
                <Select value={examForm.class} onValueChange={val => setExamForm(p => ({ ...p, class: val }))}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Exam Date *</Label>
                <DatePicker value={examForm.examDate} onChange={val => setExamForm(p => ({ ...p, examDate: val }))} placeholder="Select date" />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time *</Label>
                <Input type="time" value={examForm.startTime} onChange={e => setExamForm(p => ({ ...p, startTime: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (mins) *</Label>
                <Input type="number" min="1" placeholder="e.g. 90" value={examForm.duration} onChange={e => setExamForm(p => ({ ...p, duration: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Room Number</Label>
                <Input placeholder="e.g. Room 5" value={examForm.roomNumber} onChange={e => setExamForm(p => ({ ...p, roomNumber: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks *</Label>
                <Input type="number" min="1" placeholder="e.g. 100" value={examForm.totalMarks} onChange={e => setExamForm(p => ({ ...p, totalMarks: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Passing Marks *</Label>
                <Input type="number" min="1" placeholder="e.g. 40" value={examForm.passingMarks} onChange={e => setExamForm(p => ({ ...p, passingMarks: e.target.value }))} required />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Instructions</Label>
                <Textarea placeholder="Optional instructions..." className="resize-none" rows={2} value={examForm.instructions} onChange={e => setExamForm(p => ({ ...p, instructions: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetExamForm}>Clear</Button>
              <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add Exam</Button>
            </div>
          </form>

          <Separator />

          {/* Existing Schedules */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Scheduled Exams ({examSchedules.length})</p>
            {loadingSchedules ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : examSchedules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No exams scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {examSchedules.map(s => (
                  <div key={s._id} className="flex items-start justify-between bg-card border rounded-lg p-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{s.subject}</span>
                        <Badge variant="outline" className="text-xs">{s.class?.sclassName || '—'}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(s.examDate, { dateOnly: true })}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.startTime} · {s.duration} mins</span>
                        <span className="flex items-center gap-1"><Award className="h-3 w-3" />Total: {s.totalMarks} · Pass: {s.passingMarks}</span>
                        {s.roomNumber && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.roomNumber}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDeleteExam(s._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the exam group and all associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setItemToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamGroup;
