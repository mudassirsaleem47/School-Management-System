const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Fee = require('../models/feeSchema.js');
const FeeStructure = require('../models/feeStructureSchema.js');
const MessageTemplate = require('../models/messageTemplateSchema.js');
const MessageLog = require('../models/messageLogSchema.js');
const EmailService = require('../services/emailService.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. New Student ka Admission
const studentAdmission = async (req, res) => {
    try {
        // Front-end se aane wala data
        const { rollNum, password, sclassName, school } = req.body;
        console.log("Students Admission Request Body:", JSON.stringify(req.body, null, 2)); // DEBUG LOG
        console.log("Students Admission Request Files:", req.files ? Object.keys(req.files) : "No files"); // DEBUG LOG

        // Check: Roll Number ya Email pehle se exist toh nahi karta? (Email check later)
        const studentExists = await Student.findOne({ rollNum, sclassName });
        if (studentExists) {
            return res.status(400).json({ message: "Roll Number already registered in this class." });
        }

        // Check: Class ID valid hai?
        const sclass = await Sclass.findById(sclassName).populate('classIncharge');
        if (!sclass) {
            return res.status(404).json({ message: "Class not found." });
        }
        
        // Password ko encrypt (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const studentPhoto = req.files && req.files['studentPhoto'] ? req.files['studentPhoto'][0].path : (req.body.studentPhotoUrl || "");
        const fatherPhoto = req.files && req.files['fatherPhoto'] ? req.files['fatherPhoto'][0].path : "";
        const motherPhoto = req.files && req.files['motherPhoto'] ? req.files['motherPhoto'][0].path : "";
        const guardianPhoto = req.files && req.files['guardianPhoto'] ? req.files['guardianPhoto'][0].path : "";

        // Parse JSON fields
        const father = req.body.father ? JSON.parse(req.body.father) : {};
        const mother = req.body.mother ? JSON.parse(req.body.mother) : {};
        const guardian = req.body.guardian ? JSON.parse(req.body.guardian) : {};
        const transport = req.body.transport ? JSON.parse(req.body.transport) : {};
        const siblings = req.body.siblings ? JSON.parse(req.body.siblings) : [];

        // Generate Admission Number (Format: [3 letters]-[4 digits])
        // We'll use "SMS" as the default prefix
        const prefix = "SMS";
        const studentCount = await Student.countDocuments({ school });
        const nextNumber = (studentCount + 1).toString().padStart(4, '0');
        const admissionNum = `${prefix}-${nextNumber}`;

        const newStudent = new Student({
            ...req.body,
            admissionNum, // Adding the auto-generated ID
            password: hashedPassword,
            studentPhoto,
            father: { ...father, photo: fatherPhoto },
            mother: { ...mother, photo: motherPhoto },
            guardian: { ...guardian, photo: guardianPhoto },
            transport,
            siblings
        });

        const result = await newStudent.save();

        // --- Admission Confirmation Email Logic ---
        try {
            const template = await MessageTemplate.findOne({ school: school, category: 'admission' });

            // Try to find an email address to send to
            const recipientEmail = result.email || result.father?.email || result.guardian?.email || result.mother?.email;

            if (template && recipientEmail) {
                let message = template.content;
                message = message.replace(/\{\{name\}\}/g, result.name || '');
                message = message.replace(/\{\{father\}\}/g, result.father?.name || '');
                message = message.replace(/\{\{class\}\}/g, sclass.sclassName || '');
                message = message.replace(/\{\{section\}\}/g, result.section || '');
                message = message.replace(/\{\{phone\}\}/g, result.mobileNumber || result.father?.phone || '');
                message = message.replace(/\{\{email\}\}/g, recipientEmail || '');
                message = message.replace(/\{\{password\}\}/g, password || '');
                message = message.replace(/\{\{roll_number\}\}/g, result.rollNum || '');
                message = message.replace(/\{\{login_url\}\}/g, 'http://localhost:5173/login');
                message = message.replace(/\{\{school\}\}/g, sclass.school?.schoolName || 'Your School');

                const emailResult = await EmailService.sendEmail(school, {
                    to: recipientEmail,
                    subject: template.name || 'Admission Confirmation',
                    text: message
                });

                const log = new MessageLog({
                    recipient: {
                        studentId: result._id,
                        name: result.name,
                        phone: result.mobileNumber || result.father?.phone,
                        email: recipientEmail,
                        group: 'student'
                    },
                    content: message,
                    messageType: 'email',
                    templateId: template._id,
                    status: emailResult.success ? 'sent' : 'failed',
                    error: emailResult.success ? null : emailResult.error,
                    school: school
                });

                if (emailResult.success) {
                    log.deliveredAt = new Date();
                }
                await log.save();
                console.log(`✅ Admission confirmation email sent to ${recipientEmail}`);
            }
        } catch (emailErr) {
            console.error(`❌ Error sending admission email:`, emailErr.message);
        }

        // --- Fee Assignment Logic ---
        const feeStructureIds = req.body.feeStructureIds ? JSON.parse(req.body.feeStructureIds) : [];
        if (feeStructureIds.length > 0) {
            for (const feeStructureId of feeStructureIds) {
                try {
                    const feeStructure = await FeeStructure.findById(feeStructureId);
                    if (feeStructure) {
                        const newFee = new Fee({
                            student: result._id,
                            school: school,
                            feeStructure: feeStructureId,
                            totalAmount: feeStructure.amount,
                            paidAmount: 0,
                            pendingAmount: feeStructure.amount,
                            dueDate: feeStructure.dueDate,
                            academicYear: feeStructure.academicYear
                        });
                        await newFee.save();
                        console.log(`✅ Fee ${feeStructure.feeName} assigned to student ${result.name}`);
                    }
                } catch (feeErr) {
                    console.error(`❌ Error assigning fee ${feeStructureId}:`, feeErr.message);
                }
            }
        }

        // Auto-assign student to class incharge
        if (sclass.classIncharge) {
            const teacher = await Teacher.findById(sclass.classIncharge);
            if (teacher) {
                // Check agar class pehle se assigned nahi hai to add karo
                if (!teacher.assignedClasses.includes(sclassName)) {
                    teacher.assignedClasses.push(sclassName);
                    await teacher.save();
                    console.log(`✅ Class ${sclass.sclassName} assigned to teacher ${teacher.name}`);
                }
            }
        }

        res.status(201).json({ 
            message: "Student admitted successfully!",
            studentId: result._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error during Admission.", error: err.message });
    }
};

const studentLogin = async (req, res) => {
    if (req.body.rollNum && req.body.studentName && req.body.password) {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validPassword = await bcrypt.compare(req.body.password, student.password);
            if (validPassword) {
                const token = jwt.sign(
                    { id: student._id, role: 'Student', schoolId: student.school },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                student.password = undefined;
                res.status(200).json({ ...student.toObject(), token });
            } else {
                res.status(400).json({ message: "Invalid Password" });
            }
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } else {
        res.status(400).json({ message: "All fields are required (Name, Roll Number, Password)" });
    }
};

// 2. Student List Fetch karna (School ID ke hisab se)
const getStudentsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { session } = req.query; // Expect optional session query param

        let query = { school: schoolId, status: "Active" };
        if (session) {
            query.session = session;
        }

        // Find students belonging to this school ID
        // .populate('sclassName') se class ka poora data bhi saath mein aa jayega
        const students = await Student.find(query)
            .populate('sclassName')
            .populate('session'); // Populate session details if needed

        if (students.length === 0) {
            return res.status(200).json([]);
        }

        // Security: Password ko response se hata diya
        const safeStudents = students.map(student => {
            const { password, ...rest } = student.toObject();
            return rest;
        });

        res.status(200).json(safeStudents);

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error while fetching students.", error: err.message });
    }
};

// 3. Disabled Student List Fetch karna
const getDisabledStudents = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const students = await Student.find({ school: schoolId, status: "Disabled" })
            .populate('sclassName')
            .populate('disableInfo.disabledBy', 'schoolName');

        if (students.length === 0) {
            return res.status(200).json([]);
        }

        const safeStudents = students.map(student => {
            const { password, ...rest } = student.toObject();
            return rest;
        });

        res.status(200).json(safeStudents);

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error while fetching disabled students.", error: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const updateData = { ...req.body };

        const safeParse = (value, fallback) => {
            if (typeof value !== 'string') return value ?? fallback;
            const trimmed = value.trim();
            if (!trimmed) return fallback;
            try {
                return JSON.parse(trimmed);
            } catch (_) {
                return fallback;
            }
        };

        // Multipart form fields for nested objects arrive as JSON strings.
        // Parse only when keys are present to avoid overwriting existing data on partial updates.
        if (Object.prototype.hasOwnProperty.call(updateData, 'father')) {
            updateData.father = safeParse(updateData.father, {});
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'mother')) {
            updateData.mother = safeParse(updateData.mother, {});
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'guardian')) {
            updateData.guardian = safeParse(updateData.guardian, {});
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'transport')) {
            updateData.transport = safeParse(updateData.transport, {});
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'siblings')) {
            updateData.siblings = safeParse(updateData.siblings, []);
        }

        if (updateData.rollNum !== undefined && updateData.rollNum !== '') {
            updateData.rollNum = Number(updateData.rollNum);
        }

        if (updateData.campus === '') delete updateData.campus;
        if (updateData.session === '') delete updateData.session;
        if (updateData.studentPhotoUrl) {
            updateData.studentPhoto = updateData.studentPhotoUrl;
            delete updateData.studentPhotoUrl;
        }

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }

        if (req.files) {
            if (req.files['studentPhoto']) updateData.studentPhoto = req.files['studentPhoto'][0].path;
            if (req.files['fatherPhoto']) updateData.father = { ...updateData.father, photo: req.files['fatherPhoto'][0].path };
            if (req.files['motherPhoto']) updateData.mother = { ...updateData.mother, photo: req.files['motherPhoto'][0].path };
            if (req.files['guardianPhoto']) updateData.guardian = { ...updateData.guardian, photo: req.files['guardianPhoto'][0].path };
        }

        // If status is being changed to 'Disabled', handle disable info
        if (updateData.status === 'Disabled') {
            if (!updateData.disableInfo || !updateData.disableInfo.reason) {
                return res.status(400).json({
                    message: "Disable reason is required when disabling a student"
                });
            }
            if (!updateData.disableInfo.disabledDate) {
                updateData.disableInfo.disabledDate = new Date();
            }
        } else if (updateData.status === 'Active') {
            // If re-enabling student, clear disable info
            updateData.disableInfo = {
                reason: null,
                description: null,
                disabledDate: null,
                disabledBy: null
            };
        }

        const result = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        ).populate('sclassName').populate('disableInfo.disabledBy', 'schoolName');

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error updating student", error: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        await Student.findByIdAndDelete(studentId);
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student", error: err.message });
    }
};

const promoteStudents = async (req, res) => {
    try {
        const { studentIds, nextClassId } = req.body;

        if (!studentIds || !nextClassId) {
            return res.status(400).json({ message: "Student IDs and Next Class ID are required" });
        }

        const result = await Student.updateMany(
            { _id: { $in: studentIds } },
            { $set: { sclassName: nextClassId } }
        );

        // Auto-assign new class to teacher if applicable
        const sclass = await Sclass.findById(nextClassId);
        if (sclass && sclass.classIncharge) {
            const teacher = await Teacher.findById(sclass.classIncharge);
            if (teacher && !teacher.assignedClasses.includes(nextClassId)) {
                teacher.assignedClasses.push(nextClassId);
                await teacher.save();
            }
        }

        res.send({ message: "Students promoted successfully", result });
    } catch (err) {
        res.status(500).json(err);
    }
};

// 5. Student By ID fetch karna
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).populate('sclassName');

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { password, ...rest } = student.toObject();
        res.status(200).json(rest);
    } catch (err) {
        res.status(500).json({ message: "Error fetching student", error: err.message });
    }
};

module.exports = { studentAdmission, studentLogin, getStudentsBySchool, getStudentById, updateStudent, deleteStudent, getDisabledStudents, promoteStudents };