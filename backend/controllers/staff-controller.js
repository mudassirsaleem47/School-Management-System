const Staff = require('../models/staffSchema.js');
const bcrypt = require('bcryptjs');

// Create new staff member
const createStaff = async (req, res) => {
    try {
        const { name, email, password, phone, designation, school, campus, ...otherFields } = req.body;

        // Validate required fields
        if (!name || !email || !password || !designation || !school) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, designation, and school are required'
            });
        }

        // Check if email already exists
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create staff member
        const newStaff = new Staff({
            name,
            email,
            password: hashedPassword,
            phone,
            designation,
            role: designation, // Store designation in role field directly
            school,
            campus,
            ...otherFields
        });

        await newStaff.save();

        // Return without password
        const staffResponse = newStaff.toObject();
        delete staffResponse.password;

        res.status(201).json({
            success: true,
            message: `${designation} created successfully`,
            staff: staffResponse
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating staff member',
            error: error.message
        });
    }
};

// Get all staff members for a school
const getStaffBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { role, campus } = req.query;

        const filter = { school: schoolId };
        if (role) filter.role = role;
        if (campus) filter.campus = campus;

        const staff = await Staff.find(filter)
            .populate('school', 'schoolName email')
            .populate('campus', 'campusName campusCode')
            .populate('assignedClasses', 'sclassName')
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            staff
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff',
            error: error.message
        });
    }
};

// Get staff by ID
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await Staff.findById(id)
            .populate('school', 'schoolName email')
            .populate('campus', 'campusName campusCode')
            .populate('assignedClasses', 'sclassName')
            .select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            staff
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff member',
            error: error.message
        });
    }
};

// Update staff member
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Don't allow password update through this endpoint
        delete updateData.password;
        delete updateData._id;

        const staff = await Staff.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('school', 'schoolName email')
            .populate('campus', 'campusName campusCode')
            .select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Staff member updated successfully',
            staff
        });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating staff member',
            error: error.message
        });
    }
};

// Delete staff member
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await Staff.findByIdAndDelete(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting staff member',
            error: error.message
        });
    }
};

// Reset staff password
const resetStaffPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const staff = await Staff.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        ).select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// Staff login
const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find staff by email
        const staff = await Staff.findOne({ email })
            .populate('school', 'schoolName')
            .populate('campus', 'campusName');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if staff is active
        if (staff.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive. Please contact admin.'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, staff.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Return staff info without password
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            staff: staffResponse
        });
    } catch (error) {
        console.error('Error in staff login:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

module.exports = {
    createStaff,
    getStaffBySchool,
    getStaffById,
    updateStaff,
    deleteStaff,
    resetStaffPassword,
    staffLogin
};
