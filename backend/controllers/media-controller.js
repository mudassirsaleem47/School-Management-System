const cloudinary = require('cloudinary').v2;
const Admin = require('../models/adminSchema.js');
const Student = require('../models/studentSchema.js');
const Complain = require('../models/complainSchema.js');
const CardTemplate = require('../models/cardTemplateSchema.js');
const Visitor = require('../models/visitorSchema.js');

const getMedia = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        let allowedUrls = new Set();
        
        // Fetch Admin Logo
        const admin = await Admin.findById(schoolId);
        if (admin && admin.schoolLogo) allowedUrls.add(admin.schoolLogo);
        
        // Fetch Students Photos
        const students = await Student.find({ school: schoolId });
        students.forEach(student => {
            if (student.studentPhoto) allowedUrls.add(student.studentPhoto);
            if (student.father?.photo) allowedUrls.add(student.father.photo);
            if (student.mother?.photo) allowedUrls.add(student.mother.photo);
            if (student.guardian?.photo) allowedUrls.add(student.guardian.photo);
        });

        // Fetch Complains Documents
        const complains = await Complain.find({ school: schoolId });
        complains.forEach(complain => {
            if (complain.document) allowedUrls.add(complain.document);
        });

        // Fetch Visitors Documents
        const visitors = await Visitor.find({ schoolId: schoolId });
        visitors.forEach(visitor => {
            if (visitor.document) allowedUrls.add(visitor.document);
        });

        // Fetch Card Templates
        const templates = await CardTemplate.find({ school: schoolId });
        templates.forEach(template => {
            if (template.backgroundImage) allowedUrls.add(template.backgroundImage);
        });

        let allResources = [];
        let nextCursor = null;

        // Fetch paginated until we get all resources in the specific folder
        do {
            const result = await cloudinary.search
                .expression('folder:school_management_system/*')
                .with_field('context')
                .with_field('tags')
                .max_results(500)
                .next_cursor(nextCursor)
                .execute();

            allResources = allResources.concat(result.resources);
            nextCursor = result.next_cursor;
        } while (nextCursor);

        // Map and Filter data to only include school specific files
        const media = allResources
            .filter(item => allowedUrls.has(item.secure_url) || (item.tags && item.tags.includes(schoolId)))
            .map(item => ({
                public_id: item.public_id,
                url: item.secure_url,
                format: item.format,
                created_at: item.created_at,
                bytes: item.bytes,
                width: item.width,
                height: item.height,
                resource_type: item.resource_type,
                filename: item.filename
            }));
        
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
        console.error("Cloudinary Get Media Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch media from Cloudinary', error });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const { public_id } = req.body;
        
        if (!public_id) {
            return res.status(400).json({ success: false, message: 'No public_id provided' });
        }

        const result = await cloudinary.uploader.destroy(public_id);
        
        if (result.result === 'ok') {
            // Unset schoolLogo from any Admin if the deleted image was the logo
            await Admin.updateMany(
                { schoolLogo: { $regex: public_id, $options: 'i' } }, 
                { $unset: { schoolLogo: '' } }
            );

            res.status(200).json({ success: true, message: 'Media deleted successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to delete media', result });
        }
    } catch (error) {
        console.error("Cloudinary Delete Media Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete media from Cloudinary', error });
    }
};

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
        
        const { schoolId } = req.body;

        // Tag the uploaded file with the schoolId for filtering later
        if (schoolId) {
            await cloudinary.uploader.add_tag(schoolId, [req.file.filename]);
        }

        // Return Cloudinary URL and details
        res.status(200).json({ 
            success: true, 
            message: 'File uploaded successfully',
            media: {
                url: req.file.path,
                public_id: req.file.filename,
                format: req.file.mimetype.split('/')[1] || 'unknown',
                created_at: new Date().toISOString(),
                bytes: req.file.size || 0 
            }
        });

    } catch (error) {
        console.error("Cloudinary Upload Media Error:", error);
        res.status(500).json({ success: false, message: 'Failed to upload media', error });
    }
}

module.exports = {
    getMedia,
    deleteMedia,
    uploadMedia
};