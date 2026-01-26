const router = require('express').Router();
const upload = require('../middleware/uploadMiddleware');
const { adminRegister, adminLogin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');
const { studentAdmission, getStudentsBySchool, updateStudent, deleteStudent, getDisabledStudents } = require('../controllers/student-controller.js');
const { enquiryCreate, enquiryList, enquiryDelete, enquiryUpdate } = require('../controllers/enquiry-controller.js');
const { sclassCreate, getSclassesBySchool, deleteSclass, addSection, deleteSection } = require('../controllers/sclass-controller.js');
const { addTeacher, getTeachersBySchool, updateTeacher, deleteTeacher, assignClassToTeacher, removeClassFromTeacher, teacherLogin } = require('../controllers/teacher-controller.js');
const { visitorCreate, visitorList, visitorUpdate, visitorDelete } = require('../controllers/visitor-controller.js');
const { createComplain, getComplains, getComplainById, updateComplain, deleteComplain } = require('../controllers/complain-controller.js');
const { createPhoneCall, getPhoneCalls, getPhoneCallById, updatePhoneCall, deletePhoneCall } = require('../controllers/phonecall-controller.js');
const { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, getUnreadCount } = require('../controllers/notification-controller.js');
const { createFeeStructure, getFeeStructuresBySchool, updateFeeStructure, deleteFeeStructure, assignFeeToStudents, getStudentFees, getPendingFees, collectFee, getFeeTransactions, getReceiptDetails, getFeeStatistics } = require('../controllers/fee-controller.js');
const { createIncome, getIncomeBySchool, updateIncome, deleteIncome, getIncomeStatistics } = require('../controllers/income-controller.js');
const { createExpense, getExpenseBySchool, updateExpense, deleteExpense, getExpenseStatistics } = require('../controllers/expense-controller.js');
const {
    createExamGroup, getExamGroupsBySchool, updateExamGroup, deleteExamGroup,
    createExamSchedule, getExamSchedulesByGroup, getExamSchedulesByClass, updateExamSchedule, deleteExamSchedule,
    createExamResult, getResultsByStudent, getResultsByExam, updateExamResult, deleteExamResult,
    createMarksGrade, getMarksGradesBySchool, updateMarksGrade, deleteMarksGrade,
    createMarksDivision, getMarksDivisionsBySchool, updateMarksDivision, deleteMarksDivision
} = require('../controllers/examination-controller.js');
const { createCampus, getCampusesBySchool, getCampusById, updateCampus, deleteCampus, getCampusStats } = require('../controllers/campus-controller.js');
const { createStaff, getStaffBySchool, getStaffById, updateStaff, deleteStaff, resetStaffPassword, staffLogin } = require('../controllers/staff-controller.js');
const { createDesignation, getDesignationsBySchool, updateDesignation, deleteDesignation } = require('../controllers/designation-controller.js');
const { createEvent, getEventsBySchool, getEventById, updateEvent, deleteEvent } = require('../controllers/event-controller.js');
const { createTask, getTasksBySchool, getTaskById, updateTask, deleteTask } = require('../controllers/task-controller.js');




// --- Admin Auth Routes ---
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogin);
router.get('/Admin/:id', getAdminDetail);
router.put('/Admin/:id', upload.single('schoolLogo'), updateAdmin);

// --- Student Routes ---
router.post('/StudentRegister', upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 }
]), studentAdmission);
router.get('/Students/:schoolId', getStudentsBySchool);
router.put('/Student/:id', upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 }
]), updateStudent);
router.delete('/Student/:id', deleteStudent);
router.get('/Students/Disabled/:schoolId', getDisabledStudents);

// --- SClass (Academic) Routes ---
router.post('/SclassCreate', sclassCreate);
router.get('/Sclasses/:schoolId', getSclassesBySchool);
router.delete('/Sclass/:id', deleteSclass);
router.put('/Sclass/:id/Section', addSection);
router.delete('/Sclass/:id/Section/:sectionId', deleteSection);

// --- Enquiry Routes ---
router.post('/EnquiryCreate', enquiryCreate);
router.get('/EnquiryList/:id', enquiryList);
router.delete('/EnquiryDelete/:id', enquiryDelete);
router.put('/EnquiryUpdate/:id', enquiryUpdate);

// --- Teacher Routes ---
router.post('/TeacherLogin', teacherLogin);
router.post('/TeacherRegister', addTeacher);
router.get('/Teachers/:schoolId', getTeachersBySchool);
router.put('/Teacher/:id', updateTeacher);
router.delete('/Teacher/:id', deleteTeacher);
router.put('/Teacher/:id/AssignClass', assignClassToTeacher);
router.delete('/Teacher/:id/Class/:classId', removeClassFromTeacher);


// --- Visitor Routes ---
router.post('/VisitorCreate', visitorCreate);
router.get('/Visitors/:schoolId', visitorList);
router.put('/Visitor/:id', visitorUpdate);
router.delete('/Visitor/:id', visitorDelete);

// --- Complain Routes ---
router.post('/ComplainCreate', upload.single('document'), createComplain);
router.get('/Complains/:schoolId', getComplains);
router.get('/Complain/:id', getComplainById);
router.put('/Complain/:id', upload.single('document'), updateComplain);
router.delete('/Complain/:id', deleteComplain);

// --- Phone Call Routes ---
router.post('/PhoneCallCreate', createPhoneCall);
router.get('/PhoneCalls/:schoolId', getPhoneCalls);
router.get('/PhoneCall/:id', getPhoneCallById);
router.put('/PhoneCall/:id', updatePhoneCall);
router.delete('/PhoneCall/:id', deletePhoneCall);

// --- Notification Routes ---
router.get('/Notifications/:userId', getNotifications);
router.post('/NotificationCreate', createNotification);
router.put('/Notification/:id/read', markAsRead);
router.put('/Notifications/read-all/:userId', markAllAsRead);
router.delete('/Notification/:id', deleteNotification);
router.delete('/Notifications/clear-all/:userId', clearAllNotifications);
router.get('/Notifications/:userId/unread-count', getUnreadCount);

// --- Fee Management Routes ---
router.post('/FeeStructureCreate', createFeeStructure);
router.get('/FeeStructures/:schoolId', getFeeStructuresBySchool);
router.put('/FeeStructure/:id', updateFeeStructure);
router.delete('/FeeStructure/:id', deleteFeeStructure);
router.post('/AssignFee', assignFeeToStudents);
router.get('/StudentFees/:studentId', getStudentFees);
router.get('/PendingFees/:schoolId', getPendingFees);
router.post('/CollectFee', collectFee);
router.get('/FeeTransactions/:schoolId', getFeeTransactions);
router.get('/FeeReceipt/:transactionId', getReceiptDetails);
router.get('/FeeStatistics/:schoolId', getFeeStatistics);

// --- Income Management Routes ---
router.post('/IncomeCreate', createIncome);
router.get('/Income/:schoolId', getIncomeBySchool);
router.put('/Income/:id', updateIncome);
router.delete('/Income/:id', deleteIncome);
router.get('/IncomeStatistics/:schoolId', getIncomeStatistics);

// --- Expense Management Routes ---
router.post('/ExpenseCreate', createExpense);
router.get('/Expense/:schoolId', getExpenseBySchool);
router.put('/Expense/:id', updateExpense);
router.delete('/Expense/:id', deleteExpense);
router.get('/ExpenseStatistics/:schoolId', getExpenseStatistics);

// --- Examination Management Routes ---
// Exam Groups
router.post('/ExamGroupCreate', createExamGroup);
router.get('/ExamGroups/:schoolId', getExamGroupsBySchool);
router.put('/ExamGroup/:id', updateExamGroup);
router.delete('/ExamGroup/:id', deleteExamGroup);

// Exam Schedules
router.post('/ExamScheduleCreate', createExamSchedule);
router.get('/ExamSchedules/Group/:groupId', getExamSchedulesByGroup);
router.get('/ExamSchedules/Class/:classId', getExamSchedulesByClass);
router.put('/ExamSchedule/:id', updateExamSchedule);
router.delete('/ExamSchedule/:id', deleteExamSchedule);

// Exam Results
router.post('/ExamResultCreate', createExamResult);
router.get('/ExamResults/Student/:studentId', getResultsByStudent);
router.get('/ExamResults/Exam/:scheduleId', getResultsByExam);
router.put('/ExamResult/:id', updateExamResult);
router.delete('/ExamResult/:id', deleteExamResult);

// Marks Grades
router.post('/MarksGradeCreate', createMarksGrade);
router.get('/MarksGrades/:schoolId', getMarksGradesBySchool);
router.put('/MarksGrade/:id', updateMarksGrade);
router.delete('/MarksGrade/:id', deleteMarksGrade);

// Marks Divisions
router.post('/MarksDivisionCreate', createMarksDivision);
router.get('/MarksDivisions/:schoolId', getMarksDivisionsBySchool);
router.put('/MarksDivision/:id', updateMarksDivision);
router.delete('/MarksDivision/:id', deleteMarksDivision);

// --- Campus Management Routes ---
router.post('/Campus', createCampus);
router.get('/Campuses/:schoolId', getCampusesBySchool);
router.get('/Campus/:id', getCampusById);
router.put('/Campus/:id', updateCampus);
router.delete('/Campus/:id', deleteCampus);
router.get('/CampusStats/:id', getCampusStats);


// --- Staff Management Routes ---
router.post('/StaffLogin', staffLogin);
router.post('/Staff', createStaff);
router.get('/Staff/:schoolId', getStaffBySchool);
router.get('/StaffDetail/:id', getStaffById);
router.put('/Staff/:id', updateStaff);
router.delete('/Staff/:id', deleteStaff);
router.put('/Staff/:id/resetPassword', resetStaffPassword);

// --- Designation Management Routes ---
router.post('/Designation', createDesignation);
router.get('/Designations/:schoolId', getDesignationsBySchool);
router.put('/Designation/:id', updateDesignation);
router.delete('/Designation/:id', deleteDesignation);

// --- Event Management Routes ---
router.post('/Event', createEvent);
router.get('/Events/:schoolId', getEventsBySchool);
router.get('/Event/:id', getEventById);
router.put('/Event/:id', updateEvent);
router.delete('/Event/:id', deleteEvent);

// --- Task Management Routes ---
router.post('/Task', createTask);
router.get('/Tasks/:schoolId', getTasksBySchool);
router.get('/Task/:id', getTaskById);
router.put('/Task/:id', updateTask);
router.delete('/Task/:id', deleteTask);


module.exports = router;