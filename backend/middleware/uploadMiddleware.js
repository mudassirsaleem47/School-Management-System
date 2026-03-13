const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const sanitizeToken = (value) => {
    if (!value) return '';
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
};

// Local disk storage for all uploads.
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
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

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and pdfs
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