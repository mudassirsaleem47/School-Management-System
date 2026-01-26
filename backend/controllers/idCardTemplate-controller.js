const IdCardTemplate = require('../models/idCardTemplateSchema.js');
const path = require('path');
const fs = require('fs');

// Create new ID card template
const createIdCardTemplate = async (req, res) => {
    try {
        const { school, templateName, templateType, dimensions, backgroundColor, fields, logoPosition, photoPosition } = req.body;

        // Validate required fields
        if (!school || !templateName || !templateType) {
            return res.status(400).json({
                success: false,
                message: 'School, template name, and template type are required'
            });
        }

        // Check if template with same name already exists for this school
        const existingTemplate = await IdCardTemplate.findOne({ school, templateName });
        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: 'Template with this name already exists'
            });
        }

        // Handle file upload if present
        let templateFile = '';
        if (req.file) {
            templateFile = req.file.path;
        }

        // Parse JSON strings from FormData
        let parsedDimensions = { width: 85.6, height: 53.98 };
        let parsedFields = [];
        let parsedLogoPosition = { x: 10, y: 10, width: 30, height: 30 };
        let parsedPhotoPosition = { x: 10, y: 50, width: 25, height: 30 };

        try {
            if (dimensions) parsedDimensions = typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions;
            if (fields) parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
            if (logoPosition) parsedLogoPosition = typeof logoPosition === 'string' ? JSON.parse(logoPosition) : logoPosition;
            if (photoPosition) parsedPhotoPosition = typeof photoPosition === 'string' ? JSON.parse(photoPosition) : photoPosition;
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format in request data',
                error: parseError.message
            });
        }

        // Create template
        const newTemplate = new IdCardTemplate({
            school,
            templateName,
            templateType,
            templateFile,
            dimensions: parsedDimensions,
            backgroundColor: backgroundColor || '#ffffff',
            fields: parsedFields,
            logoPosition: parsedLogoPosition,
            photoPosition: parsedPhotoPosition
        });

        await newTemplate.save();

        res.status(201).json({
            success: true,
            message: 'ID Card Template created successfully',
            template: newTemplate
        });
    } catch (error) {
        console.error('Error creating ID card template:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating ID card template',
            error: error.message
        });
    }
};

// Get all templates for a school
const getTemplatesBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { type } = req.query; // Optional filter by type

        let query = { school: schoolId, isActive: true };
        if (type) {
            query.templateType = type;
        }

        const templates = await IdCardTemplate.find(query)
            .populate('school', 'schoolName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: templates.length,
            templates
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching templates',
            error: error.message
        });
    }
};

// Get single template by ID
const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await IdCardTemplate.findById(id)
            .populate('school', 'schoolName');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            template
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template',
            error: error.message
        });
    }
};

// Update template
const updateIdCardTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Don't allow changing school
        delete updateData.school;
        delete updateData._id;

        // Parse JSON strings from FormData
        try {
            if (updateData.dimensions && typeof updateData.dimensions === 'string') {
                updateData.dimensions = JSON.parse(updateData.dimensions);
            }
            if (updateData.fields && typeof updateData.fields === 'string') {
                updateData.fields = JSON.parse(updateData.fields);
            }
            if (updateData.logoPosition && typeof updateData.logoPosition === 'string') {
                updateData.logoPosition = JSON.parse(updateData.logoPosition);
            }
            if (updateData.photoPosition && typeof updateData.photoPosition === 'string') {
                updateData.photoPosition = JSON.parse(updateData.photoPosition);
            }
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format in request data',
                error: parseError.message
            });
        }

        // Handle file upload if present
        if (req.file) {
            // Delete old file if exists
            const oldTemplate = await IdCardTemplate.findById(id);
            if (oldTemplate && oldTemplate.templateFile) {
                const oldFilePath = path.join(__dirname, '..', oldTemplate.templateFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updateData.templateFile = req.file.path;
        }

        const template = await IdCardTemplate.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('school', 'schoolName');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            template
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating template',
            error: error.message
        });
    }
};

// Delete template
const deleteIdCardTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await IdCardTemplate.findById(id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Delete associated file if exists
        if (template.templateFile) {
            const filePath = path.join(__dirname, '..', template.templateFile);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await IdCardTemplate.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting template',
            error: error.message
        });
    }
};

module.exports = {
    createIdCardTemplate,
    getTemplatesBySchool,
    getTemplateById,
    updateIdCardTemplate,
    deleteIdCardTemplate
};
