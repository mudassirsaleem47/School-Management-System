import React, { useState, useEffect } from 'react';
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  DollarSign,
  TrendingUp, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  AlertCircle,
  MoreVertical,
  Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import ConfirmDeleteModal from '../components/form-popup/ConfirmDeleteModal';
import { TablePagination } from '../components/TablePagination';
import { Checkbox } from '@/components/ui/checkbox';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const FeeManagement = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [statistics, setStatistics] = useState({
    pendingFees: { amount: 0, count: 0 },
    todayCollection: { amount: 0, count: 0 },
    monthlyCollection: { amount: 0, count: 0 }
  });
  
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  
  const [formData, setFormData] = useState({
    feeName: '',
    feeType: 'Tuition',
    amount: '',
    academicYear: new Date().getFullYear().toString(),
    frequency: 'Monthly',
    month: '',
    dueDate: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const [searchTerm, setSearchTerm] = useState('');

  const feeTypes = ['Tuition', 'Transport', 'Library', 'Sports', 'Lab', 'Exam', 'Uniform', 'Other'];

  useEffect(() => {
    setSelectedFees([]);
  }, [searchTerm]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, structuresRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/FeeStatistics/${currentUser._id}`),
        axios.get(`${API_BASE}/FeeStructures/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);

      setStatistics(statsRes.data || {
        pendingFees: { amount: 0, count: 0 },
        todayCollection: { amount: 0, count: 0 },
        monthlyCollection: { amount: 0, count: 0 }
      });
      setFeeStructures(Array.isArray(structuresRes.data) ? structuresRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Fee Management Error:', error);
      showToast(error.response?.data?.message || 'Error fetching data', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Explicit validation for required fields
    const newErrors = {};
    if (!formData.feeName) newErrors.feeName = 'Fee Name is required';
    if (!formData.feeType) newErrors.feeType = 'Fee Type is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due Date is required';
    if (formData.frequency === 'Monthly' && !formData.month) newErrors.month = 'Month is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        school: currentUser._id,
        amount: parseFloat(formData.amount)
      };

      if (editingFee) {
        await axios.put(`${API_BASE}/FeeStructure/${editingFee._id}`, payload);
        showToast('Fee structure updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/FeeStructureCreate`, payload);
        showToast('Fee structure created successfully!', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving fee structure', 'error');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      feeName: fee.feeName,
      feeType: fee.feeType,
      amount: fee.amount.toString(),
      academicYear: fee.academicYear,
      frequency: fee.frequency || 'Monthly',
      month: fee.month || '',
      dueDate: fee.dueDate ? fee.dueDate.split('T')[0] : '',
      description: fee.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setFeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    
    try {
      await axios.delete(`${API_BASE}/FeeStructure/${feeToDelete}`);
      showToast('Fee structure deleted successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting fee structure', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setFeeToDelete(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFees.length === currentFees.length) {
      setSelectedFees([]);
    } else {
      setSelectedFees(currentFees.map(f => f._id));
    }
  };

  const toggleSelectFee = (id) => {
    if (selectedFees.includes(id)) {
      setSelectedFees(selectedFees.filter(fid => fid !== id));
    } else {
      setSelectedFees([...selectedFees, id]);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedFees.length === 0) return;
    try {
      setIsDeletingBulk(true);
      await Promise.all(selectedFees.map(id => axios.delete(`${API_BASE}/FeeStructure/${id}`)));
      showToast(`${selectedFees.length} fee structure(s) deleted successfully!`, 'success');
      setSelectedFees([]);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting some fee structures', 'error');
    } finally {
      setIsDeletingBulk(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({
      feeName: '',
      feeType: 'Tuition',
      amount: '',
      academicYear: new Date().getFullYear().toString(),
      frequency: 'Monthly',
      month: '',
      dueDate: '',
      description: ''
    });
    setEditingFee(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const filteredFees = feeStructures.filter(fee =>
    fee.feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-3xl font-bold tracking-tight">Fee Management</h2>
          <p className="text-muted-foreground mt-2">Manage fee structures and monitor collections</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Create Fee Structure
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(statistics?.pendingFees?.amount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics?.pendingFees?.count || 0} students pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Collection</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(statistics?.todayCollection?.amount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics?.todayCollection?.count || 0} transactions today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Collection</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(statistics?.monthlyCollection?.amount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics?.monthlyCollection?.count || 0} transactions this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Fee Structures</CardTitle>
            <CardDescription>All defined fee types and amounts</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            {selectedFees.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedFees.length})
              </Button>
            )}
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fees..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No fee structures found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedFees.length === filteredFees.length && filteredFees.length > 0} 
                          onCheckedChange={toggleSelectAll} 
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Fee Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFees.map((fee) => (
                      <TableRow key={fee._id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedFees.includes(fee._id)} 
                            onCheckedChange={() => toggleSelectFee(fee._id)} 
                            aria-label="Select fee"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{fee.feeName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {fee.feeType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span>{fee.frequency}</span>
                                    {fee.month && <span className="text-xs text-muted-foreground">{fee.month}</span>}
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold">Rs. {fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{formatDateTime(fee.dueDate, { dateOnly: true })}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEdit(fee)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(fee._id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit Fee Structure' : 'Create Fee Structure'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the fee. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
            
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Name *</Label>
                <Input
                  value={formData.feeName}
                  onChange={(e) => handleInputChange('feeName', e.target.value)}
                  placeholder="e.g. Tuition Fee"
                  required
                />
                {errors.feeName && <p className="text-xs text-destructive">{errors.feeName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Fee Type *</Label>
                <Select
                  value={formData.feeType}
                  onValueChange={(val) => handleInputChange('feeType', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.feeType && <p className="text-xs text-destructive">{errors.feeType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Amount (Rs.) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  required
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(val) => handleInputChange('frequency', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                    <SelectItem value="One-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.frequency === 'Monthly' && (
                <div className="space-y-2">
                  <Label>Month *</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(val) => handleInputChange('month', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.month && <p className="text-xs text-destructive">{errors.month}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <DatePicker
                  value={formData.dueDate}
                  onChange={(val) => handleInputChange('dueDate', val)}
                  placeholder="Select due date"
                  required
                />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Input
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  required
                />
                {errors.academicYear && <p className="text-xs text-destructive">{errors.academicYear}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional details..."
              />
            </div>



            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">
                {editingFee ? 'Update Fee' : 'Create Fee'}
              </Button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Fee Structure?"
        description="Are you sure you want to delete this fee structure? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedFees.length} Fee Structures?`}
        description="Are you sure you want to delete the selected fee structures? This action cannot be undone."
        confirmText={isDeletingBulk ? "Deleting..." : "Delete Selected"}
      />
    </div>
  );
};

export default FeeManagement;
