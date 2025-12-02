const router = require('express').Router();
const upload = require('../middleware/uploadMiddleware');
const { adminRegister, adminLogin } = require('../controllers/admin-controller.js');
const { studentAdmission, getStudentsBySchool } = require('../controllers/student-controller.js');
const { enquiryCreate, enquiryList, enquiryDelete, enquiryUpdate } = require('../controllers/enquiry-controller.js');
const { sclassCreate, getSclassesBySchool, deleteSclass, addSection, deleteSection } = require('../controllers/sclass-controller.js');
const { addTeacher, getTeachersBySchool, updateTeacher, deleteTeacher, assignClassToTeacher, removeClassFromTeacher } = require('../controllers/teacher-controller.js');
const { visitorCreate, visitorList, visitorUpdate, visitorDelete } = require('../controllers/visitor-controller.js');
const { createComplain, getComplains, getComplainById, updateComplain, deleteComplain } = require('../controllers/complain-controller.js');
const { createPhoneCall, getPhoneCalls, getPhoneCallById, updatePhoneCall, deletePhoneCall } = require('../controllers/phonecall-controller.js');


// --- Admin Auth Routes ---
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogin);

// --- Student Routes ---
router.post('/StudentRegister', studentAdmission); 
router.get('/Students/:schoolId', getStudentsBySchool); 

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


module.exports = router;