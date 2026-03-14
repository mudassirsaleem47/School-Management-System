import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  Users, 
  DollarSign, 
  CheckSquare,
  Square,
  User,
  Filter,
  CheckCircle2,
  CalendarDays,
  CreditCard,
  Search,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const FeeAssignment = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [feeStructures, setFeeStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFeeStructures, setSelectedFeeStructures] = useState([]);
  const [assignmentMode, setAssignmentMode] = useState('individual');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [feeSearch, setFeeSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    filterStudents();
  }, [selectedClass, selectedSection, students, studentSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feeStructuresRes, studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/FeeStructures/${currentUser._id}`),
        axios.get(`${API_BASE}/Students/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);
      
      setFeeStructures(Array.isArray(feeStructuresRes.data) ? feeStructuresRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      showToast('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const filteredFees = feeStructures.filter(f =>
    f.feeName.toLowerCase().includes(feeSearch.toLowerCase()) ||
    f.feeType.toLowerCase().includes(feeSearch.toLowerCase())
  );

  const filterStudents = () => {
    let filtered = students;
    
    if (selectedClass && selectedClass !== 'all') {
      filtered = filtered.filter(s => s.sclassName?._id === selectedClass);
    }
    
    if (selectedSection && selectedSection !== 'all') {
      filtered = filtered.filter(s => s.section === selectedSection);
    }
    
    if (studentSearch) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNum.toString().includes(studentSearch)
      );
    }

    setFilteredStudents(filtered);
  };

  const getSectionsForClass = (classId) => {
    const selectedClassData = classes.find(c => c._id === classId);
    return selectedClassData?.sections || [];
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleFeeStructureSelection = (feeId) => {
    setSelectedFeeStructures((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  // Calculate Totals
  const selectedFeeItems = feeStructures.filter(f => selectedFeeStructures.includes(f._id));
  const feeAmount = selectedFeeItems.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
  const studentCount = assignmentMode === 'class'
    ? filteredStudents.length
    : selectedStudents.length;
  const totalProjected = feeAmount * studentCount;

  const handleAssignFees = async () => {
    if (selectedFeeStructures.length === 0) {
      showToast('Please select at least one fee structure', 'error');
      return;
    }

    let studentIds = [];

    if (assignmentMode === 'individual' || assignmentMode === 'bulk') {
      if (selectedStudents.length === 0) {
        showToast('Please select at least one student', 'error');
        return;
      }
      studentIds = selectedStudents;
    } else if (assignmentMode === 'class') {
      if (!selectedClass || selectedClass === 'all') {
        showToast('Please select a class', 'error');
        return;
      }
      studentIds = filteredStudents.map(s => s._id);
      
      if (studentIds.length === 0) {
        showToast('No students found in selected class/section', 'error');
        return;
      }
    }

    try {
      const assignmentResults = await Promise.all(
        selectedFeeStructures.map(async (feeStructureId) => {
          try {
            const response = await axios.post(`${API_BASE}/AssignFee`, {
              feeStructureId,
              studentIds,
              school: currentUser._id
            });
            return { ok: true, data: response.data };
          } catch (error) {
            return {
              ok: false,
              message: error.response?.data?.message || 'Error assigning one of the selected fee structures'
            };
          }
        })
      );

      const successResults = assignmentResults.filter(result => result.ok);
      const failedResults = assignmentResults.filter(result => !result.ok);
      const totalAssigned = successResults.reduce((sum, result) => sum + (result.data?.assignedFees?.length || 0), 0);
      const duplicateCount = successResults.reduce((sum, result) => sum + (result.data?.errors?.length || 0), 0);

      if (successResults.length > 0) {
        showToast(`Assigned ${selectedFeeStructures.length - failedResults.length} fee structure(s) to ${studentIds.length} student(s). Total created entries: ${totalAssigned}.`, 'success');
      }

      if (duplicateCount > 0) {
        showToast(`${duplicateCount} assignment(s) skipped because fee already existed.`, 'warning');
      }

      if (failedResults.length > 0) {
        showToast(`${failedResults.length} fee structure assignment(s) failed.`, 'error');
      }

      setSelectedStudents([]);
      setSelectedFeeStructures([]);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error assigning fees', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assign Fees</h2>
          <p className="text-muted-foreground mt-2">Assign fee structures to students individually or by class</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Fee Structure Selection */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-muted/40 pb-4 border-b space-y-3">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Fee Structure
                </CardTitle>
                <CardDescription>Select one or more fee structures to assign</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fees..."
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-300px)] lg:h-[600px] p-4">
                <div className="space-y-3">
                  {filteredFees.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No fee structures found</p>
                    </div>
                  ) : (
                      filteredFees.map((fee) => (
                        <div
                          key={fee._id}
                          onClick={() => toggleFeeStructureSelection(fee._id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedFeeStructures.includes(fee._id)
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                            : 'border-transparent bg-card hover:bg-accent/50'
                            }`}
                        >
                          {/* Fee Name + Type Badge */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={selectedFeeStructures.includes(fee._id)}
                                onCheckedChange={() => toggleFeeStructureSelection(fee._id)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5"
                              />
                              <h3 className={`font-semibold text-sm ${selectedFeeStructures.includes(fee._id) ? 'text-primary' : 'text-foreground'}`}>
                                {fee.feeName}
                              </h3>
                            </div>
                            <Badge variant={selectedFeeStructures.includes(fee._id) ? 'default' : 'secondary'} className="ml-2 shrink-0">
                              {fee.feeType}
                            </Badge>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-3">
                            {/* Class */}
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{fee.class?.sclassName || 'All Classes'}</span>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{formatDateTime(fee.dueDate, { dateOnly: true }) || '-'}</span>
                            </div>

                            {/* Frequency */}
                            <div className="flex items-center gap-1.5">
                              <Filter className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{fee.frequency || '-'}</span>
                            </div>

                            {/* Month */}
                            {fee.month ? (
                              <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 shrink-0 text-center font-bold text-[10px] leading-none border rounded px-0.5">M</span>
                                <span className="truncate font-medium text-foreground">{fee.month}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 opacity-40">
                                <span className="w-3.5 h-3.5 shrink-0 text-center font-bold text-[10px] leading-none border rounded px-0.5">M</span>
                                <span>—</span>
                              </div>
                            )}

                            {/* Academic Year */}
                            {fee.academicYear && (
                              <div className="flex items-center gap-1.5 col-span-2">
                                <Building className="w-3.5 h-3.5 shrink-0" />
                                <span>Year: <strong className="text-foreground">{fee.academicYear}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {fee.description && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-3 leading-relaxed">
                              {fee.description}
                            </p>
                          )}

                          {/* Amount Row */}
                          <div className="pt-2 border-t flex justify-between items-center">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</span>
                            <span className="font-bold text-lg text-primary">
                              Rs. {fee.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Student Selection */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Select Students
                </CardTitle>

                <Tabs value={assignmentMode} onValueChange={setAssignmentMode} className="w-full md:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="individual" onClick={() => setSelectedStudents([])}>Individual</TabsTrigger>
                    <TabsTrigger value="class" onClick={() => setSelectedStudents([])}>By Class</TabsTrigger>
                    <TabsTrigger value="bulk" onClick={() => setSelectedStudents([])}>Bulk Select</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass || 'all'} onValueChange={(val) => {
                    setSelectedClass(val);
                    setSelectedSection('all');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={selectedSection || 'all'}
                    onValueChange={setSelectedSection}
                    disabled={!selectedClass || selectedClass === 'all'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {selectedClass && selectedClass !== 'all' && getSectionsForClass(selectedClass).map(section => (
                        <SelectItem key={section.sectionName} value={section.sectionName}>
                          {section.sectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search Students</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Name or Roll No..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Mode Specific Content */}
              <div className="flex-1">
                {assignmentMode === 'class' ? (
                  <div className="space-y-4">
                    {/* Impact Summary Card */}
                    <div className="bg-muted/30 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-3 bg-primary/10 rounded-lg shadow-sm text-primary">
                          <Building className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Class Impact Summary</h3>
                          <p className="text-muted-foreground text-sm">Review the scope before assignment</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                        <div className="bg-card p-4 rounded-lg border shadow-sm">
                          <p className="text-sm text-muted-foreground mb-1">Target Students</p>
                          <p className="text-2xl font-bold text-foreground">{filteredStudents.length}</p>
                        </div>
                        <div className="bg-card p-4 rounded-lg border shadow-sm">
                          <p className="text-sm text-muted-foreground mb-1">Fee Per Student</p>
                          <p className="text-2xl font-bold text-foreground">
                            Rs. {feeAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-card p-4 rounded-lg border border-primary/20 shadow-sm ring-1 ring-primary/5">
                          <p className="text-sm text-primary font-medium mb-1">Total Projected</p>
                          <p className="text-2xl font-bold text-primary">
                            Rs. {totalProjected.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preview List */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Included Students ({filteredStudents.length})
                      </h4>
                      {filteredStudents.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl">
                          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-muted-foreground">No students match current filters</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px] border rounded-lg bg-muted/10">
                          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredStudents.map(student => (
                              <div key={student._id} className="flex items-center gap-2 text-sm bg-background p-2 rounded border shadow-sm">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate">{student.name}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {assignmentMode === 'bulk' && (
                        <div className="flex items-center justify-between mb-4 bg-muted/30 p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                              onCheckedChange={selectAllStudents}
                              id="select-all"
                            />
                            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                              Select All {filteredStudents.length} Students
                            </label>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {selectedStudents.length} selected
                          </Badge>
                        </div>
                      )}

                      {assignmentMode === 'individual' && filteredStudents.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Select students from the list below:
                        </p>
                      )}

                      <ScrollArea className="h-[400px] border rounded-md shadow-inner bg-muted/5">
                        {filteredStudents.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Search className="w-12 h-12 opacity-20 mb-2" />
                            <p>No students found matching your search</p>
                          </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                              {filteredStudents.map((student) => (
                                <div
                                  key={student._id}
                                  onClick={() => toggleStudentSelection(student._id)}
                                  className={`
                                      relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent group
                                      ${selectedStudents.includes(student._id)
                                      ? 'border-primary bg-primary/5 shadow-sm'
                                      : 'border-muted bg-background hover:border-primary/50'}
                                  `}
                                >
                                  <div className={`
                                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                      ${selectedStudents.includes(student._id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'}
                                  `}>
                                    {selectedStudents.includes(student._id) ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-foreground truncate">{student.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                      Roll: {student.rollNum} • {student.sclassName?.sclassName}-{student.section}
                                    </div>
                                  </div>
                                  {selectedStudents.includes(student._id) && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                              ))}
                            </div>
                        )}
                    </ScrollArea>
                  </>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-background">
                  {selectedFeeStructures.length} fee structure(s) selected • Total Projected Amount: Rs. {totalProjected.toLocaleString()}
                </Badge>
              </div>
              <Button
                onClick={handleAssignFees} 
                disabled={selectedFeeStructures.length === 0 || (assignmentMode !== 'class' && selectedStudents.length === 0) || (assignmentMode === 'class' && filteredStudents.length === 0)}
                size="lg"
                className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-primary/25 transition-all font-semibold"
              >
                <DollarSign className="w-4 h-4" />
                Assign Fee{selectedFeeStructures.length > 1 ? 's' : ''} to {
                  assignmentMode === 'class' 
                    ? `${filteredStudents.length} Students`
                    : `${selectedStudents.length} Selected`
                }
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeeAssignment;
