import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { format } from 'date-fns';
import {
    Loader2,
    Trash2,
    Image as ImageIcon,
    FileText,
    Download,
    ExternalLink,
    UploadCloud,
    LayoutGrid,
    List as ListIcon,
    Search,
    MoreHorizontal,
    Copy,
    Video,
    Music,
    File
} from 'lucide-react';

import API_URL from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import ConfirmDeleteModal from '@/components/form-popup/ConfirmDeleteModal';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';


const MediaManager = () => {
    const { currentUser } = useAuth();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Deletion states
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    
    // Bulk Selection
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Storage info
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5 * 1024 * 1024 * 1024 }); // 5GB default
    
    const [uploading, setUploading] = useState(false);
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    const [searchQuery, setSearchQuery] = useState('');
    
    const fileInputRef = useRef(null);

    const fetchMedia = async () => {
        if (!currentUser) return;
        const schoolId = currentUser.school || currentUser._id;
        
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/Media/${schoolId}`, { withCredentials: true });
            if (response.data.success) {
                setMedia(response.data.media);
                if (response.data.storage) {
                    setStorageInfo({
                        used: response.data.storage.used,
                        total: response.data.storage.total
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to fetch media');
            }
        } catch (error) {
            console.error('Error fetching media:', error);
            toast.error('Error connecting to the server while fetching media.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchMedia();
        }
    }, [currentUser]);

    // Derived filtered content
    const filteredMedia = useMemo(() => {
        if (!searchQuery) return media;
        const query = searchQuery.toLowerCase();
        return media.filter(m => 
            (m.filename && m.filename.toLowerCase().includes(query)) ||
            (m.public_id && m.public_id.toLowerCase().includes(query)) ||
            (m.format && m.format.toLowerCase().includes(query))
        );
    }, [media, searchQuery]);


    // Bulk Selection logic
    const toggleSelectAll = () => {
        if (selectedMedia.length === filteredMedia.length) {
            setSelectedMedia([]);
        } else {
            setSelectedMedia(filteredMedia.map(m => m.public_id));
        }
    };

    const toggleSelectMedia = (public_id) => {
        if (selectedMedia.includes(public_id)) {
            setSelectedMedia(prev => prev.filter(id => id !== public_id));
        } else {
            setSelectedMedia(prev => [...prev, public_id]);
        }
    };

    // Actions
    const confirmDelete = (public_id) => {
        setPendingDeleteId(public_id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!pendingDeleteId) return;

        setDeletingId(pendingDeleteId);
        setShowDeleteModal(false);
        try {
            const response = await axios.post(`${API_URL}/MediaDelete`, { public_id: pendingDeleteId }, { withCredentials: true });
            if (response.data.success) {
                toast.success('Media deleted successfully');
                setMedia(prev => prev.filter(item => item.public_id !== pendingDeleteId));
                setSelectedMedia(prev => prev.filter(id => id !== pendingDeleteId));
                setPendingDeleteId(null);
                fetchMedia(); 
            } else {
                toast.error(response.data.message || 'Failed to delete media');
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            toast.error('Error connecting to the server while deleting media.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async () => {
        try {
            // Bulk delete API call mapping
            const deletePromises = selectedMedia.map(public_id => 
                axios.post(`${API_URL}/MediaDelete`, { public_id }, { withCredentials: true })
            );
            await Promise.all(deletePromises);

            toast.success(`${selectedMedia.length} files deleted from storage`);
            setMedia(prev => prev.filter(m => !selectedMedia.includes(m.public_id)));
            setSelectedMedia([]);
            setIsBulkDeleteOpen(false);
            fetchMedia(); // refresh storage
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete some files");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = null;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('schoolId', currentUser.school || currentUser._id); 
        
        setUploading(true);

        const uploadPromise = axios.post(`${API_URL}/MediaUpload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        }).then(response => {
            if (response.data.success) {
                setMedia(prev => [response.data.media, ...prev]);
                fetchMedia();
                return response.data;
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        }).finally(() => {
            setUploading(false);
        });

        toast.promise(uploadPromise, {
            loading: 'Uploading file to local storage...',
            success: 'File uploaded successfully!',
            error: (err) => `Failed to upload file. ${err.response?.data?.message || err.message}`
        });
    };

    // Utils
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard!");
    };
    
    const getFileIcon = (resourceType, format) => {
        if (resourceType === 'image' && format !== 'pdf') return <ImageIcon className="w-12 h-12 text-muted-foreground/40" />;
        if (resourceType === 'video') return <Video className="w-12 h-12 text-muted-foreground/40" />;
        if (format === 'mp3' || format === 'wav') return <Music className="w-12 h-12 text-muted-foreground/40" />;
        if (format === 'pdf') return <FileText className="w-12 h-12 text-red-400/60" />;
        return <File className="w-12 h-12 text-muted-foreground/40" />;
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen text-foreground">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your school's local media storage assets
                    </p>
                </div>
                
                <div className="flex flex-col align-end gap-4 w-full md:w-auto">
                    {/* Storage Indicator */}
                    <div className="flex flex-col justify-center gap-1.5 w-full sm:w-64 bg-card border rounded-lg p-3 shadow-sm">
                         <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                             <span>Storage</span>
                             <span className="text-primary">{formatBytes(storageInfo.used)} <span className="font-normal text-muted-foreground">/ {formatBytes(storageInfo.total, 0)}</span></span>
                         </div>
                         <Progress 
                            value={Math.min((storageInfo.used / storageInfo.total) * 100, 100)} 
                            className={`h-2 ${storageInfo.used / storageInfo.total > 0.9 ? 'bg-destructive/20 [&>div]:bg-destructive' : ''}`} 
                         />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto items-center h-full">
                        <input 
                            type="file" 
                            multiple
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept="image/*,application/pdf,video/*"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1 sm:flex-none shadow-sm h-10"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                            Upload
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchMedia}
                            disabled={loading || uploading}
                            className="flex-1 sm:flex-none shadow-sm h-10"
                        >
                            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background p-1 rounded-lg">
                <div className="flex flex-1 items-center gap-2 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by file name or extension..."
                            className="pl-9 bg-card"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Bulk Actions Indicator */}
                    {selectedMedia.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md animate-in fade-in slide-in-from-left-5 border">
                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                                {selectedMedia.length} Selected
                            </span>
                            <div className="h-4 w-[1px] bg-border mx-2" />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsBulkDeleteOpen(true)}
                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
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

            {/* Content Area */}
            <div>
                {loading && media.length === 0 ? (
                    <div 
                        key="loader"
                        className="flex flex-col items-center justify-center p-20 text-center border rounded-xl bg-card border-dashed"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground font-medium">Loading media library...</p>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div 
                        key="empty"
                        className="flex flex-col items-center justify-center p-20 text-center border rounded-xl bg-card border-dashed shadow-sm"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
                        </div>
                        <h3 className="text-lg font-bold">No files found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                            {searchQuery ? "Try adjusting your search query." : "You haven't uploaded any media yet. Click the upload button to store assets securely."}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => fileInputRef.current?.click()} className="mt-6 shadow-sm" variant="secondary">
                                <UploadCloud className="w-4 h-4 mr-2" />
                                Upload File Now
                            </Button>
                        )}
                    </div>
                ) : (
                    viewType === 'grid' ? (
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2"
                            key="grid-view"
                        >
                            {filteredMedia.map((item) => (
                                <Card 
                                    key={item.public_id} 
                                    className={`relative overflow-hidden group flex flex-col hover:shadow-sm transition-all duration-300 border-muted/60 ${selectedMedia.includes(item.public_id) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'}`}
                                >
                                    {/* Selection Overlay Checkbox */}
                                    <div className="absolute top-2 left-2 z-20">
                                        <Checkbox
                                            checked={selectedMedia.includes(item.public_id)}
                                            onCheckedChange={() => toggleSelectMedia(item.public_id)}
                                            className={`transition-all data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${selectedMedia.includes(item.public_id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-background/60 backdrop-blur-sm border-muted-foreground/40`}
                                        />
                                    </div>

                                    {/* Image/Icon Area */}
                                    <div className="relative aspect-video bg-gradient-to-br from-muted/50 via-muted to-muted flex items-center justify-center overflow-hidden">
                                        {item.resource_type === 'image' && item.format !== 'pdf' ? (
                                            <img 
                                                src={item.url} 
                                                alt={item.public_id} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            getFileIcon(item.resource_type, item.format)
                                        )}

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <Button size="icon" variant="secondary" className="rounded-full w-9 h-9 shadow-md hover:scale-110 transition-transform" asChild title="View Original">
                                                <a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
                                            </Button>
                                            <Button size="icon" variant="secondary" className="rounded-full w-9 h-9 shadow-md hover:scale-110 transition-transform" asChild title="Download">
                                                <a href={item.url} download={item.filename || 'download'} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <CardContent className="p-4 flex flex-col flex-grow relative">
                                        <Badge variant="secondary" className="absolute -top-3 right-3 shadow-sm bg-background/90 backdrop-blur-sm font-mono text-[10px] uppercase">
                                            {item.format}
                                        </Badge>
                                        
                                        <h3 
                                            className="text-sm font-bold truncate mb-3 cursor-pointer hover:text-primary transition-colors pr-8 leading-tight"
                                            title={item.public_id}
                                            onClick={() => copyToClipboard(item.url)}
                                        >
                                            {item.filename || item.public_id.split('/').pop()}
                                        </h3>
                                        
                                        <div className="flex gap-2 text-xs text-muted-foreground mb-3 font-mono bg-muted/50 p-2 rounded-md items-center mt-auto border border-border/40">
                                            <span className="font-semibold text-foreground/80">{formatBytes(item.bytes)}</span>
                                            {item.width && item.height && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                                    <span>{item.width}&times;{item.height}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 opacity-80">
                                            <span className="w-2 h-2 rounded-full border border-green-500 bg-green-500/20 inline-block"></span>
                                            {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </CardContent>

                                    {/* Footer Actions */}
                                    <CardFooter className="p-0 border-t bg-muted/10 grid grid-cols-2 divide-x divide-border/40 shadow-inner">
                                        <Button 
                                            variant="ghost" 
                                            className="h-10 rounded-none w-full text-xs font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors group/btn"
                                            onClick={() => copyToClipboard(item.url)}
                                        >
                                            <Copy className="h-3.5 w-3.5 mr-2 opacity-70 group-hover/btn:opacity-100" /> Copy URL
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="h-10 rounded-none w-full text-xs font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors group/btn"
                                            onClick={() => confirmDelete(item.public_id)}
                                            disabled={deletingId === item.public_id}
                                        >
                                            {deletingId === item.public_id ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-2 opacity-70 group-hover/btn:opacity-100" />} 
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="pt-2"
                            key="list-view"
                        >
                            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableHead className="w-[50px] pl-4">
                                                <Checkbox
                                                    checked={filteredMedia.length > 0 && selectedMedia.length === filteredMedia.length}
                                                    onCheckedChange={toggleSelectAll}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px]">Preview</TableHead>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase">File Details</TableHead>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase">Type</TableHead>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase">Size</TableHead>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase">Date</TableHead>
                                            <TableHead className="text-right pr-6 font-semibold text-xs tracking-wider uppercase">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMedia.map((item) => (
                                            <TableRow 
                                                key={item.public_id} 
                                                className={`group transition-colors ${selectedMedia.includes(item.public_id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                            >
                                                <TableCell className="pl-4">
                                                    <Checkbox
                                                        checked={selectedMedia.includes(item.public_id)}
                                                        onCheckedChange={() => toggleSelectMedia(item.public_id)}
                                                        aria-label={`Select ${item.public_id}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="w-[80px]">
                                                    <div className="w-12 h-12 bg-muted/80 rounded-md flex items-center justify-center overflow-hidden border shadow-sm">
                                                        {item.resource_type === 'image' && item.format !== 'pdf' ? (
                                                            <img src={item.url} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" loading="lazy" />
                                                        ) : (
                                                            getFileIcon(item.resource_type, item.format)
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <h3 
                                                        className="font-semibold text-sm cursor-pointer hover:underline hover:text-primary transition-colors block truncate max-w-[250px] sm:max-w-md"
                                                        title={item.filename || item.public_id.split('/').pop()}
                                                        onClick={() => copyToClipboard(item.url)}
                                                    >
                                                        {item.filename || item.public_id.split('/').pop()}
                                                    </h3>
                                                    {item.width && item.height && (
                                                        <span className="text-[10px] text-muted-foreground font-mono mt-1 block">Dimensions: {item.width}x{item.height}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="uppercase text-[10px] bg-background">
                                                        {item.format}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs font-medium">
                                                    {formatBytes(item.bytes)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(new Date(item.created_at), 'PPP')}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                                                                <Copy className="mr-2 h-4 w-4" /> Copy Direct Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center w-full cursor-default">
                                                                    <ExternalLink className="mr-2 h-4 w-4" /> View Original
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <a href={item.url} download={item.filename || 'download'} target="_blank" rel="noreferrer" className="flex items-center w-full cursor-default">
                                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-destructive focus:text-destructive" 
                                                                onClick={() => confirmDelete(item.public_id)}
                                                                disabled={deletingId === item.public_id}
                                                            >
                                                                {deletingId === item.public_id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                                Delete File
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Single Delete Alert */}
            <ConfirmDeleteModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={deletingId !== null}
                title="Delete Media File?"
                description="This file will be permanently removed from your secure storage. This action cannot be reversed and could break links using this media."
                confirmText="Delete Permanently"
            />
            
            {/* Bulk Delete Alert */}
            <ConfirmDeleteModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedMedia.length} Files?`}
                description={`Are you sure you want to permanently delete these ${selectedMedia.length} files from storage? This action cannot be undone.`}
                confirmText="Delete All Selected"
            />
        </div>
    );
};

export default MediaManager;
