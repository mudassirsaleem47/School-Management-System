const Campus = require("../models/campusSchema");

// Create New Campus
const createCampus = async (req, res) => {
    try {
        const { campusName, campusCode, address, city, phoneNumber, email, school, isMain, principalName, totalCapacity } = req.body;

        // Check if campus code already exists
        const existingCampus = await Campus.findOne({ campusCode: campusCode.toUpperCase() });
        if (existingCampus) {
            return res.status(400).json({ 
                success: false, 
                message: "Campus code already exists" 
            });
        }

        // If this is set as main campus, unset other main campuses for this school
        if (isMain) {
            await Campus.updateMany(
                { school: school, isMain: true },
                { isMain: false }
            );
        }

        const newCampus = new Campus({
            campusName,
            campusCode: campusCode.toUpperCase(),
            address,
            city,
            phoneNumber,
            email,
            school,
            isMain,
            principalName,
            totalCapacity
        });

        await newCampus.save();

        res.status(201).json({
            success: true,
            message: "Campus created successfully",
            campus: newCampus
        });
    } catch (error) {
        console.error("Error creating campus:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create campus", 
            error: error.message 
        });
    }
};

// Get All Campuses for a School
const getCampusesBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const campuses = await Campus.find({ school: schoolId })
            .sort({ isMain: -1, createdAt: 1 }); // Main campus first, then by creation date

        res.status(200).json({
            success: true,
            count: campuses.length,
            campuses
        });
    } catch (error) {
        console.error("Error fetching campuses:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch campuses", 
            error: error.message 
        });
    }
};

// Get Single Campus by ID
const getCampusById = async (req, res) => {
    try {
        const { id } = req.params;

        const campus = await Campus.findById(id).populate('school', 'schoolName');

        if (!campus) {
            return res.status(404).json({ 
                success: false, 
                message: "Campus not found" 
            });
        }

        res.status(200).json({
            success: true,
            campus
        });
    } catch (error) {
        console.error("Error fetching campus:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch campus", 
            error: error.message 
        });
    }
};

// Update Campus
const updateCampus = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If campus code is being updated, check for duplicates
        if (updateData.campusCode) {
            const existingCampus = await Campus.findOne({ 
                campusCode: updateData.campusCode.toUpperCase(),
                _id: { $ne: id }
            });
            
            if (existingCampus) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Campus code already exists" 
                });
            }
            updateData.campusCode = updateData.campusCode.toUpperCase();
        }

        // If this is being set as main campus, unset other main campuses
        if (updateData.isMain) {
            const campus = await Campus.findById(id);
            await Campus.updateMany(
                { school: campus.school, isMain: true, _id: { $ne: id } },
                { isMain: false }
            );
        }

        const updatedCampus = await Campus.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCampus) {
            return res.status(404).json({ 
                success: false, 
                message: "Campus not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Campus updated successfully",
            campus: updatedCampus
        });
    } catch (error) {
        console.error("Error updating campus:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update campus", 
            error: error.message 
        });
    }
};

// Delete Campus
const deleteCampus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if campus has associated data (students, teachers, classes)
        const Student = require("../models/studentSchema");
        const Teacher = require("../models/teacherSchema");
        const Sclass = require("../models/sclassSchema");

        const [studentCount, teacherCount, classCount] = await Promise.all([
            Student.countDocuments({ campus: id }),
            Teacher.countDocuments({ campus: id }),
            Sclass.countDocuments({ campus: id })
        ]);

        if (studentCount > 0 || teacherCount > 0 || classCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete campus. It has ${studentCount} students, ${teacherCount} teachers, and ${classCount} classes.`,
                data: { studentCount, teacherCount, classCount }
            });
        }

        const deletedCampus = await Campus.findByIdAndDelete(id);

        if (!deletedCampus) {
            return res.status(404).json({ 
                success: false, 
                message: "Campus not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Campus deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting campus:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete campus", 
            error: error.message 
        });
    }
};

// Get Campus Statistics
const getCampusStats = async (req, res) => {
    try {
        const { id } = req.params;

        const Student = require("../models/studentSchema");
        const Staff = require("../models/staffSchema"); // Use Staff model instead of Teacher
        const Sclass = require("../models/sclassSchema");

        const [studentCount, teacherCount, classCount, campus] = await Promise.all([
            Student.countDocuments({ campus: id, status: 'Active' }),
            Staff.countDocuments({ campus: id, role: 'Teacher' }), // Count teachers from Staff model
            Sclass.countDocuments({ campus: id }),
            Campus.findById(id)
        ]);

        if (!campus) {
            return res.status(404).json({ 
                success: false, 
                message: "Campus not found" 
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalStudents: studentCount,
                totalTeachers: teacherCount,
                totalClasses: classCount,
                capacity: campus.totalCapacity,
                utilizationPercentage: campus.totalCapacity > 0 
                    ? Math.round((studentCount / campus.totalCapacity) * 100) 
                    : 0
            }
        });
    } catch (error) {
        console.error("Error fetching campus stats:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch campus statistics", 
            error: error.message 
        });
    }
};

module.exports = {
    createCampus,
    getCampusesBySchool,
    getCampusById,
    updateCampus,
    deleteCampus,
    getCampusStats
};