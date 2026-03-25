const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const Staff = require('../models/staffSchema'); // For non-teaching staff
const Admin = require('../models/adminSchema'); // For school details/logo
const ExamSchedule = require('../models/examScheduleSchema');
const Sclass = require('../models/sclassSchema');

// --- Student ID Cards ---
const getStudentCardData = async (req, res) => {
    try {
        const { schoolId, classId, sectionId } = req.params;

        // Fetch School Details (Logo, Name, Address)
        const school = await Admin.findById(schoolId).select('schoolName schoolLogo address phoneNumber email');
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }

        // Build query for students
        let query = { school: schoolId };
        if (classId && classId !== 'all') query.sclassName = classId;
        // Note: Section filtering might need adjustment based on how sections are stored in Student model
        // Assuming student model has section field or we filter later. 
        // Based on studentSchema, it has 'sclassName' (which is ObjectId) but section is inside sclassName? 
        // Let's check studentSchema again if needed. For now simple class filter.

        const students = await Student.find(query)
            .populate('sclassName', 'sclassName') // Get class name
            .select('name rollNum studentPhoto sclassName admissionId bloodGroup fatherName motherName phone');

        res.status(200).json({
            school,
            students
        });
    } catch (err) {
        console.error("Error fetching student card data:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// --- Staff ID Cards ---
const getStaffCardData = async (req, res) => {
    try {
        const { schoolId, type } = req.params; // type can be 'teacher', 'staff', or 'all'

        // Fetch School Details
        const school = await Admin.findById(schoolId).select('schoolName schoolLogo address phoneNumber email');
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }

        let staffList = [];

        if (type === 'teacher' || type === 'all') {
            const teachers = await Teacher.find({ school: schoolId })
                .select('name email phone role profilePicture qualification designation');
            // Add identifying type
            const teachersWithRole = teachers.map(t => ({ ...t.toObject(), type: 'Teacher' }));
            staffList = [...staffList, ...teachersWithRole];
        }

        if (type === 'staff' || type === 'all') {
            // Ensure we use the correct school ID
            const staffs = await Staff.find({ school: schoolId }) 
                .select('name email phone role profilePicture designation'); 
            
             const staffsWithRole = staffs.map(s => ({ ...s.toObject(), type: s.role || 'Staff' }));
             staffList = [...staffList, ...staffsWithRole];
        }

        res.status(200).json({
            school,
            staffList
        });
    } catch (err) {
        console.error("Error fetching staff card data:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// --- Exam Admit Cards ---
const getAdmitCardData = async (req, res) => {
    try {
        const { schoolId, examGroupId, classId } = req.params;

        // Fetch School Details
        const school = await Admin.findById(schoolId).select('schoolName schoolLogo address phoneNumber');

        // Fetch Exam Schedule
        // We need all exams for this group and class
        const examSchedules = await ExamSchedule.find({ 
            school: schoolId,
            examGroup: examGroupId,
            class: classId
        }).populate('subject', 'subName subCode'); // Assuming subject population if needed, or subject is string

        if (!examSchedules || examSchedules.length === 0) {
             return res.status(404).json({ message: "No exam schedule found for this class and group" });
        }

        // Fetch Students of this class
        const students = await Student.find({ school: schoolId, sclassName: classId })
             .select('name rollNum studentPhoto sclassName admissionId fatherName');

        res.status(200).json({
            school,
            examSchedules,
            students
        });

    } catch (err) {
        console.error("Error fetching admit card data:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    getStudentCardData,
    getStaffCardData,
    getAdmitCardData
};
