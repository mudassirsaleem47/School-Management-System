import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, DollarSign, User, ChevronRight, FilterX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const FeeCollection = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
      const [classRes, studentRes] = await Promise.all([
        axios.get(`${API_BASE}/Sclasses/${schoolId}`),
        axios.get(`${API_BASE}/Students/${schoolId}`),
      ]);
      setClasses(Array.isArray(classRes.data) ? classRes.data : []);
      setAllStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
    } catch {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Sections ── */
  const sectionOptions = useMemo(() => {
    const cls = classes.find((c) => c._id === selectedClassId);
    if (!cls) return [];
    return (cls.sections || []).map((s) =>
      typeof s === 'string' ? s : s.sectionName || s.name || s
    );
  }, [classes, selectedClassId]);

  /* ── Filtered Students ── */
  const filteredStudents = useMemo(() => {
    let list = allStudents;
    if (selectedClassId) list = list.filter((s) => s.sclassName?._id === selectedClassId);
    if (selectedSection) list = list.filter((s) => s.section === selectedSection);
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(kw) ||
          s.rollNum?.toString().includes(kw) ||
          s.admissionNum?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [allStudents, selectedClassId, selectedSection, searchKeyword]);

  /* ── Navigate to fee detail ── */
  const handleCollectFee = (student) => {
    const base = location.pathname.startsWith('/accountant')
      ? '/accountant'
      : '/admin';
    navigate(`${base}/fee-collection/${student._id}`);
  };

  const handleNameClick = (e, studentId) => {
    e.stopPropagation();
    const base = location.pathname.startsWith('/accountant') ? '/accountant' : '/admin';
    navigate(`${base}/students/${studentId}`);
  };

  const clearFilters = () => {
    setSelectedClassId('');
    setSelectedSection('');
    setSearchKeyword('');
  };

  const hasFilters = selectedClassId || selectedSection || searchKeyword;

  /* ══════════ RENDER ══════════ */
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)]">
      {/* Page Header */}
      <div className="px-8 py-5 border-b bg-background">
        <h2 className="text-2xl font-bold tracking-tight">Fee Collection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a student and collect their fee
        </p>
      </div>

      {/* Filters Bar */}
      <div className="px-8 py-4 rounded-lg bg-muted/20 flex flex-wrap items-end gap-3">
        {/* Class */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Class
          </label>
          <Select
            value={selectedClassId || 'all'}
            onValueChange={(v) => {
              setSelectedClassId(v === 'all' ? '' : v);
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="h-9 bg-background text-sm">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.sclassName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Section
          </label>
          <Select
            value={selectedSection || 'all'}
            onValueChange={(v) => setSelectedSection(v === 'all' ? '' : v)}
            disabled={!selectedClassId}
          >
            <SelectTrigger className="h-9 bg-background text-sm">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sectionOptions.map((sec) => (
                <SelectItem key={sec} value={sec}>
                  {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Search by Roll No / Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, roll no, admission no..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9 h-9 bg-background text-sm"
            />
          </div>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-muted-foreground self-end"
          >
            <FilterX className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Student Count bar */}
      <div className="px-8 py-2 border-b bg-background flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{filteredStudents.length}</span>{' '}
          students found
        </span>
        {hasFilters && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>

      {/* Student Table */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <User className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm mt-1">Try changing the filters or search query</p>
            </div>
          ) : (
            /* Table */
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[56px_1fr_120px_180px_200px_160px] bg-muted/40 border-b px-4 py-2.5 text-xs font-bold uppercase text-muted-foreground tracking-wide">
                <div>#</div>
                <div>Student Name</div>
                <div>Roll No</div>
                <div>Class (Section)</div>
                <div>Father Name</div>
                <div className="text-right pr-2">Action</div>
              </div>

                {/* Rows */}
                <div className="divide-y">
                  {filteredStudents.map((student, index) => (
                    <div
                      key={student._id}
                      className="grid grid-cols-[56px_1fr_120px_180px_200px_160px] items-center px-4 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      {/* Index */}
                      <div className="text-xs text-muted-foreground">{index + 1}</div>

                      {/* Name + Avatar */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0 border">
                          <AvatarImage src={`${API_BASE}/${student.studentPhoto}`} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {student.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate hover:text-primary cursor-pointer hover:underline"
                            onClick={(e) => handleNameClick(e, student._id)}
                          >
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.admissionNum || 'Adm: N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Roll No */}
                      <div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {student.rollNum}
                        </Badge>
                      </div>

                      {/* Class */}
                      <div className="text-sm text-foreground/80">
                        {student.sclassName?.sclassName}{' '}
                        {student.section ? `(${student.section})` : ''}
                      </div>

                      {/* Father */}
                      <div className="text-sm text-muted-foreground truncate">
                        {student.fatherName || student.father?.name || 'N/A'}
                      </div>

                      {/* Collect Fee Button */}
                      <div className="flex justify-end pr-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => handleCollectFee(student)}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Collect Fee
                          <ChevronRight className="h-3 w-3 opacity-70" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeCollection;
