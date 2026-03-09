import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

import { 
    Button 
} from "@/components/ui/button";
import { 
    Input 
} from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Wallet, 
    Calculator, 
    Banknote, 
    CreditCard, 
    CheckCircle2, 
    Clock, 
    Search,
    Edit,
    AlertCircle
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthPicker } from "@/components/ui/MonthPicker";


const API_BASE = API_URL;

const StaffPayrollPage = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    // Set default month to current month (YYYY-MM)
    const [monthYear, setMonthYear] = useState(format(new Date(), 'yyyy-MM'));
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Edit form state
    const [allowances, setAllowances] = useState('');
    const [deductions, setDeductions] = useState('');

    // Pay form state
    const [paymentMethod, setPaymentMethod] = useState('');

    const fetchPayrolls = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Payroll/List/${currentUser._id}/${monthYear}`);
            setPayrolls(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch payroll data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthYear, currentUser]);

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const res = await axios.post(`${API_BASE}/Payroll/Generate`, {
                school: currentUser._id,
                monthYear
            });
            
            if (res.data.count > 0) {
                showToast(`Generated ${res.data.count} new payroll records for this month.`, "success");
                fetchPayrolls();
            } else {
                showToast("Payroll already exists for all staff this month.", "info");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to generate payroll", "error");
        } finally {
            setGenerating(false);
        }
    };

    // --- Edit Modal Actions ---
    const openEditModal = (payroll) => {
        setSelectedPayroll(payroll);
        setAllowances(payroll.allowances.toString());
        setDeductions(payroll.deductions.toString());
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            setProcessing(true);
            await axios.put(`${API_BASE}/Payroll/Update/${selectedPayroll._id}`, {
                allowances: Number(allowances) || 0,
                deductions: Number(deductions) || 0
            });
            showToast("Payroll updated successfully", "success");
            setEditModalOpen(false);
            fetchPayrolls();
        } catch (error) {
            console.error(error);
            showToast("Failed to update payroll", "error");
        } finally {
            setProcessing(false);
        }
    };

    // --- Pay Modal Actions ---
    const openPayModal = (payroll) => {
        setSelectedPayroll(payroll);
        setPaymentMethod('');
        setPayModalOpen(true);
    };

    const handleProcessPayment = async () => {
        if (!paymentMethod) {
            showToast("Please select a payment method", "error");
            return;
        }

        try {
            setProcessing(true);
            await axios.put(`${API_BASE}/Payroll/Pay/${selectedPayroll._id}`, {
                paymentMethod
            });
            showToast("Payment processed successfully", "success");
            setPayModalOpen(false);
            fetchPayrolls();
        } catch (error) {
            console.error(error);
            showToast("Failed to process payment", "error");
        } finally {
            setProcessing(false);
        }
    };

    // Filters and Stats
    const filteredPayrolls = payrolls.filter(p => 
        p.staffId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.staffId?.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCalculated = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const totalPaid = payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const pendingCount = payrolls.filter(p => p.status === 'Pending').length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Payroll</h2>
                    <p className="text-muted-foreground">Manage monthly salaries, allowances, and payments</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <Label htmlFor="month" className="ml-2">Select Month:</Label>
                    <MonthPicker 
                        value={monthYear} 
                        onChange={(val) => setMonthYear(val)}
                        className="w-[180px] h-9"
                    />

                    <Button 
                        onClick={handleGenerate} 
                        disabled={generating}
                        variant="default"
                    >
                        {generating ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                        Generate Payroll
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Payroll ({format(new Date(monthYear + '-01'), 'MMMM yyyy')})</p>
                            <p className="text-3xl font-bold">Rs. {totalCalculated.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Paid</p>
                            <p className="text-3xl font-bold text-emerald-600">Rs. {totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Staff</p>
                            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                        </div>
                        <div className="h-12 w-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Payroll Details</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-[250px] h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : payrolls.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <Wallet className="h-12 w-12 mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium text-foreground">No Payroll Records Found</p>
                            <p className="max-w-sm mt-2">Click "Generate Payroll" above to create initial records for all staff for the selected month.</p>
                        </div>
                    ) : filteredPayrolls.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No matching staff found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="pl-6">Staff Details</TableHead>
                                    <TableHead className="text-right">Basic</TableHead>
                                    <TableHead className="text-right text-emerald-600">+ Allowances</TableHead>
                                    <TableHead className="text-right text-red-600">- Deductions</TableHead>
                                    <TableHead className="text-right font-bold">= Net Salary</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayrolls.map((payroll) => (
                                    <TableRow key={payroll._id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <div className="font-medium">{payroll.staffId?.name || 'Unknown Staff'}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Badge variant="outline" className="font-normal capitalize mt-1">
                                                    {payroll.staffId?.role || payroll.staffId?.designation}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">Rs. {payroll.basicSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-emerald-600">
                                            {payroll.allowances > 0 ? `Rs. ${payroll.allowances.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {payroll.deductions > 0 ? `Rs. ${payroll.deductions.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-base">Rs. {payroll.netSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            {payroll.status === 'Paid' ? (
                                                <div className="flex flex-col items-center">
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>
                                                    <span className="text-[10px] text-muted-foreground mt-1">{format(new Date(payroll.paidDate), 'dd MMM, yy')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{payroll.paymentMethod}</span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-50">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {payroll.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(payroll)} title="Edit Allowances/Deductions">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => openPayModal(payroll)}>
                                                        <Banknote className="mr-2 h-4 w-4" /> Pay
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="sm" disabled className="opacity-50">
                                                    Settled
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal (Allowances / Deductions) */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Payroll details</DialogTitle>
                        <DialogDescription>
                            Adjust allowances and deductions for {selectedPayroll?.staffId?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Basic Salary</span>
                            <span className="font-bold">Rs. {selectedPayroll?.basicSalary?.toLocaleString()}</span>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="allowances">Allowances (Bonus, etc.)</Label>
                            <Input 
                                id="allowances" 
                                type="number" 
                                value={allowances}
                                onChange={(e) => setAllowances(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="deductions">Deductions (Unpaid leave, etc.)</Label>
                            <Input 
                                id="deductions" 
                                type="number" 
                                value={deductions}
                                onChange={(e) => setDeductions(e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="flex justify-between items-center p-3 border-t mt-2">
                            <span className="text-sm font-bold">New Net Salary</span>
                            <span className="text-lg font-bold text-primary">
                                Rs. {(
                                    (selectedPayroll?.basicSalary || 0) + 
                                    (Number(allowances) || 0) - 
                                    (Number(deductions) || 0)
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={processing}>
                            {processing ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pay Modal */}
            <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                        <DialogDescription>
                            Confirm payment for {selectedPayroll?.staffId?.name} for {format(new Date(monthYear + '-01'), 'MMMM yyyy')}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6">
                        <Alert className="bg-emerald-50 border-emerald-200 mb-6">
                            <AlertCircle className="h-4 w-4 text-emerald-600" />
                            <AlertDescription className="text-emerald-800 font-medium ml-2">
                                Net Payable: Rs. {selectedPayroll?.netSalary?.toLocaleString()}
                            </AlertDescription>
                        </Alert>

                        <div className="grid gap-3">
                            <Label>Select Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash"><div className="flex items-center"><Banknote className="mr-2 h-4 w-4 text-emerald-600"/> Cash</div></SelectItem>
                                    <SelectItem value="Bank Transfer"><div className="flex items-center"><Wallet className="mr-2 h-4 w-4 text-blue-600"/> Bank Transfer</div></SelectItem>
                                    <SelectItem value="Cheque"><div className="flex items-center"><CreditCard className="mr-2 h-4 w-4 text-purple-600"/> Cheque</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleProcessPayment} disabled={processing || !paymentMethod}>
                            {processing ? "Processing..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StaffPayrollPage;
