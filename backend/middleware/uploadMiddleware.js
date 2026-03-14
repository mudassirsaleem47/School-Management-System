const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// --- Helper for filename sanitization ---
const sanitizeToken = (value) => {
    if (!value) return '';
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
};

let storage;

// --- Support Cloudinary Persistent Storage (Best for Vercel/Production) ---
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            const schoolToken = sanitizeToken(req.body?.schoolId || req.body?.school || req.params?.schoolId || req.query?.schoolId);
            return {
                folder: 'school_management_system',
                allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
                resource_type: 'auto',
                public_id: `${schoolToken ? schoolToken + '_' : ''}${Date.now()}_${Math.round(Math.random() * 1e9)}`,
                tags: schoolToken ? [schoolToken, 'sms_upload'] : ['sms_upload'],
                context: {
                    schoolId: schoolToken || 'unknown',
                    originalName: file.originalname
                }
            };
        }
    });

    console.log("✅ Upload Storage: Using Cloudinary Storage");
} else {
    // --- Local Disk Storage Fallback (Mainly for Local Development) ---
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // Skip directory creation on Vercel (Read-only filesystem)
    if (!process.env.VERCEL) {
        if (!fs.existsSync(uploadsDir)) {
            try {
                fs.mkdirSync(uploadsDir, { recursive: true });
            } catch (err) {
                console.error("Warning: Failed to create local uploads directory:", err.message);
            }
        }
    }

    storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            // Use /tmp on Vercel if disk storage is forced (Note: /tmp is NOT persistent)
            cb(null, process.env.VERCEL ? '/tmp' : uploadsDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase();
            const base = path.basename(file.originalname || 'file', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
            const schoolToken = sanitizeToken(req.body?.schoolId || req.body?.school || req.params?.schoolId);
            const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const prefix = schoolToken ? `${schoolToken}_` : '';
            cb(null, `${prefix}${base}_${stamp}${ext}`);
        },
    });

    console.log(`✅ Upload Storage: Using Local Disk Storage (${process.env.VERCEL ? '/tmp' : 'uploads/'})`);
}

// --- Common Multer Config ---
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images and PDFs are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;