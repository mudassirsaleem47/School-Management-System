import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Search,
    LayoutGrid,
    List as ListIcon,
    Mail,
    Phone,
    GraduationCap,
    Users,
    BookOpen,
    Calculator,
    PhoneCall,
    Filter,
    Download,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const API_BASE = API_URL;

const ROLE_CONFIG = {
    teacher: {
        label: 'Teacher',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: BookOpen,
        avatarBg: 'bg-blue-500/10 text-blue-600',
    },
    accountant: {
        label: 'Accountant',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: Calculator,
        avatarBg: 'bg-green-500/10 text-green-600',
    },
    receptionist: {
        label: 'Receptionist',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: PhoneCall,
        avatarBg: 'bg-purple-500/10 text-purple-600',
    },
};

const StaffDirectory = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [allStaff, setAllStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchAllStaff = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const schoolId = currentUser._id;
            const [teachersRes, accountantsRes, receptionistsRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/Teachers/${schoolId}`),
                axios.get(`${API_BASE}/Accountants/${schoolId}`),
                axios.get(`${API_BASE}/Receptionists/${schoolId}`),
            ]);

            const teachers = (teachersRes.status === 'fulfilled' ? teachersRes.value.data : [])
                .map(t => ({ ...t, role: 'teacher' }));
            const accountants = (accountantsRes.status === 'fulfilled' ? accountantsRes.value.data : [])
                .map(a => ({ ...a, role: 'accountant' }));
            const receptionists = (receptionistsRes.status === 'fulfilled' ? receptionistsRes.value.data : [])
                .map(r => ({ ...r, role: 'receptionist' }));

            setAllStaff([...teachers, ...accountants, ...receptionists]);
        } catch (err) {
            showToast('Error loading staff data', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        fetchAllStaff();
    }, [fetchAllStaff]);

    const filteredStaff = allStaff.filter((member) => {
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        if (!searchQuery) return matchesRole;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            member.name?.toLowerCase().includes(q) ||
            member.email?.toLowerCase().includes(q) ||
            member.phone?.toLowerCase().includes(q) ||
            member.subject?.toLowerCase().includes(q) ||
            member.qualification?.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
    });

    const stats = {
        total: allStaff.length,
        teachers: allStaff.filter(s => s.role === 'teacher').length,
        accountants: allStaff.filter(s => s.role === 'accountant').length,
        receptionists: allStaff.filter(s => s.role === 'receptionist').length,
    };

    const getInitials = (name) => name?.substring(0, 2).toUpperCase() || '??';

    const RoleBadge = ({ role }) => {
        const config = ROLE_CONFIG[role];
        if (!config) return null;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Directory</h2>
                    <p className="text-muted-foreground">Complete list of all school staff members</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total Staff</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.teachers}</p>
                            <p className="text-xs text-muted-foreground">Teachers</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                            <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.accountants}</p>
                            <p className="text-xs text-muted-foreground">Accountants</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                            <PhoneCall className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.receptionists}</p>
                            <p className="text-xs text-muted-foreground">Receptionists</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-xl w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, subject..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-44">
                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="teacher">Teachers</SelectItem>
                            <SelectItem value="accountant">Accountants</SelectItem>
                            <SelectItem value="receptionist">Receptionists</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center bg-muted/50 p-1 rounded-lg border ml-auto">
                    <Button
                        variant={viewType === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewType('list')}
                        className="h-8 w-8"
                        title="List View"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewType === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewType('grid')}
                        className="h-8 w-8"
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-muted/10 border-dashed text-center">
                    <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-medium">No Staff Found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        {searchQuery || roleFilter !== 'all'
                            ? 'No matches found. Try changing your search or filter.'
                            : 'No staff members have been added yet.'}
                    </p>
                </div>
            ) : viewType === 'list' ? (
                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="pl-4">Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="hidden md:table-cell">Qualification</TableHead>
                                <TableHead className="hidden lg:table-cell">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.map((member) => {
                                const config = ROLE_CONFIG[member.role];
                                return (
                                    <TableRow key={member._id + member.role} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarFallback className={config?.avatarBg || 'bg-primary/10 text-primary'}>
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{member.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <RoleBadge role={member.role} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone || '—'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {member.qualification || '—'}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                            {member.role === 'teacher' && member.subject
                                                ? <Badge variant="secondary" className="font-normal">{member.subject}</Badge>
                                                : member.experience
                                                ? `${member.experience} yrs exp.`
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <div className="px-4 py-2 border-t text-sm text-muted-foreground">
                        Showing {filteredStaff.length} of {allStaff.length} staff members
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredStaff.map((member) => {
                        const config = ROLE_CONFIG[member.role];
                        const RoleIcon = config?.icon || Users;
                        return (
                            <Card key={member._id + member.role} className="overflow-hidden hover:shadow-md transition-all group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2">
                                            <AvatarFallback className={`text-base font-semibold ${config?.avatarBg || 'bg-primary/10 text-primary'}`}>
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">{member.name}</CardTitle>
                                            <CardDescription className="text-xs truncate">{member.email}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <RoleBadge role={member.role} />
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4 text-sm grid gap-2">
                                    {member.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                            <span>{member.phone}</span>
                                        </div>
                                    )}
                                    {member.qualification && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{member.qualification}</span>
                                        </div>
                                    )}
                                    {member.role === 'teacher' && member.subject && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <Badge variant="secondary" className="text-xs font-normal">{member.subject}</Badge>
                                        </div>
                                    )}
                                    {member.salary && (
                                        <div className="flex justify-between items-center pt-1 border-t mt-1">
                                            <span className="text-muted-foreground">Salary</span>
                                            <span className="font-semibold text-green-600">Rs. {member.salary?.toLocaleString()}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StaffDirectory;
