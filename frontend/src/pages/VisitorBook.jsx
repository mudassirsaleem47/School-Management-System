import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import VisitorModal from "../components/form-popup/VisitorModal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    IconSearch,
    IconPlus,
    IconEye,
    IconEdit,
    IconTrash,
    IconLoader,
    IconAlertTriangle
} from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const API_BASE = "http://localhost:5000";

const VisitorBook = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const response = await axios.get(`${API_BASE}/Visitors/${schoolId}`);
            setVisitors(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            showToast("Error loading visitors", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedVisitor(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const handleView = (visitor) => {
        setSelectedVisitor(visitor);
        setModalMode("view");
        setIsModalOpen(true);
    };

    const handleEdit = (visitor) => {
        setSelectedVisitor(visitor);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            // Optimistic update
            setVisitors((prev) => prev.filter((v) => v._id !== deleteId));
            setIsDeleteOpen(false);

            await axios.delete(`${API_BASE}/Visitors/${deleteId}`);
            showToast("Visitor record deleted", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to delete record", "error");
            fetchData(); // Revert on error
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (modalMode === "add") {
                const payload = { ...formData, adminID: currentUser._id };
                const res = await axios.post(`${API_BASE}/VisitorsCreate`, payload);
                setVisitors((prev) => [res.data, ...prev]);
                showToast("Visitor added successfully", "success");
            } else if (modalMode === "edit" && selectedVisitor) {
                const payload = { ...formData, adminID: currentUser._id };
                await axios.put(`${API_BASE}/Visitors/${selectedVisitor._id}`, payload);

                setVisitors((prev) =>
                    prev.map((v) =>
                        v._id === selectedVisitor._id ? { ...v, ...formData } : v
                    )
                );
                showToast("Visitor updated successfully", "success");
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            showToast("Operation failed", "error");
        }
    };

    const filteredVisitors = visitors.filter((visitor) => {
        const query = searchQuery.toLowerCase();
        const staffName = visitor.staff?.name?.toLowerCase() || "";
        const studentName = visitor.student?.name?.toLowerCase() || "";

        return (
            (visitor.visitorName?.toLowerCase() || "").includes(query) ||
            (visitor.purpose?.toLowerCase() || "").includes(query) ||
            (visitor.phone?.toLowerCase() || "").includes(query) ||
            staffName.includes(query) ||
            studentName.includes(query)
        );
    });

    return (
        <div className="space-y-6 pt-2">
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-2xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 space-y-4 sm:space-y-0">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Visitor Book</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage visitor records and history</p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/20 w-full sm:w-auto"
                    >
                        <IconPlus className="w-4 h-4 mr-2" /> Add Visitor
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-6">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by name, purpose, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background border-border focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-muted-foreground">Visitor Name</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Purpose</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Meeting With</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Phone</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Time</TableHead>
                                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <span className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <IconLoader className="animate-spin w-4 h-4" /> Loading visitors...
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredVisitors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No visitors found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                            filteredVisitors.map((visitor) => (
                                                <TableRow key={visitor._id} className="hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-medium text-foreground">
                                                        {visitor.visitorName}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground max-w-[150px] truncate" title={visitor.purpose}>
                                                        {visitor.purpose}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {visitor.meetingWith === 'Staff' 
                                                                  ? visitor.staff?.name
                                                                  : visitor.student?.name}
                                                          </span>
                                                          <span className="text-xs text-muted-foreground">{visitor.meetingWith}</span>
                                                      </div>
                                                  </TableCell>
                                                  <TableCell className="text-muted-foreground">{visitor.phone || '-'}</TableCell>
                                                  <TableCell className="text-muted-foreground">
                                                      {visitor.date ? new Date(visitor.date).toLocaleDateString() : '-'}
                                                  </TableCell>
                                                  <TableCell className="text-muted-foreground text-sm">
                                                      <div className="flex items-center gap-1"><span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider w-8">In</span> <span className="text-foreground">{visitor.inTime}</span></div>
                                                      {visitor.outTime && <div className="flex items-center gap-1 mt-1"><span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider w-8">Out</span> <span className="text-foreground">{visitor.outTime}</span></div>}
                                                  </TableCell>
                                                  <TableCell className="text-right">
                                                      <div className="flex items-center justify-end gap-1">
                                                          <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              onClick={() => handleView(visitor)}
                                                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                              title="View"
                                                          >
                                                              <IconEye className="w-4 h-4" />
                                                          </Button>
                                                          <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              onClick={() => handleEdit(visitor)}
                                                              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                              title="Edit"
                                                          >
                                                              <IconEdit className="w-4 h-4" />
                                                          </Button>
                                                          <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              onClick={() => confirmDelete(visitor._id)}
                                                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                              title="Delete"
                                                          >
                                                              <IconTrash className="w-4 h-4" />
                                                          </Button>
                                                      </div>
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Visitor Modal */}
            <VisitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedVisitor}
                viewMode={modalMode === "view"}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <IconAlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this visitor record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VisitorBook;
