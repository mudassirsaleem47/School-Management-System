import React, { useState, useEffect, useMemo } from 'react';
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import {
  Printer,
  RotateCcw,
  User,
  Phone,
  Hash,
  GraduationCap,
  AlertCircle,
  Clock,
  CreditCard,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Wallet,
  CornerDownRight,
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
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import API_URL from '@/config/api';
const API_BASE = API_URL;

/* ─── helpers ─── */
const fmt = (n) => Number(n || 0).toLocaleString('en-PK');

const StatusBadge = ({ status }) => {
  const map = {
    Paid:    { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Paid' },
    Pending: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',       label: 'Unpaid' },
    Partial: { cls: 'bg-blue-100 text-blue-700 border border-blue-200',          label: 'Partial' },
    Overdue: { cls: 'bg-red-100 text-red-700 border border-red-200',             label: 'Overdue' },
  };
  const cfg = map[status] || { cls: 'bg-secondary', label: status };
  return <Badge className={`${cfg.cls} hover:opacity-90 text-[11px] font-medium`}>{cfg.label}</Badge>;
};

const TxnStatusBadge = ({ status }) =>
  status === 'Reverted' ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
      ↺ Reverted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
      ✓ Active
    </span>
  );

/* ════════════════════════════════════════ */
const StudentFeeDetail = () => {
  const { studentId } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { setExtraBreadcrumb } = useOutletContext() || {};

  const [student, setStudent]           = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [fees, setFees]                 = useState([]);
  const [loadingFees, setLoadingFees]   = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedFees, setSelectedFees] = useState(new Set());
  const [revertConfirm, setRevertConfirm] = useState(null);
  const [reverting, setReverting]       = useState(false);

  /* pay modal */
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee]   = useState(null);
  const [paying, setPaying]             = useState(false);
  const [paymentForm, setPaymentForm]   = useState({
    amount: '', discount: '', paymentMethod: 'Cash',
    chequeNumber: '', bankName: '', transactionReference: '', remarks: '',
  });

  /* receipt modal */
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const paymentMethods = ['Cash', 'Online', 'Cheque', 'Card', 'Bank Transfer'];

  /* ── fetch student ── */
  useEffect(() => {
    if (!studentId) return;
    axios.get(`${API_BASE}/Student/${studentId}`)
      .then((r) => {
        setStudent(r.data);
        if (setExtraBreadcrumb) setExtraBreadcrumb(r.data?.name);
      })
      .catch(() => showToast('Failed to load student information', 'error'))
      .finally(() => setLoadingStudent(false));
  }, [studentId]);

  /* ── fetch fees ── */
  const fetchFees = () => {
    if (!studentId) return;
    setLoadingFees(true);
    axios.get(`${API_BASE}/StudentFees/${studentId}`)
      .then((r) => setFees(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast('Failed to load fee records', 'error'))
      .finally(() => setLoadingFees(false));
  };
  useEffect(() => { fetchFees(); }, [studentId]);

  /* ── fetch transactions ── */
  const fetchTxns = () => {
    if (!currentUser) return;
    const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
    axios.get(`${API_BASE}/FeeTransactions/${schoolId}`)
      .then((r) => setTransactions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };
  useEffect(() => { fetchTxns(); }, [currentUser]);

  /* ── totals ── */
  const totals = useMemo(() =>
    fees.reduce(
      (acc, f) => ({ total: acc.total + (f.totalAmount || 0), paid: acc.paid + (f.paidAmount || 0), balance: acc.balance + (f.pendingAmount || 0) }),
      { total: 0, paid: 0, balance: 0 }
    ), [fees]);

  /* ── pay modal ── */
  const openPayModal = (fee) => {
    if (fee.status === 'Paid') return;
    setSelectedFee(fee);
    setPaymentForm((p) => ({ ...p, amount: fee.pendingAmount.toString(), discount: '' }));
    setPayModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const discount   = parseFloat(paymentForm.discount) || 0;
    const netPayable = selectedFee.pendingAmount - discount;
    const amount     = parseFloat(paymentForm.amount);
    if (discount < 0 || discount >= selectedFee.pendingAmount) {
      showToast(`Invalid discount. Max: Rs.${selectedFee.pendingAmount - 1}`, 'error'); return;
    }
    if (!amount || amount <= 0 || amount > netPayable) {
      showToast(`Invalid amount. Max payable after discount: Rs.${netPayable}`, 'error'); return;
    }
    try {
      setPaying(true);
      const res = await axios.post(`${API_BASE}/CollectFee`, {
        feeId: selectedFee._id, amount,
        paymentMethod: paymentForm.paymentMethod,
        collectedBy: currentUser._id,
        chequeNumber: paymentForm.chequeNumber, bankName: paymentForm.bankName,
        transactionReference: paymentForm.transactionReference,
        remarks: paymentForm.remarks + (discount > 0 ? ` [Discount: Rs.${discount}]` : ''),
      });
      showToast('Payment collected successfully!', 'success');
      const rcRes = await axios.get(`${API_BASE}/FeeReceipt/${res.data.transaction._id}`);
      setReceiptData({ ...rcRes.data, discountApplied: discount });
      setPayModalOpen(false);
      setReceiptOpen(true);
      fetchFees(); fetchTxns();
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment error', 'error');
    } finally { setPaying(false); }
  };

  const resetForm = () => {
    setPaymentForm({ amount: '', discount: '', paymentMethod: 'Cash', chequeNumber: '', bankName: '', transactionReference: '', remarks: '' });
    setSelectedFee(null);
  };


  /* ════════════ RENDER ════════════ */
  return (
    <div className="space-y-4">


        {/* ─── TOP ROW: Profile (left) + Stats (right) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Student Profile Card — left, takes 1 col */}
          <Card className="border shadow-sm lg:col-span-1">
            <CardContent className="py-4 px-5 h-full flex flex-col justify-center">
              {loadingStudent ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 flex-shrink-0 ring-2 ring-primary/20 ring-offset-2">
                    <AvatarImage src={student?.studentImage} />
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {student?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base leading-tight truncate">{student?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {`${student?.sclassName?.sclassName || ''} ${student?.section || ''}`.trim() || '—'}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        { label: 'Roll No',  value: student?.rollNum },
                        { label: 'Adm No',   value: student?.admissionNumber },
                        { label: 'Father',   value: student?.fatherName },
                        { label: 'Mobile',   value: student?.fatherMobile || student?.motherMobile },
                      ].map(({ label, value }) => (
                        <div key={label} className="min-w-0">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}: </span>
                          <span className="text-[11px] font-medium text-foreground truncate">{value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats — right, takes 2 cols */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Fees',  value: totals.total,   icon: BookOpen,     color: 'text-foreground',    bg: 'bg-slate-100 dark:bg-slate-800',    iconColor: 'text-slate-600 dark:text-slate-300' },
              { label: 'Total Paid',  value: totals.paid,    icon: TrendingUp,   color: 'text-emerald-600',   bg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600' },
              { label: 'Balance Due', value: totals.balance, icon: TrendingDown,
                color: totals.balance > 0 ? 'text-destructive' : 'text-emerald-600',
                bg: totals.balance > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/40',
                iconColor: totals.balance > 0 ? 'text-destructive' : 'text-emerald-600' },
            ].map(({ label, value, icon: Icon, color, bg, iconColor }) => (
              <Card key={label} className="border shadow-sm">
                <CardContent className="pt-4 pb-3 px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className={`text-xl font-bold mt-1 tabular-nums ${color}`}>
                        Rs {fmt(value)}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg flex-shrink-0 ${bg}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── FEE TABLE ─── */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Fee Records</CardTitle>
                <CardDescription>
                  {loadingStudent ? '' : `${student?.name}'s fee structure and payment history`}
                </CardDescription>
              </div>
              {selectedFees.size > 0 && (
                <Badge variant="secondary">{selectedFees.size} selected</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loadingFees ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : fees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted mb-3">
                  <AlertCircle className="h-8 w-8 opacity-40" />
                </div>
                <p className="font-semibold">No Fee Records</p>
                <p className="text-xs mt-1 text-center max-w-xs">No fees have been assigned to this student yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={selectedFees.size === fees.length && fees.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedFees(new Set(fees.map((f) => f._id)));
                            else setSelectedFees(new Set());
                          }}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase">Fees Group</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Due Date</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Status</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-right">Amount</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Payment ID</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Mode</TableHead>
                      <TableHead className="text-xs font-bold uppercase">Date</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-right">Discount</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-right">Paid</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-right">Balance</TableHead>
                      <TableHead className="text-xs font-bold uppercase text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => {
                      const isPaid    = fee.status === 'Paid';
                      const isOverdue = fee.status === 'Overdue';
                      const isSelected = selectedFees.has(fee._id);
                      const feeTxns   = transactions.filter(
                        (t) => t.fee?._id === fee._id || t.fee === fee._id
                      );

                      return (
                        <React.Fragment key={fee._id}>
                          {/* ── Main fee row ── */}
                          <TableRow
                            className={
                              isSelected
                                ? 'bg-primary/5 hover:bg-primary/10'
                                : isPaid
                                ? 'bg-emerald-50/50 hover:bg-emerald-50/80'
                                : isOverdue
                                ? 'bg-red-50/40 hover:bg-red-50/70'
                                : 'hover:bg-muted/30'
                            }
                          >
                            <TableCell className="pl-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const next = new Set(selectedFees);
                                  checked ? next.add(fee._id) : next.delete(fee._id);
                                  setSelectedFees(next);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="font-semibold text-sm">{fee.feeStructure?.feeName || 'N/A'}</span>
                                {fee.feeStructure?.feeType && (
                                  <span className="text-xs text-muted-foreground ml-1.5">({fee.feeStructure.feeType})</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={`text-xs whitespace-nowrap ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                              {fee.dueDate ? formatDateTime(fee.dueDate, { dateOnly: true }) : '—'}
                            </TableCell>
                            <TableCell><StatusBadge status={fee.status} /></TableCell>
                            <TableCell className="text-right font-semibold tabular-nums text-sm">
                              {fmt(fee.totalAmount)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">—</TableCell>
                            <TableCell className="text-xs text-muted-foreground">—</TableCell>
                            <TableCell className="text-xs text-muted-foreground">—</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground tabular-nums">0.00</TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-emerald-600 font-medium">
                              {fmt(fee.paidAmount)}
                            </TableCell>
                            <TableCell className={`text-right tabular-nums text-sm font-semibold ${fee.pendingAmount > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                              {fmt(fee.pendingAmount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                {!isPaid && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" variant="default" className="h-7 w-7 p-0" onClick={() => openPayModal(fee)}>
                                        +
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Collect Fee</TooltipContent>
                                  </Tooltip>
                                )}
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>

                          {/* ── Sub-rows: transactions ── */}
                          {feeTxns.map((txn, i) => {
                            const discountMatch = txn.remarks?.match(/\[Discount: Rs\.([\d.]+)\]/);
                            const discount = discountMatch ? parseFloat(discountMatch[1]) : 0;
                            return (
                              <TableRow key={txn._id || i} className="bg-muted/10 text-xs border-l-2 border-l-primary/40">
                                <TableCell className="pl-4" />
                                <TableCell className="text-muted-foreground pl-4">
                                  <span className="flex items-center gap-1.5">
                                    <CornerDownRight className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                                    <span className="font-mono">{txn.receiptNumber || `TXN-${i + 1}`}</span>
                                  </span>
                                </TableCell>
                                <TableCell />
                                <TableCell><TxnStatusBadge status={txn.status} /></TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{fmt(txn.amount)}</TableCell>
                                <TableCell className="font-mono text-muted-foreground">{txn.receiptNumber || txn._id?.slice(-6)}</TableCell>
                                <TableCell className="text-muted-foreground capitalize">{txn.paymentMethod || '—'}</TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                  {txn.paymentDate ? formatDateTime(txn.paymentDate, { dateOnly: true }) : '—'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-emerald-600">
                                  {discount > 0 ? fmt(discount) : '0.00'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-emerald-600 font-medium">{fmt(txn.amount)}</TableCell>
                                <TableCell className="text-right tabular-nums text-muted-foreground">—</TableCell>
                                <TableCell className="text-center">
                                  <TooltipProvider>
                                    <div className="flex items-center justify-center gap-1.5">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm" variant="outline" className="h-7 w-7 p-0"
                                            onClick={async () => {
                                              try {
                                                const res = await axios.get(`${API_BASE}/FeeReceipt/${txn._id}`);
                                                setReceiptData(res.data);
                                                setReceiptOpen(true);
                                              } catch { showToast('Failed to load receipt', 'error'); }
                                            }}
                                          >
                                            <Printer className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View Receipt</TooltipContent>
                                      </Tooltip>
                                      {txn.status !== 'Reverted' && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm" variant="outline"
                                              className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                              onClick={() => setRevertConfirm({ txnId: txn._id, receiptNum: txn.receiptNumber || txn._id?.slice(-6) })}
                                            >
                                              <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Revert Transaction</TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </TooltipProvider>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Grand Total Footer */}
          {!loadingFees && fees.length > 0 && (
            <CardFooter className="border-t bg-muted/20 py-3 px-5 flex flex-wrap gap-6 justify-end">
              {[
                { label: 'Total', value: totals.total,   cls: 'text-foreground' },
                { label: 'Paid',  value: totals.paid,    cls: 'text-emerald-600' },
                { label: 'Balance', value: totals.balance, cls: totals.balance > 0 ? 'text-destructive' : 'text-emerald-600' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className={`text-sm font-bold tabular-nums ${cls}`}>Rs {fmt(value)}</p>
                </div>
              ))}
            </CardFooter>
          )}
        </Card>

      {/* ═══════════ REVERT CONFIRM DIALOG ═══════════ */}
      <Dialog open={!!revertConfirm} onOpenChange={() => !reverting && setRevertConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-100">
                <RotateCcw className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Revert Transaction</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Receipt: <span className="font-mono font-semibold">{revertConfirm?.receiptNum}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-1">
            <p className="text-sm text-muted-foreground">
              This payment will be <strong>permanently deleted</strong> and the fee balance will be restored.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevertConfirm(null)} disabled={reverting}>Cancel</Button>
            <Button
              variant="destructive" disabled={reverting} className="gap-2"
              onClick={async () => {
                try {
                  setReverting(true);
                  await axios.delete(`${API_BASE}/RevertTransaction/${revertConfirm.txnId}`);
                  showToast('Transaction deleted and balance restored!', 'success');
                  setRevertConfirm(null);
                  fetchFees(); fetchTxns();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Revert failed', 'error');
                } finally { setReverting(false); }
              }}
            >
              {reverting
                ? <><Clock className="h-4 w-4 animate-spin" /> Reverting...</>
                : <><RotateCcw className="h-4 w-4" /> Confirm Revert</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ PAYMENT MODAL ═══════════ */}
      <Dialog open={payModalOpen} onOpenChange={(o) => { if (!o) { setPayModalOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Collect Payment</DialogTitle>
                {selectedFee && (
                  <DialogDescription>
                    {selectedFee.feeStructure?.feeName} — Pending:{' '}
                    <span className="font-semibold text-destructive">Rs.{fmt(selectedFee.pendingAmount)}</span>
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-1">

 {/* Amount */}
            <div className="space-y-1.5">
              <Label>Amount (Rs.) <span className="text-destructive">*</span></Label>
              <Input
                type="number" required min="1"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </div>
            
            {/* Custom Discount */}
            <div className="space-y-1.5">
              <Label>Custom Discount (Rs.)</Label>
              <Input
                type="number" min="0"
                placeholder="0"
                value={paymentForm.discount}
                onChange={(e) => {
                  const d = parseFloat(e.target.value) || 0;
                  const net = (selectedFee?.pendingAmount || 0) - d;
                  setPaymentForm((p) => ({
                    ...p, discount: e.target.value,
                    amount: net > 0 ? net.toString() : p.amount,
                  }));
                }}
              />
              {paymentForm.discount && (
                <p className="text-xs text-muted-foreground">
                  Net payable after discount: <strong>Rs.{fmt((selectedFee?.pendingAmount || 0) - (parseFloat(paymentForm.discount) || 0))}</strong>
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(v) => setPaymentForm((p) => ({ ...p, paymentMethod: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Cheque / Bank fields */}
            {paymentForm.paymentMethod === 'Cheque' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cheque Number</Label>
                  <Input value={paymentForm.chequeNumber} onChange={(e) => setPaymentForm((p) => ({ ...p, chequeNumber: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name</Label>
                  <Input value={paymentForm.bankName} onChange={(e) => setPaymentForm((p) => ({ ...p, bankName: e.target.value }))} />
                </div>
              </div>
            )}
            {['Online', 'Bank Transfer', 'Card'].includes(paymentForm.paymentMethod) && (
              <div className="space-y-1.5">
                <Label>Transaction Reference</Label>
                <Input value={paymentForm.transactionReference} onChange={(e) => setPaymentForm((p) => ({ ...p, transactionReference: e.target.value }))} />
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea rows={2} className="resize-none" value={paymentForm.remarks} onChange={(e) => setPaymentForm((p) => ({ ...p, remarks: e.target.value }))} />
            </div>

            <DialogFooter className="pt-1">
              <Button type="button" variant="outline" onClick={() => { setPayModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={paying} className="gap-2">
                {paying ? <><Clock className="h-4 w-4 animate-spin" /> Processing...</> : <><Wallet className="h-4 w-4" /> Collect Payment</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ RECEIPT MODAL ═══════════ */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-100">
                <Printer className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <DialogTitle>Payment Receipt</DialogTitle>
                <DialogDescription>Transaction confirmed</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {receiptData && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
                {[
                  { label: 'Receipt No.',    value: receiptData.receiptNumber },
                  { label: 'Student',        value: receiptData.student?.name },
                  { label: 'Fee',            value: receiptData.fee?.feeStructure?.feeName },
                  { label: 'Amount Paid',    value: `Rs. ${fmt(receiptData.amount)}` },
                  { label: 'Payment Method', value: receiptData.paymentMethod },
                  { label: 'Date',           value: receiptData.paymentDate ? formatDateTime(receiptData.paymentDate) : '—' },
                  { label: 'Collected By',   value: receiptData.collectedBy?.name },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ) : null)}

                {receiptData.discountApplied > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span className="font-medium">- Rs. {fmt(receiptData.discountApplied)}</span>
                  </div>
                )}

                {receiptData.fee && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Remaining Balance</span>
                      <span className={receiptData.fee.pendingAmount > 0 ? 'text-destructive' : 'text-emerald-600'}>
                        Rs. {fmt(receiptData.fee.pendingAmount)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-xs text-muted-foreground py-1">
                Thank you for your payment!
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>Close</Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StudentFeeDetail;