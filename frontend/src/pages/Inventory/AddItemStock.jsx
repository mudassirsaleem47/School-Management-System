import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    PackagePlus,
    Search,
    Plus,
    Trash2,
    Upload,
    FileText,
    Minus
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/DatePicker";

const API_BASE = API_URL;

const AddItemStock = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Form Data
    const [itemCategory, setItemCategory] = useState('');
    const [itemName, setItemName] = useState('');
    const [supplier, setSupplier] = useState('');
    const [store, setStore] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const fileInputRef = useRef(null);
    
    // Fetch items
    const fetchStockItems = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/Inventory/Stock/${currentUser._id}`);
            setItems(res.data);
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch stock items", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        if (!currentUser) return;
        try {
            const [catRes, itemRes, supRes] = await Promise.all([
                axios.get(`${API_BASE}/Inventory/Category/${currentUser._id}`),
                axios.get(`${API_BASE}/Inventory/Item/${currentUser._id}`),
                axios.get(`${API_BASE}/Inventory/Supplier/${currentUser._id}`)
            ]);
            setCategories(catRes.data);
            setAvailableItems(itemRes.data);
            setSuppliersList(supRes.data);
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };

    useEffect(() => {
        fetchStockItems();
        fetchMasterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setDocumentFile(e.target.files[0]);
        }
    };

    const handleSaveStock = async (e) => {
        e.preventDefault();
        if (!itemCategory || !itemName || quantity < 1 || !purchasePrice || !date) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setProcessing(true);
            const formData = new FormData();
            formData.append('school', currentUser._id);
            formData.append('itemCategory', itemCategory);
            formData.append('itemName', itemName);
            formData.append('supplier', supplier);
            formData.append('store', store);
            formData.append('quantity', quantity);
            formData.append('purchasePrice', purchasePrice);
            formData.append('date', date);
            formData.append('description', description);
            
            if (documentFile) {
                formData.append('document', documentFile);
            }

            await axios.post(`${API_BASE}/Inventory/Stock`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast("Stock item added successfully", "success");
            
            // Reset form
            setIsModalOpen(false);
            setItemCategory('');
            setItemName('');
            setSupplier('');
            setStore('');
            setQuantity(1);
            setPurchasePrice('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setDocumentFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            
            fetchStockItems();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to add stock", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this stock entry? This usually should not be done unless entered in error.")) return;
        try {
            await axios.delete(`${API_BASE}/Inventory/Stock/${id}`);
            showToast("Record deleted", "success");
            fetchStockItems();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete record", "error");
        }
    };

    const filteredItems = items.filter(item => 
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Item Stock</h2>
                    <p className="text-muted-foreground">Add new purchased inventory items and track stock levels</p>
                </div>
                
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stock
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackagePlus className="h-5 w-5 text-muted-foreground"/> 
                            Stock Entries
                        </CardTitle>
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center border border-dashed rounded-lg m-4">
                            <PackagePlus className="h-12 w-12 mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium text-foreground">No Stock Entries</p>
                            <p className="max-w-sm mt-2 text-sm">Add newly purchased items to your inventory to start managing stock.</p>
                            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4">
                                Add First Item
                            </Button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No records matched your search.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 whitespace-nowrap">
                                        <TableHead className="pl-6">Item Info</TableHead>
                                        <TableHead>Purchased Details</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="font-medium text-primary">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <Badge variant="outline" className="font-normal text-[10px]">{item.itemCategory}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">Store: {item.store || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">Supplier: {item.supplier || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Date: {format(new Date(item.date), 'dd MMM, yyyy')}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-semibold text-sm h-6 px-3">{item.quantity}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">${item.purchasePrice?.toFixed(2)}</div>
                                            </TableCell>
                                            <TableCell>
                                                {item.documentUrl ? (
                                                    <a href={`${API_BASE.replace('/api', '')}/${item.documentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm bg-blue-50 w-fit px-2 py-1 rounded-md">
                                                        <FileText className="h-4 w-4" /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No File</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Stock Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSaveStock}>
                        <DialogHeader>
                            <DialogTitle>Add Item Stock</DialogTitle>
                            <DialogDescription>
                                Enter details of the new inventory items purchased.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="required">Item Category <span className="text-red-500">*</span></Label>
                                    <Select value={itemCategory} onValueChange={setItemCategory} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.length === 0 ? (
                                                <div className="p-2 text-xs text-center text-muted-foreground">No categories found</div>
                                            ) : (
                                                categories.map(cat => (
                                                    <SelectItem key={cat._id} value={cat.categoryName}>{cat.categoryName}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="required">Item <span className="text-red-500">*</span></Label>
                                    <Select value={itemName} onValueChange={setItemName} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableItems.filter(i => i.itemCategory === itemCategory).length === 0 ? (
                                                <div className="p-2 text-xs text-center text-muted-foreground">
                                                    {!itemCategory ? "Select Category first" : "No items in this category"}
                                                </div>
                                            ) : (
                                                availableItems.filter(i => i.itemCategory === itemCategory).map(item => (
                                                    <SelectItem key={item._id} value={item.itemName}>{item.itemName}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Supplier</Label>
                                    <Select value={supplier} onValueChange={setSupplier}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliersList.length === 0 ? (
                                                <div className="p-2 text-xs text-center text-muted-foreground">No suppliers found</div>
                                            ) : (
                                                suppliersList.map(sup => (
                                                    <SelectItem key={sup._id} value={sup.name}>{sup.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Store</Label>
                                    <Select value={store} onValueChange={setStore}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Main IT Store">Main IT Store</SelectItem>
                                            <SelectItem value="Admin Supply Room">Admin Supply Room</SelectItem>
                                            <SelectItem value="Library">Library</SelectItem>
                                            <SelectItem value="Sports Room">Sports Room</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="required">Quantity <span className="text-red-500">*</span></Label>
                                    <div className="flex items-center">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="px-2 h-9 rounded-r-none border-r-0"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min="1"
                                            required
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="px-2 h-9 rounded-l-none border-l-0"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="required">Purchase Price ($) <span className="text-red-500">*</span></Label>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label className="required mb-1">Date <span className="text-red-500">*</span></Label>
                                    <DatePicker 
                                        value={date}
                                        onChange={setDate}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Attach Document</Label>
                                <div 
                                    className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium mb-1">
                                        {documentFile ? documentFile.name : "Drag and drop a file here or click"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4">Support PDF, Image formats</p>
                                    
                                    <Button type="button" variant="outline" size="sm">
                                        {documentFile ? "Change File" : "Choose File"}
                                    </Button>

                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,image/*"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter additional details about the purchase..."
                                    className="resize-none h-20"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Saving..." : "Save Stock"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddItemStock;
