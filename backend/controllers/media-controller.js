const fs = require('fs');
const path = require('path');
const Admin = require('../models/adminSchema.js');
const Student = require('../models/studentSchema.js');
const Complain = require('../models/complainSchema.js');
const CardTemplate = require('../models/cardTemplateSchema.js');
const Visitor = require('../models/visitorSchema.js');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const normalizePath = (value) => (value || '').replace(/\\/g, '/');

const toRelativeUploadPath = (value) => {
    const normalized = normalizePath(value);
    const marker = '/uploads/';
    const markerIndex = normalized.indexOf(marker);

    if (markerIndex >= 0) {
        return `uploads/${normalized.slice(markerIndex + marker.length)}`;
    }

    if (normalized.startsWith('uploads/')) return normalized;
    return normalized;
};

const toPublicUrl = (req, relativePath) => {
    const normalized = normalizePath(relativePath);
    const withoutLeadingSlash = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    return `${req.protocol}://${req.get('host')}/${withoutLeadingSlash}`;
};

const fileStatsToMedia = (req, relativePath) => {
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
            const allFiles = fs.readdirSync(uploadsDir);
            allFiles
                .filter((name) => name.startsWith(`${schoolId}_`))
                .forEach((name) => allowedPaths.add(`uploads/${name}`));
        }

        const media = Array.from(allowedPaths)
            .map((relativePath) => fileStatsToMedia(req, relativePath))
            .filter(Boolean)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
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
        const safeRelativePath = normalizePath(relativePath);
        if (!safeRelativePath.startsWith('uploads/')) {
            return res.status(400).json({ success: false, message: 'Invalid file path' });
        }

        const absolutePath = path.join(__dirname, '..', safeRelativePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
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

        const relativePath = `uploads/${req.file.filename}`;

        res.status(200).json({ 
            success: true, 
            message: 'File uploaded successfully',
            media: {
                url: toPublicUrl(req, relativePath),
                public_id: relativePath,
                format: req.file.mimetype.split('/')[1] || 'unknown',
                created_at: new Date().toISOString(),
                bytes: req.file.size || 0,
                resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
                filename: req.file.filename,
                schoolId: schoolId || null,
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