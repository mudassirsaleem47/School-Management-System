import React, { useState, useEffect } from 'react';
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { Calendar, Plus, Edit, Trash2, Clock, BookOpen, FileText, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const ExamSchedule = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [schedules, setSchedules] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    examGroup: '',
    class: '',
    subject: '',
    examDate: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    roomNumber: '',
    instructions: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedGroup) {
      fetchSchedules();
    }
  }, [selectedGroup]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);
      
      setExamGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching data', 'error');
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ExamSchedules/Group/${selectedGroup}`);
      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching schedules', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        totalMarks: parseFloat(formData.totalMarks),
        passingMarks: parseFloat(formData.passingMarks),
        school: currentUser._id
      };

      if (editingSchedule) {
        await axios.put(`${API_BASE}/ExamSchedule/${editingSchedule._id}`, payload);
        showToast('Schedule updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamScheduleCreate`, payload);
        showToast('Exam scheduled successfully!', 'success');
      }
      
      resetForm();
      if (selectedGroup) fetchSchedules();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving schedule', 'error');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      examGroup: schedule.examGroup._id || schedule.examGroup,
      class: schedule.class._id || schedule.class,
      subject: schedule.subject,
      examDate: new Date(schedule.examDate).toISOString().split('T')[0],
      startTime: schedule.startTime,
      duration: schedule.duration.toString(),
      totalMarks: schedule.totalMarks.toString(),
      passingMarks: schedule.passingMarks.toString(),
      roomNumber: schedule.roomNumber || '',
      instructions: schedule.instructions || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
        try {
          await axios.delete(`${API_BASE}/ExamSchedule/${itemToDelete}`);
        showToast('Schedule deleted successfully!', 'success');
        fetchSchedules();
        } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting schedule', 'error');
        }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      examGroup: '',
      class: '',
      subject: '',
      examDate: '',
      startTime: '',
      duration: '',
      totalMarks: '',
      passingMarks: '',
      roomNumber: '',
      instructions: ''
    });
    setEditingSchedule(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exam Schedule</h1>
        <p className="text-muted-foreground">Create and manage exam timetables for different classes</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Schedule Management</CardTitle>
            <CardDescription>Select an exam group to view or manage its schedule.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="examGroupSelect">Select Exam Group</Label>
                    <Select 
                        value={selectedGroup} 
                        onValueChange={setSelectedGroup}
                    >
                        <SelectTrigger id="examGroupSelect">
                            <SelectValue placeholder="Select Exam Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {examGroups.map(group => (
                                <SelectItem key={group._id} value={group._id}>
                                    {group.groupName} ({group.academicYear})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            {selectedGroup && (
              <div className="grid w-full max-w-sm items-center gap-1.5 ml-4">
                <Label htmlFor="classFilterSelect">Select Class</Label>
                <Select
                  value={selectedClassFilter}
                  onValueChange={setSelectedClassFilter}
                >
                  <SelectTrigger id="classFilterSelect">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.sclassName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

                {selectedGroup && (
                    <div className="ml-auto">
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            if (!open) resetForm();
                            setIsDialogOpen(open);
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Exam
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingSchedule ? 'Edit Exam Schedule' : 'Add Exam Schedule'}</DialogTitle>
                                    <DialogDescription>
                                        {editingSchedule ? 'Update the details for this exam.' : 'Schedule a new exam for a class.'}
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="examGroup">Exam Group *</Label>
                                            <Select 
                                                value={formData.examGroup} 
                                                onValueChange={(value) => handleSelectChange('examGroup', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {examGroups.map(group => (
                                                        <SelectItem key={group._id} value={group._id}>{group.groupName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="class">Class *</Label>
                                            <Select 
                                                value={formData.class} 
                                                onValueChange={(value) => handleSelectChange('class', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(cls => (
                                                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Mathematics"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="examDate">Exam Date *</Label>
                          <DatePicker
                            id="examDate"
                                                value={formData.examDate}
                            onChange={(val) => setFormData(prev => ({ ...prev, examDate: val }))}
                            placeholder="Select exam date"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Start Time *</Label>
                                            <Input
                                                id="startTime"
                                                name="startTime"
                                                type="time"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (min) *</Label>
                                            <Input
                                                id="duration"
                                                name="duration"
                                                type="number"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalMarks">Total Marks *</Label>
                                            <Input
                                                id="totalMarks"
                                                name="totalMarks"
                                                type="number"
                                                value={formData.totalMarks}
                                                onChange={handleInputChange}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="passingMarks">Passing Marks *</Label>
                                            <Input
                                                id="passingMarks"
                                                name="passingMarks"
                                                type="number"
                                                value={formData.passingMarks}
                                                onChange={handleInputChange}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="roomNumber">Room Number</Label>
                                        <Input
                                            id="roomNumber"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Room 101"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instructions">Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleInputChange}
                                            placeholder="Special instructions..."
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                     <Button variant="outline" onClick={resetForm} type="button">Cancel</Button>
                                     <Button onClick={handleSubmit} type="submit">{editingSchedule ? 'Update Schedule' : 'Add Schedule'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Timetable</CardTitle>
            <CardDescription>
                Checking schedule for {examGroups.find(g => g._id === selectedGroup)?.groupName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
                    <Calendar className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-lg font-medium">No exams scheduled</p>
                    <p className="text-sm">Add exams to create the timetable for this group.</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Marks (Pass)</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                      {schedules
                        .filter(schedule => selectedClassFilter === 'all' || (schedule.class && schedule.class._id === selectedClassFilter) || schedule.class === selectedClassFilter)
                        .map((schedule) => (
                                <TableRow key={schedule._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDateTime(schedule.examDate, { dateOnly: true })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {schedule.startTime}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {schedule.class?.sclassName || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{schedule.subject}</TableCell>
                                    <TableCell>{schedule.duration} min</TableCell>
                                    <TableCell>{schedule.totalMarks} ({schedule.passingMarks})</TableCell>
                                    <TableCell>{schedule.roomNumber || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                                                <Edit className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(schedule._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamSchedule;

