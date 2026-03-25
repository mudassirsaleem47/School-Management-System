const Designation = require('../models/designationSchema.js');
const Staff = require('../models/staffSchema.js');

// Create new designation
const createDesignation = async (req, res) => {
    try {
        const { name, description, school, isActive } = req.body;

        // Validate required fields
        if (!name || !school) {
            return res.status(400).json({
                success: false,
                message: 'Name and school are required'
            });
        }

        // Check if designation with same name already exists for this school
        const existingDesignation = await Designation.findOne({ name, school });
        if (existingDesignation) {
            return res.status(400).json({
                success: false,
                message: 'Designation with this name already exists'
            });
        }

        // Create designation
        const newDesignation = new Designation({
            name,
            description,
            school,
            isActive: isActive || 'active'
        });

        await newDesignation.save();

        res.status(201).json({
            success: true,
            message: 'Designation created successfully',
            designation: newDesignation
        });
    } catch (error) {
        console.error('Error creating designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating designation',
            error: error.message
        });
    }
};

// Get all designations for a school
const getDesignationsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const designations = await Designation.find({ school: schoolId })
            .populate('school', 'schoolName')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: designations.length,
            designations
        });
    } catch (error) {
        console.error('Error fetching designations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching designations',
            error: error.message
        });
    }
};

// Update designation
const updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Don't allow changing school
        delete updateData.school;
        delete updateData._id;

        const designation = await Designation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('school', 'schoolName');

        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Designation updated successfully',
            designation
        });
    } catch (error) {
        console.error('Error updating designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating designation',
            error: error.message
        });
    }
};

// Delete designation
const deleteDesignation = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any staff is assigned to this designation
        const staffCount = await Staff.countDocuments({ designation: id });
        if (staffCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete designation. ${staffCount} staff member(s) are assigned to this designation.`
            });
        }

        const designation = await Designation.findByIdAndDelete(id);

        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Designation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting designation',
            error: error.message
        });
    }
};

module.exports = {
    createDesignation,
    getDesignationsBySchool,
    updateDesignation,
    deleteDesignation
};
