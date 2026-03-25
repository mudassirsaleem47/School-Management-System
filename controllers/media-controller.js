const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Admin = require('../models/adminSchema.js');
const Student = require('../models/studentSchema.js');
const Complain = require('../models/complainSchema.js');
const CardTemplate = require('../models/cardTemplateSchema.js');
const Visitor = require('../models/visitorSchema.js');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const isCloudinaryConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

if (isCloudinaryConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const normalizePath = (value) => (value || '').replace(/\\/g, '/');

const isUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

const toRelativeUploadPath = (value) => {
    if (!value) return '';
    if (isUrl(value)) return value; // Keep full URL for Cloudinary
    
    const normalized = normalizePath(value);
    const marker = '/uploads/';
    const markerIndex = normalized.indexOf(marker);

    if (markerIndex >= 0) {
        return `uploads/${normalized.slice(markerIndex + marker.length)}`;
    }

    if (normalized.startsWith('uploads/')) return normalized;
    return normalized;
};

const toPublicUrl = (req, pathOrUrl) => {
    if (!pathOrUrl) return '';
    if (isUrl(pathOrUrl)) return pathOrUrl;
    
    const normalized = normalizePath(pathOrUrl);
    const withoutLeadingSlash = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    return `${req.protocol}://${req.get('host')}/${withoutLeadingSlash}`;
};

const mediaInfoFromUrl = (url) => {
    if (!url) return null;
    
    // Simple parser for Cloudinary or other external URLs
    const filename = url.split('/').pop().split('?')[0];
    const ext = filename.split('.').pop().toLowerCase();
    
    let resource_type = 'raw';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) resource_type = 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) resource_type = 'video';
    
    return {
        public_id: url, // For URLs, we use the URL as ID or we could try to extract public_id
        url: url,
        format: ext,
        created_at: new Date(), // We don't know the exact date from URL
        bytes: 0,
        width: null,
        height: null,
        resource_type,
        filename: filename,
        isExternal: true
    };
};

const fileStatsToMedia = (req, relativePath) => {
    if (isUrl(relativePath)) return mediaInfoFromUrl(relativePath);
    
    const absolutePath = path.join(__dirname, '..', relativePath);
    if (!fs.existsSync(absolutePath)) return null;

    const stats = fs.statSync(absolutePath);
    const ext = path.extname(relativePath).replace('.', '').toLowerCase() || 'unknown';
    const lower = ext.toLowerCase();

    let resource_type = 'raw';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(lower)) resource_type = 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(lower)) resource_type = 'video';
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(lower)) resource_type = 'audio';

    return {
        public_id: normalizePath(relativePath),
        url: toPublicUrl(req, relativePath),
        format: ext,
        created_at: stats.birthtime || stats.mtime,
        bytes: stats.size,
        width: null,
        height: null,
        resource_type,
        filename: path.basename(relativePath),
    };
};

const getMedia = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        let allowedPaths = new Set();
        
        // Fetch Admin Logo
        const admin = await Admin.findById(schoolId);
        if (admin && admin.schoolLogo) allowedPaths.add(toRelativeUploadPath(admin.schoolLogo));
        
        // Fetch Students Photos
        const students = await Student.find({ school: schoolId });
        students.forEach(student => {
            if (student.studentPhoto) allowedPaths.add(toRelativeUploadPath(student.studentPhoto));
            if (student.father?.photo) allowedPaths.add(toRelativeUploadPath(student.father.photo));
            if (student.mother?.photo) allowedPaths.add(toRelativeUploadPath(student.mother.photo));
            if (student.guardian?.photo) allowedPaths.add(toRelativeUploadPath(student.guardian.photo));
        });

        // Fetch Complains Documents
        const complains = await Complain.find({ school: schoolId });
        complains.forEach(complain => {
            if (complain.document) allowedPaths.add(toRelativeUploadPath(complain.document));
        });

        // Fetch Visitors Documents
        const visitors = await Visitor.find({ schoolId: schoolId });
        visitors.forEach(visitor => {
            if (visitor.document) allowedPaths.add(toRelativeUploadPath(visitor.document));
        });

        // Fetch Card Templates
        const templates = await CardTemplate.find({ school: schoolId });
        templates.forEach(template => {
            if (template.backgroundImage) allowedPaths.add(toRelativeUploadPath(template.backgroundImage));
        });

        // Include manually uploaded media by school prefix: <schoolId>_...
        if (fs.existsSync(uploadsDir)) {
            try {
                const allFiles = fs.readdirSync(uploadsDir);
                allFiles
                    .filter((name) => name.startsWith(`${schoolId}_`))
                    .forEach((name) => allowedPaths.add(`uploads/${name}`));
            } catch (e) {
                console.warn("Could not read local uploads dir (likely read-only FS)");
            }
        }

        // --- Cloudinary Integration ---
        let cloudinaryMedia = [];
        if (isCloudinaryConfigured()) {
            try {
                // Fetch assets from Cloudinary using tags (more accurate than prefix)
                // Fallback to prefix if tag search fails or has no results
                let result = await cloudinary.api.resources_by_tag(schoolId, {
                    max_results: 100,
                    context: true // Include metadata
                });

                // If no results by tag, try prefix (for older uploads)
                if (!result.resources || result.resources.length === 0) {
                    result = await cloudinary.api.resources({
                        type: 'upload',
                        prefix: `school_management_system/${schoolId}_`,
                        max_results: 100,
                        context: true
                    });
                }

                cloudinaryMedia = result.resources.map(resource => ({
                    public_id: resource.public_id,
                    url: resource.secure_url,
                    format: resource.format,
                    created_at: resource.created_at,
                    bytes: resource.bytes,
                    width: resource.width,
                    height: resource.height,
                    resource_type: resource.resource_type,
                    filename: resource.public_id.split('/').pop(),
                    isCloudinary: true,
                    metadata: resource.context?.custom || {}
                }));
            } catch (err) {
                console.error("Cloudinary API Error:", err.message);
            }
        }

        const media = [
            ...Array.from(allowedPaths)
                .map((relativePath) => fileStatsToMedia(req, relativePath))
                .filter(Boolean),
            ...cloudinaryMedia
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Calculate storage usage
        let totalUsedBytes = media.reduce((acc, curr) => acc + curr.bytes, 0);

        res.status(200).json({ 
            success: true, 
            media,
            storage: {
                used: totalUsedBytes,
                total: 5 * 1024 * 1024 * 1024 // Defaults to 5 GB Limit
            }
        });
    } catch (error) {
        console.error("Local Media Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch media from local storage', error: error.message });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const { public_id } = req.body;
        
        if (!public_id) {
            return res.status(400).json({ success: false, message: 'No public_id provided' });
        }

        const relativePath = toRelativeUploadPath(public_id);
        
        // If it's a Cloudinary public_id (doesn't start with uploads/ and not a local path)
        if (isCloudinaryConfigured() && !relativePath.startsWith('uploads/')) {
            try {
                // Try to delete from Cloudinary
                // If it's a URL, we need to extract public_id
                let actualPublicId = public_id;
                if (isUrl(public_id)) {
                    // Extract from URL: .../upload/v12345/folder/id.jpg -> folder/id
                    const parts = public_id.split('/');
                    const uploadIndex = parts.indexOf('upload');
                    if (uploadIndex !== -1) {
                        const idWithExt = parts.slice(uploadIndex + 2).join('/'); // skip vXXXXX
                        actualPublicId = idWithExt.split('.')[0];
                    }
                }
                await cloudinary.uploader.destroy(actualPublicId);
                console.log("✅ Deleted from Cloudinary:", actualPublicId);
            } catch (err) {
                console.error("Cloudinary Delete Error:", err.message);
            }
        }

        const safeRelativePath = normalizePath(relativePath);
        if (safeRelativePath.startsWith('uploads/')) {
            const absolutePath = path.join(__dirname, '..', safeRelativePath);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        await Admin.updateMany(
            { schoolLogo: { $regex: path.basename(safeRelativePath), $options: 'i' } },
            { $unset: { schoolLogo: '' } }
        );

        res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (error) {
        console.error("Local Media Delete Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete media from local storage', error: error.message });
    }
};

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
        
        const { schoolId } = req.body;

        // If Cloudinary is used, req.file.path is the FULL URL
        const isCloudinary = isUrl(req.file.path);
        const fileUrl = isCloudinary ? req.file.path : toPublicUrl(req, `uploads/${req.file.filename}`);
        const publicId = isCloudinary ? req.file.filename : `uploads/${req.file.filename}`;

        res.status(200).json({ 
            success: true, 
            message: 'File uploaded successfully',
            media: {
                url: fileUrl,
                public_id: publicId,
                format: req.file.mimetype.split('/')[1] || 'unknown',
                created_at: new Date().toISOString(),
                bytes: req.file.size || 0,
                resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
                filename: req.file.filename,
                schoolId: schoolId || null,
                isCloudinary: isCloudinary
            }
        });

    } catch (error) {
        console.error("Local Media Upload Error:", error);
        res.status(500).json({ success: false, message: 'Failed to upload media', error: error.message });
    }
}

module.exports = {
    getMedia,
    deleteMedia,
    uploadMedia
};