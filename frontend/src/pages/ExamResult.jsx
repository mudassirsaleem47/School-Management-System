import React, { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Award, Plus, Edit, Search, TrendingUp, Users, CheckCircle, XCircle, AlertCircle, Calculator } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const ExamResult = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNameClick = (e, studentId) => {
    e.stopPropagation();
    const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
    navigate(`${basePath}/students/${studentId}`);
  };
  
  const [examGroups, setExamGroups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    marksObtained: '',
    status: 'Pass',
    remarks: ''
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsRes, gradesRes] = await Promise.all([
        axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`),
        axios.get(`${API_BASE}/MarksGrades/${currentUser._id}`)
      ]);
      
      setExamGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching data', 'error');
      setLoading(false);
    }
  }, [currentUser._id, showToast]);

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/ExamSchedules/Group/${selectedGroup}`);
      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching schedules', 'error');
    }
  }, [selectedGroup, showToast]);

  const fetchScheduleDetails = useCallback(async () => {
    try {
      const schedule = schedules.find(s => s._id === selectedSchedule);
      if (!schedule) return;

      const [stuRes, resRes] = await Promise.all([
        axios.get(`${API_BASE}/Students/${currentUser._id}`),
        axios.get(`${API_BASE}/ExamResults/Exam/${selectedSchedule}`)
      ]);

      const schoolStudents = Array.isArray(stuRes.data) ? stuRes.data : [];
      const classStudents = schoolStudents.filter(s =>
        s.sclassName?._id === schedule.sclassName?._id && s.section === schedule.section
      );

      setStudents(classStudents);
      setResults(Array.isArray(resRes.data) ? resRes.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching details', 'error');
    }
  }, [currentUser._id, schedules, selectedSchedule, showToast]);

  useEffect(() => {
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser, fetchInitialData]);

  useEffect(() => {
    if (selectedGroup) {
      fetchSchedules();
    }
  }, [selectedGroup, fetchSchedules]);

  useEffect(() => {
    if (selectedSchedule) {
      fetchScheduleDetails();
    }
  }, [selectedSchedule, fetchScheduleDetails]);

  const calculateGrade = (percentage) => {
    for (const grade of grades) {
      if (percentage >= grade.percentageFrom && percentage <= grade.percentageTo) {
        return grade.gradeName;
      }
    }
    return 'N/A';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResult = (student) => {
    setSelectedStudent(student);
    setEditingResult(null);
    setFormData({
      marksObtained: '',
      status: 'Pass',
      remarks: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditResult = (result, student) => {
    setSelectedStudent(student);
    setEditingResult(result);
    setFormData({
      marksObtained: result.marksObtained.toString(),
      status: result.status,
      remarks: result.remarks || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const schedule = schedules.find(s => s._id === selectedSchedule);
    if (!schedule) return;

    try {
      const marksObtained = parseFloat(formData.marksObtained);
      const percentage = ((marksObtained / schedule.totalMarks) * 100).toFixed(2);
      const grade = calculateGrade(parseFloat(percentage));

      const payload = {
        student: selectedStudent._id,
        examSchedule: selectedSchedule,
        marksObtained,
        totalMarks: schedule.totalMarks,
        percentage: parseFloat(percentage),
        grade,
        status: formData.status,
        remarks: formData.remarks,
        school: currentUser._id
      };

      if (editingResult) {
        await axios.put(`${API_BASE}/ExamResult/${editingResult._id}`, payload);
        showToast('Result updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamResultCreate`, payload);
        showToast('Result added successfully!', 'success');
      }
      
      setIsDialogOpen(false);
      fetchScheduleDetails();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving result', 'error');
    }
  };

  const getStudentResult = (studentId) => {
    return results.find(r => r.student._id === studentId || r.student === studentId);
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Pass': return 'success'; // or a custom success variant
      case 'Fail': return 'destructive';
      case 'Absent': return 'warning'; // or custom
      default: return 'secondary';
    }
  };

  // Custom Badge until we have variants configured
  const StatusBadge = ({ status }) => {
    let classes = "";
    switch(status) {
        case 'Pass': classes = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"; break;
        case 'Fail': classes = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"; break;
        case 'Absent': classes = "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"; break;
        default: classes = "bg-gray-100 text-gray-800";
    }
    
    return (
        <Badge variant="outline" className={`px-2 py-0.5 rounded-full ${classes}`}>
            {status}
        </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentSchedule = schedules.find(s => s._id === selectedSchedule);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exam Results</h1>
        <p className="text-muted-foreground">Enter and manage student marks and results</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Result Filter</CardTitle>
            <CardDescription>Select Exam Group and Exam to manage results</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="examGroupSelect">Exam Group</Label>
                    <Select 
                        value={selectedGroup} 
                        onValueChange={(value) => {
                            setSelectedGroup(value);
                            setSelectedSchedule('');
                        }}
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

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="examSelect">Exam</Label>
                    <Select 
                        value={selectedSchedule} 
                        onValueChange={setSelectedSchedule}
                        disabled={!selectedGroup}
                    >
                        <SelectTrigger id="examSelect">
                            <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent>
                            {schedules.map(schedule => (
                                <SelectItem key={schedule._id} value={schedule._id}>
                                    {schedule.class?.sclassName} - {schedule.subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            {currentSchedule && (
                <div className="mt-6 flex flex-wrap gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">Subject:</span>
                        <span className="font-medium text-foreground">{currentSchedule.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">Total Marks:</span>
                        <span className="font-medium text-foreground">{currentSchedule.totalMarks}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">Passing:</span>
                        <span className="font-medium text-foreground">{currentSchedule.passingMarks}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">Date:</span>
                <span className="font-medium text-foreground">{formatDateTime(currentSchedule.examDate, { dateOnly: true })}</span>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      {selectedSchedule && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Student Results</CardTitle>
                    <CardDescription>
                        Managing results for {students.length} students
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No students found for this class.</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => {
                                const result = getStudentResult(student._id);
                                return (
                                    <TableRow key={student._id}>
                                    <TableCell className="font-medium hover:underline cursor-pointer text-primary" onClick={(e) => handleNameClick(e, student._id)}>{student.name}</TableCell>
                                    <TableCell>{student.rollNum}</TableCell>
                                        <TableCell>
                                            {result ? (
                                                <span className="font-semibold">
                                                  {result.marksObtained}/{currentSchedule.totalMarks}
                                                </span>
                                              ) : (
                                                <span className="text-muted-foreground italic">Not entered</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {result ? (
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                    <span>{result.percentage}%</span>
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {result && result.grade ? (
                                                <Badge variant="secondary">{result.grade}</Badge>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {result ? (
                                                <StatusBadge status={result.status} />
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {result ? (
                                                <Button size="sm" variant="ghost" onClick={() => handleEditResult(result, student)}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => handleAddResult(student)}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingResult ? 'Edit Result' : 'Add Result'}</DialogTitle>
                    <DialogDescription>
                        {selectedStudent.name} (Roll: {selectedStudent.rollNum})
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Total Marks</Label>
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                                {currentSchedule?.totalMarks}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="marksObtained">Marks Obtained *</Label>
                            <Input
                                id="marksObtained"
                                name="marksObtained"
                                type="number"
                                value={formData.marksObtained}
                                onChange={handleInputChange}
                                min="0"
                                max={currentSchedule?.totalMarks}
                                step="0.5"
                                placeholder="Enter marks"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pass">Pass</SelectItem>
                                <SelectItem value="Fail">Fail</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            placeholder="Optional remarks"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>{editingResult ? 'Update Result' : 'Save Result'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExamResult;

