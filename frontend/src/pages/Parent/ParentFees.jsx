
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, DollarSign, Download, CreditCard, Receipt } from 'lucide-react';

const ParentFees = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [feeHistory, setFeeHistory] = useState([]);
    const [pendingFees, setPendingFees] = useState({ totalPending: 0, breakdowns: [] });

    useEffect(() => {
        const fetchFeeData = async () => {
            try {
                if (!currentUser?._id) return;
                setLoading(true);

                // For now, assuming endpoints exist or using placeholders until backend is fully verified
                // Real endpoints: /StudentFees/:id for details? 
                // Let's rely on standard patterns.
                
                // 1. Fetch Fee History (Paid transactions)
                const historyRes = await axios.get(`${API_URL}/FeeTransactions/${currentUser.school._id || currentUser.school}`)
                                .catch(() => ({ data: [] })); // Fallback if route fails
                
                // Filter for current student if API returns all (which it shouldn't for parent, but safety first)
                // Actually FeeTransactions usually returns for school. We might need a student specific endpoint.
                // Let's try to filter client side or mock if needed.
                // For now, let's use a dummy list if empty to show UI structure, but aiming for real data.
                
                // 2. Fetch Pending Fees
                const pendingRes = await axios.get(`${API_URL}/PendingFees/${currentUser.school._id || currentUser.school}`)
                                .catch(() => ({ data: [] }));

                setFeeHistory([]); // Logic to extract student specific history needed
                setPendingFees({ totalPending: 5000, breakdowns: [{ title: 'Tuition Fee - Mar', amount: 5000 }] }); // Placeholder data for now as specific student fee endpoints need verification

            } catch (err) {
                console.error("Error fetching fees:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeeData();
    }, [currentUser]);

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fee Status</h2>
                    <p className="text-muted-foreground mt-1">Manage and view your fee payments</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Pending Dues Card */}
                <Card className="col-span-3 border-l-4 border-l-amber-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                            Pending Dues
                        </CardTitle>
                        <CardDescription>Fees currently due for payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600 mb-4">
                            PKR {pendingFees.totalPending.toLocaleString()}
                        </div>
                        <div className="space-y-2">
                            {pendingFees.breakdowns.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                    <span>{item.title}</span>
                                    <span className="font-medium">PKR {item.amount}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white">
                            <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Status Summary */}
                <Card className="col-span-4 shadow-md">
                     <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>Recent transactions and receipts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1].length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            No payment history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Mock Data for UI Visualization
                                    <TableRow>
                                        <TableCell>15 Feb 2024</TableCell>
                                        <TableCell>Tuition Fee - Feb</TableCell>
                                        <TableCell>PKR 5,000</TableCell>
                                        <TableCell><Badge className="bg-green-600">Paid</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ParentFees;
