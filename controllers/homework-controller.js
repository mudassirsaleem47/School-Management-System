const Homework = require('../models/homeworkSchema');
const Student = require('../models/studentSchema');
const Notification = require('../models/notification');

const buildSchoolQuery = (query = {}) => {
    const filter = {};

    if (query.classId) filter.classId = query.classId;
    if (query.section) filter.section = query.section;
    if (query.status) filter.status = query.status;
    if (query.campus) filter.campus = query.campus;

    if (query.startDate || query.endDate) {
        filter.dueDate = {};
        if (query.startDate) filter.dueDate.$gte = new Date(query.startDate);
        if (query.endDate) filter.dueDate.$lte = new Date(query.endDate);
    }

    return filter;
};

const createHomework = async (req, res) => {
    try {
        const { schoolId, classId, subject, title, dueDate } = req.body;

        if (!schoolId || !classId || !subject || !title || !dueDate) {
            return res.status(400).json({
                message: 'schoolId, classId, subject, title and dueDate are required'
            });
        }

        const homework = new Homework({
            ...req.body,
            createdByModel: req.body.createdByModel || 'admin',
            status: req.body.status || 'Assigned'
        });

        const saved = await homework.save();
        const populated = await Homework.findById(saved._id)
            .populate('classId', 'sclassName')
            .populate('campus', 'name')
            .populate('createdBy', 'name email')
            .populate('completions.studentId', 'name rollNum');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHomeworkBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const filter = {
            schoolId,
            ...buildSchoolQuery(req.query)
        };

        const homework = await Homework.find(filter)
            .populate('classId', 'sclassName')
            .populate('campus', 'name')
            .populate('createdBy', 'name email')
            .populate('completions.studentId', 'name rollNum')
            .sort({ dueDate: 1, createdAt: -1 });

        res.status(200).json(homework);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHomeworkByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).select('school sclassName section campus');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const sectionFilter = [
            { section: student.section || '' },
            { section: '' },
            { section: { $exists: false } },
            { section: null }
        ];

        const campusFilter = student.campus
            ? [{ campus: student.campus }, { campus: { $exists: false } }, { campus: null }]
            : [{ campus: { $exists: false } }, { campus: null }];

        const homework = await Homework.find({
            schoolId: student.school,
            classId: student.sclassName,
            status: 'Assigned',
            $and: [
                { $or: sectionFilter },
                { $or: campusFilter }
            ]
        })
            .populate('classId', 'sclassName')
            .sort({ dueDate: 1, createdAt: -1 });

        const studentHomework = homework.map((item) => {
            const obj = item.toObject();
            obj.studentCompleted = (item.completions || []).some(
                (c) => String(c.studentId) === String(studentId)
            );
            return obj;
        });

        res.status(200).json(studentHomework);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markHomeworkCompletion = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const { completed = true } = req.body || {};

        const student = await Student.findById(studentId).select('school sclassName section campus');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const homework = await Homework.findById(id);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        if (
            String(homework.schoolId) !== String(student.school) ||
            String(homework.classId) !== String(student.sclassName)
        ) {
            return res.status(403).json({ message: 'Student cannot update this homework' });
        }

        const existingIndex = (homework.completions || []).findIndex(
            (c) => String(c.studentId) === String(studentId)
        );

        if (completed) {
            if (existingIndex === -1) {
                homework.completions.push({ studentId, completedAt: new Date() });
            } else {
                homework.completions[existingIndex].completedAt = new Date();
            }
        } else if (existingIndex !== -1) {
            homework.completions.splice(existingIndex, 1);
        }

        await homework.save();

        res.status(200).json({
            message: completed ? 'Homework marked completed' : 'Homework marked pending',
            studentCompleted: completed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendOverdueHomeworkReminders = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { classId, section } = req.body || {};

        const homeworkFilter = {
            schoolId,
            status: 'Assigned',
            dueDate: { $lt: new Date() }
        };

        if (classId) homeworkFilter.classId = classId;
        if (section) homeworkFilter.section = section;

        const overdueHomework = await Homework.find(homeworkFilter)
            .select('title subject dueDate classId section campus completions schoolId');

        if (!overdueHomework.length) {
            return res.status(200).json({
                message: 'No overdue homework found',
                notificationsCreated: 0,
                studentsNotified: 0,
                assignmentsChecked: 0
            });
        }

        const notifications = [];
        const notifiedStudents = new Set();

        for (const hw of overdueHomework) {
            const studentQuery = {
                school: hw.schoolId,
                sclassName: hw.classId,
                status: 'Active'
            };

            if (hw.section) {
                studentQuery.section = hw.section;
            }

            if (hw.campus) {
                studentQuery.campus = hw.campus;
            }

            const students = await Student.find(studentQuery).select('_id');
            const completedSet = new Set((hw.completions || []).map((c) => String(c.studentId)));
            const pendingStudents = students.filter((student) => !completedSet.has(String(student._id)));

            if (!pendingStudents.length) continue;

            const dueDateText = hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : 'unknown date';

            for (const student of pendingStudents) {
                notifiedStudents.add(String(student._id));
                notifications.push({
                    userId: student._id,
                    message: `Overdue homework reminder: ${hw.subject} - ${hw.title} (due ${dueDateText}).`,
                    type: 'warning',
                    relatedEntity: {
                        entityType: 'other',
                        entityId: hw._id
                    },
                    timestamp: new Date()
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json({
            message: 'Overdue reminders processed successfully',
            notificationsCreated: notifications.length,
            studentsNotified: notifiedStudents.size,
            assignmentsChecked: overdueHomework.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateHomework = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Homework.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('classId', 'sclassName')
            .populate('campus', 'name')
            .populate('createdBy', 'name email')
            .populate('completions.studentId', 'name rollNum');

        if (!updated) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteHomework = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Homework.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        res.status(200).json({ message: 'Homework deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createHomework,
    getHomeworkBySchool,
    getHomeworkByStudent,
    markHomeworkCompletion,
    sendOverdueHomeworkReminders,
    updateHomework,
    deleteHomework
};