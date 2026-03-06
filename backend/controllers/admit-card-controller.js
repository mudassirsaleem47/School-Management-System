const ExamSchedule = require('../models/examScheduleSchema');
const Student = require('../models/studentSchema');
const Admin = require('../models/adminSchema');

const getAdmitCardData = async (req, res) => {
    try {
        const { schoolId, examGroupId, classId } = req.params;

        // Fetch School Info
        const school = await Admin.findById(schoolId).select('schoolName address schoolLogo');

        // Fetch Students of the specified class
        const students = await Student.find({ school: schoolId, sclassName: classId })
            .populate('sclassName', 'sclassName')
            .populate('section', 'name')
            .sort({ rollNum: 1 });

        // Fetch Exam Schedule for the specified exam group and class
        const examSchedule = await ExamSchedule.find({
            school: schoolId,
            examGroup: examGroupId,
            class: classId
        }).sort({ examDate: 1 });

        // If no schedule found, return empty or error
        // But let's return it anyway so it can render an empty table
        
        res.status(200).json({
            school,
            students,
            examSchedule // Add this to the response
        });
    } catch (error) {
        console.error("Error fetching admit card data:", error);
        res.status(500).json({ message: "Failed to fetch admit card data", error: error.message });
    }
};

module.exports = {
    getAdmitCardData
};
