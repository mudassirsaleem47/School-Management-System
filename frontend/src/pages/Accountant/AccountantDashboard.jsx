import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { 
    Users, 
    CreditCard, 
    TrendingUp, 
    TrendingDown, 
    DollarSign,
    Wallet,
    AlertCircle
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const AccountantDashboard = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        fees: { total: 0, collected: 0, pending: 0 },
        income: { total: 0, monthly: [] },
        expense: { total: 0, monthly: [] }
    });

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser.school?._id || currentUser.school; // Handle populated or ID

            const [feeRes, incomeRes, expenseRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/FeeStatistics/${schoolId}`),
                axios.get(`${API_BASE}/IncomeStatistics/${schoolId}`),
                axios.get(`${API_BASE}/ExpenseStatistics/${schoolId}`)
            ]);

            const newStats = {
                fees: feeRes.status === 'fulfilled' ? {
                    total: (feeRes.value.data.pendingFees?.amount || 0) + (feeRes.value.data.totalCollection?.amount || 0),
                    collected: feeRes.value.data.totalCollection?.amount || 0,
                    pending: feeRes.value.data.pendingFees?.amount || 0,
                } : { total: 0, collected: 0, pending: 0 },
                income: { total: (incomeRes.status === 'fulfilled' ? (incomeRes.value.data.totalIncome?.amount || 0) : 0) },
                expense: { total: (expenseRes.status === 'fulfilled' ? (expenseRes.value.data.totalExpense?.amount || 0) : 0) }
            };

            setStats(newStats);
        } catch (err) {
            console.error("Error fetching accountant dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data (Income vs Expense)
    // Assuming backend returns monthly data in a consistent format or we mock it for now if backend is simple sum
    // For now, let's assume we want to show a simple comparison if monthly data isn't robust
    const chartData = [
        { name: 'Income', amount: stats.income.total || 0, fill: '#10b981' }, // green-500
        { name: 'Expense', amount: stats.expense.total || 0, fill: '#ef4444' }, // red-500
    ];

    const feeCollectionRate = stats.fees.total > 0 
        ? Math.round((stats.fees.collected / stats.fees.total) * 100) 
        : 0;

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Accountant Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of school finances and fee collections.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link to="/accountant/fee-collection">Collect Fees</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/accountant/fee-reports">View Reports</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Fees" 
                    value={`$${stats.fees.total?.toLocaleString()}`} 
                    description="Total assignable fees" 
                    icon={Wallet}
                    loading={loading}
                    className="border-l-4 border-l-blue-500"
                />
                <StatCard 
                    title="Collected Fees" 
                    value={`$${stats.fees.collected?.toLocaleString()}`} 
                    description={`${feeCollectionRate}% collection rate`} 
                    icon={CreditCard}
                    loading={loading}
                    className="border-l-4 border-l-green-500"
                />
                <StatCard 
                    title="Pending Fees" 
                    value={`$${stats.fees.pending?.toLocaleString()}`} 
                    description="Outstanding dues" 
                    icon={AlertCircle}
                    loading={loading}
                    className="border-l-4 border-l-orange-500"
                />
                <StatCard 
                    title="Net Balance" 
                    value={`$${(stats.income.total - stats.expense.total).toLocaleString()}`} 
                    description="Income - Expense" 
                    icon={DollarSign}
                    loading={loading}
                    className="border-l-4 border-l-purple-500"
                />
            </div>

            {/* Middle Section: Charts & Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Financial Overview Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                        <CardDescription>Income vs Expenses Summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <Skeleton className="h-full w-full" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                                        />
                                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Recent Activity Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage daily tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link to="/accountant/fee-collection" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <CreditCard className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <div className="font-medium">Collect Fees</div>
                                <div className="text-xs text-muted-foreground">Record student payments</div>
                            </div>
                        </Link>

                        <Link to="/accountant/expense" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <TrendingDown className="h-5 w-5 text-red-700" />
                            </div>
                            <div>
                                <div className="font-medium">Add Expense</div>
                                <div className="text-xs text-muted-foreground">Log school expenditures</div>
                            </div>
                        </Link>

                        <Link to="/accountant/income" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <TrendingUp className="h-5 w-5 text-blue-700" />
                            </div>
                            <div>
                                <div className="font-medium">Add Income</div>
                                <div className="text-xs text-muted-foreground">Record misc. income</div>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Helper Component for consistent stat cards
const StatCard = ({ title, value, description, icon: Icon, loading, className }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {title}
            </CardTitle>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </>
            )}
        </CardContent>
    </Card>
);

export default AccountantDashboard;

