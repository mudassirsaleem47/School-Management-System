// AUTO-GENERATED — Do not edit manually
// Run: node generate-codebase-summary.js to regenerate

const CODEBASE_SUMMARY = `
## CODEBASE STRUCTURE

Total Files Scanned: 280
Generated: 10/03/2026, 11:06:54 am

### BACKEND CONTROLLERS

📁 backend/controllers/admin-controller.js
   Functions: Admin, adminRegister, adminLogin, getAdminDetail, updateAdmin, updateAdminSettings

📁 backend/controllers/admit-card-controller.js
   Functions: ExamSchedule, getAdmitCardData

📁 backend/controllers/ai-controller.js
   Functions: groqChat

📁 backend/controllers/campus-controller.js
   Functions: Campus, createCampus, getCampusesBySchool, getCampusById, updateCampus, deleteCampus, getCampusStats

📁 backend/controllers/card-controller.js
   Functions: Student, getStudentCardData, getStaffCardData, getAdmitCardData

📁 backend/controllers/card-template-controller.js
   Functions: CardTemplate, saveTemplate, getTemplates, deleteTemplate

📁 backend/controllers/class-schedule-controller.js
   Functions: ClassSchedule, createSchedule, getScheduleByClassSection, getTeacherSchedule, deleteSchedule

📁 backend/controllers/complain-controller.js
   Functions: Complain, createComplain, getComplains, getComplainById, updateComplain, deleteComplain

📁 backend/controllers/designation-controller.js
   Functions: Designation, createDesignation, getDesignationsBySchool, updateDesignation, deleteDesignation

📁 backend/controllers/enquiry-controller.js
   Functions: Enquiry, enquiryCreate, enquiryList, enquiryDelete, enquiryUpdate

📁 backend/controllers/event-controller.js
   Functions: Event, createEvent, getEventsBySchool, getEventById, updateEvent, deleteEvent

📁 backend/controllers/examination-controller.js
   Functions: ExamGroup, createExamGroup, getExamGroupsBySchool, updateExamGroup, deleteExamGroup, createExamSchedule, getExamSchedulesByGroup, getExamSchedulesByClass

📁 backend/controllers/expense-controller.js
   Functions: Expense, createExpense, getExpenseBySchool, updateExpense, deleteExpense, getExpenseStatistics

📁 backend/controllers/fee-controller.js
   Functions: FeeStructure, createFeeStructure, getFeeStructuresBySchool, updateFeeStructure, deleteFeeStructure, assignFeeToStudents, getStudentFees, getPendingFees

📁 backend/controllers/income-controller.js
   Functions: Income, createIncome, getIncomeBySchool, updateIncome, deleteIncome, getIncomeStatistics

📁 backend/controllers/media-controller.js
   Functions: cloudinary, getMedia, deleteMedia, uploadMedia

📁 backend/controllers/message-controller.js
   Functions: MessageTemplate, createMessageTemplate, getMessageTemplatesBySchool, updateMessageTemplate, deleteMessageTemplate, getMessageReports, sendMessages, sendBirthdayWishes

📁 backend/controllers/notification-controller.js
   Functions: Notification, getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, getUnreadCount

📁 backend/controllers/phonecall-controller.js
   Functions: PhoneCall, createPhoneCall, getPhoneCalls, getPhoneCallById, updatePhoneCall, deletePhoneCall

📁 backend/controllers/sclass-controller.js
   Functions: Sclass, sclassCreate, getSclassesBySchool, deleteSclass, addSection, deleteSection, updateSclass

📁 backend/controllers/session-controller.js
   Functions: Session, createSession, getSessionsBySchool, makeSessionActive, deleteSession, updateSession, getActiveSessionBySchool

📁 backend/controllers/staff-controller.js
   Functions: Staff, createStaff, getStaffBySchool, getStaffById, updateStaff, deleteStaff, resetStaffPassword, staffLogin

📁 backend/controllers/student-controller.js
   Functions: Student, studentAdmission, studentLogin, getStudentsBySchool, getDisabledStudents, updateStudent, deleteStudent, promoteStudents

📁 backend/controllers/subject-controller.js
   Functions: Subject, subjectCreate, allSubjects, getSubjectDetail, deleteSubject, deleteSubjects, updateSubject

📁 backend/controllers/subject-group-controller.js
   Functions: SubjectGroup, createSubjectGroup, getSubjectGroupsBySchool, updateSubjectGroup, deleteSubjectGroup

📁 backend/controllers/task-controller.js
   Functions: Task, createTask, getTasksBySchool, getTaskById, updateTask, deleteTask

📁 backend/controllers/teacher-controller.js
   Functions: Teacher, addTeacher, getTeachersBySchool, updateTeacher, deleteTeacher, assignClassToTeacher, removeClassFromTeacher, teacherLogin

📁 backend/controllers/visitor-controller.js
   Functions: Visitor, visitorCreate, visitorList, visitorUpdate, visitorDelete

### DATABASE MODELS (MongoDB/Mongoose)

📁 backend/models/adminSchema.js
   Model: admin
   Schema fields hint: mongoose

📁 backend/models/attendanceSchema.js
   Model: Attendance
   Schema fields hint: mongoose

📁 backend/models/campusSchema.js
   Model: campus
   Schema fields hint: mongoose

📁 backend/models/cardTemplateSchema.js
   Model: CardTemplate
   Schema fields hint: mongoose

📁 backend/models/classScheduleSchema.js
   Model: classSchedule
   Schema fields hint: mongoose

📁 backend/models/complainSchema.js
   Model: Complain
   Schema fields hint: mongoose

📁 backend/models/designationSchema.js
   Model: designation
   Schema fields hint: mongoose

📁 backend/models/enquirySchema.js
   Model: enquiry
   Schema fields hint: mongoose

📁 backend/models/eventSchema.js
   Model: event
   Schema fields hint: mongoose

📁 backend/models/examGroupSchema.js
   Model: ExamGroup
   Schema fields hint: mongoose

📁 backend/models/examResultSchema.js
   Model: ExamSchedule
   Schema fields hint: mongoose

📁 backend/models/examScheduleSchema.js
   Model: ExamSchedule
   Schema fields hint: mongoose

📁 backend/models/expenseSchema.js
   Model: Expense
   Schema fields hint: mongoose

📁 backend/models/feeSchema.js
   Model: fee
   Schema fields hint: mongoose

📁 backend/models/feeStructureSchema.js
   Model: feeStructure
   Schema fields hint: mongoose

📁 backend/models/feeTransactionSchema.js
   Model: feeTransaction
   Schema fields hint: mongoose

📁 backend/models/incomeSchema.js
   Model: Income
   Schema fields hint: mongoose

📁 backend/models/inventoryItemSchema.js
   Model: InventoryItem
   Schema fields hint: mongoose

📁 backend/models/issueItemSchema.js
   Model: IssueItem
   Schema fields hint: mongoose

📁 backend/models/itemCategorySchema.js
   Model: ItemCategory
   Schema fields hint: mongoose

📁 backend/models/itemMasterSchema.js
   Model: ItemMaster
   Schema fields hint: mongoose

📁 backend/models/itemStoreSchema.js
   Model: ItemStore
   Schema fields hint: mongoose

📁 backend/models/itemSupplierSchema.js
   Model: ItemSupplier
   Schema fields hint: mongoose

📁 backend/models/leaveSchema.js
   Model: Leave
   Schema fields hint: mongoose

📁 backend/models/lessonPlanSchema.js
   Model: LessonPlan
   Schema fields hint: mongoose

📁 backend/models/lessonSchema.js
   Model: Lesson
   Schema fields hint: mongoose

📁 backend/models/marksDivisionSchema.js
   Model: MarksDivision
   Schema fields hint: mongoose

📁 backend/models/marksGradeSchema.js
   Model: MarksGrade
   Schema fields hint: mongoose

📁 backend/models/messageLogSchema.js
   Model: MessageLog
   Schema fields hint: mongoose

📁 backend/models/messageTemplateSchema.js
   Model: MessageTemplate
   Schema fields hint: mongoose

📁 backend/models/messagingSettingsSchema.js
   Model: MessagingSettings
   Schema fields hint: mongoose

📁 backend/models/notification.js
   Model: notification
   Schema fields hint: mongoose

📁 backend/models/payrollSchema.js
   Model: Payroll
   Schema fields hint: mongoose

📁 backend/models/phoneCallSchema.js
   Model: PhoneCall
   Schema fields hint: mongoose

📁 backend/models/sclassSchema.js
   Model: sclass
   Schema fields hint: mongoose

📁 backend/models/sessionSchema.js
   Model: session
   Schema fields hint: mongoose

📁 backend/models/staffAttendanceSchema.js
   Model: StaffAttendance
   Schema fields hint: mongoose

📁 backend/models/staffSchema.js
   Model: staff
   Schema fields hint: mongoose

📁 backend/models/studentSchema.js
   Model: student
   Schema fields hint: mongoose

📁 backend/models/studentTransportSchema.js
   Model: StudentTransport
   Schema fields hint: mongoose

📁 backend/models/subjectGroupSchema.js
   Model: SubjectGroup
   Schema fields hint: mongoose

📁 backend/models/subjectSchema.js
   Model: subject
   Schema fields hint: mongoose

📁 backend/models/superAdminSchema.js
   Model: superadmin
   Schema fields hint: mongoose

📁 backend/models/taskSchema.js
   Model: task
   Schema fields hint: mongoose

📁 backend/models/teacherSchema.js
   Model: teacher
   Schema fields hint: mongoose

📁 backend/models/topicSchema.js
   Model: Topic
   Schema fields hint: mongoose

📁 backend/models/transportPickupPointSchema.js
   Model: TransportPickupPoint
   Schema fields hint: mongoose

📁 backend/models/transportRouteSchema.js
   Model: TransportRoute
   Schema fields hint: mongoose

📁 backend/models/transportRouteStopSchema.js
   Model: TransportRouteStop
   Schema fields hint: mongoose

📁 backend/models/transportVehicleSchema.js
   Model: TransportVehicle
   Schema fields hint: mongoose

📁 backend/models/visitorSchema.js
   Model: visitor
   Schema fields hint: mongoose

📁 backend/models/whatsappSessionSchema.js
   Model: WhatsAppSession
   Schema fields hint: mongoose

### API ROUTES

📁 backend/routes/attendanceRoutes.js
   POST /Mark
   GET /ForClass/:schoolId/:classId/:date
   GET /Student/:studentId
   POST /Report
   POST /Leave/Apply
   GET /Leave/List/:schoolId
   PUT /Leave/:id

📁 backend/routes/designationRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/inventoryItemRoutes.js
   POST /
   GET /:schoolId
   DELETE /:id

📁 backend/routes/issueItemRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/itemCategoryRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/itemMasterRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/itemStoreRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/itemSupplierRoutes.js
   POST /
   GET /:schoolId
   PUT /:id
   DELETE /:id

📁 backend/routes/lessonPlanRoutes.js
   POST /Lesson
   POST /Lesson/List
   PUT /Lesson/:id
   DELETE /Lesson/:id
   POST /Topic
   GET /Topic/:lessonId
   DELETE /Topic/:id
   POST /Plan
   POST /Plan/List
   PUT /Plan/:id
   DELETE /Plan/:id

📁 backend/routes/payrollRoutes.js
   GET /List/:schoolId/:monthYear
   POST /Generate
   PUT /Update/:id
   PUT /Pay/:id

📁 backend/routes/route.js
   POST /SessionCreate
   GET /Sessions/:schoolId
   GET /Sessions/Active/:schoolId
   PUT /Sessions/MakeActive
   PUT /Session/:id
   DELETE /Session/:id
   POST /AdminReg
   POST /AdminLogin
   POST /admin/login
   GET /Admin/:id
   PUT /Admin/:id
   PUT /Admin/Settings/:id
   POST /StudentLogin
   POST /student/login
   POST /StudentRegister
   GET /Students/:schoolId
   GET /Student/:id
   PUT /Student/:id
   DELETE /Student/:id
   GET /Students/Disabled/:schoolId
   PUT /Students/Promote
   POST /SclassCreate
   GET /Sclasses/:schoolId
   DELETE /Sclass/:id
   PUT /SclassUpdate/:id
   PUT /Sclass/:id/Section
   DELETE /Sclass/:id/Section/:sectionId
   POST /SubjectCreate
   GET /AllSubjects/:id
   GET /Subject/:id
   DELETE /Subject/:id
   DELETE /Subjects/:id
   PUT /Subject/:id
   POST /SubjectGroupCreate
   GET /SubjectGroups/:schoolId
   PUT /SubjectGroup/:id
   DELETE /SubjectGroup/:id
   POST /ScheduleCreate
   GET /Schedule/:classId/:sectionId
   GET /TeacherSchedule/:teacherId
   POST /EnquiryCreate
   GET /EnquiryList/:id
   DELETE /EnquiryDelete/:id
   PUT /EnquiryUpdate/:id
   POST /TeacherLogin
   POST /teacher/login
   POST /TeacherRegister
   GET /Teachers/:schoolId
   PUT /Teacher/:id
   DELETE /Teacher/:id
   PUT /Teacher/:id/AssignClass
   DELETE /Teacher/:id/Class/:classId
   POST /VisitorCreate
   GET /Visitors/:schoolId
   PUT /Visitor/:id
   DELETE /Visitor/:id
   POST /ComplainCreate
   GET /Complains/:schoolId
   GET /Complain/:id
   PUT /Complain/:id
   DELETE /Complain/:id
   POST /PhoneCallCreate
   GET /PhoneCalls/:schoolId
   GET /PhoneCall/:id
   PUT /PhoneCall/:id
   DELETE /PhoneCall/:id
   GET /Notifications/:userId
   POST /NotificationCreate
   PUT /Notification/:id/read
   PUT /Notifications/read-all/:userId
   DELETE /Notification/:id
   DELETE /Notifications/clear-all/:userId
   GET /Notifications/:userId/unread-count
   POST /FeeStructureCreate
   GET /FeeStructures/:schoolId
   PUT /FeeStructure/:id
   DELETE /FeeStructure/:id
   POST /AssignFee
   GET /StudentFees/:studentId
   GET /PendingFees/:schoolId
   POST /CollectFee
   GET /FeeTransactions/:schoolId
   DELETE /RevertTransaction/:transactionId
   GET /FeeReceipt/:transactionId
   GET /FeeStatistics/:schoolId
   POST /Fee/Remind/:id
   POST /IncomeCreate
   GET /Income/:schoolId
   PUT /Income/:id
   DELETE /Income/:id
   GET /IncomeStatistics/:schoolId
   POST /ExpenseCreate
   GET /Expense/:schoolId
   PUT /Expense/:id
   DELETE /Expense/:id
   GET /ExpenseStatistics/:schoolId
   POST /ExamGroupCreate
   GET /ExamGroups/:schoolId
   PUT /ExamGroup/:id
   DELETE /ExamGroup/:id
   POST /ExamScheduleCreate
   GET /ExamSchedules/Group/:groupId
   GET /ExamSchedules/Class/:classId
   PUT /ExamSchedule/:id
   DELETE /ExamSchedule/:id
   POST /ExamResultCreate
   GET /ExamResults/Student/:studentId
   GET /ExamResults/Exam/:scheduleId
   PUT /ExamResult/:id
   DELETE /ExamResult/:id
   POST /MarksGradeCreate
   GET /MarksGrades/:schoolId
   PUT /MarksGrade/:id
   DELETE /MarksGrade/:id
   POST /MarksDivisionCreate
   GET /MarksDivisions/:schoolId
   PUT /MarksDivision/:id
   DELETE /MarksDivision/:id
   POST /Campus
   GET /Campuses/:schoolId
   GET /Campus/:id
   PUT /Campus/:id
   DELETE /Campus/:id
   GET /CampusStats/:id
   POST /StaffLogin
   POST /staff/login
   POST /Staff
   GET /Staff/:schoolId
   GET /StaffDetail/:id
   PUT /Staff/:id
   DELETE /Staff/:id
   PUT /Staff/:id/resetPassword
   POST /Designation
   GET /Designations/:schoolId
   PUT /Designation/:id
   DELETE /Designation/:id
   POST /Event
   GET /Events/:schoolId
   GET /Event/:id
   PUT /Event/:id
   DELETE /Event/:id
   POST /Task
   GET /Tasks/:schoolId
   GET /Task/:id
   PUT /Task/:id
   DELETE /Task/:id
   POST /MessageTemplateCreate
   GET /MessageTemplates/:schoolId
   PUT /MessageTemplate/:id
   DELETE /MessageTemplate/:id
   POST /SendMessages
   POST /SendBirthdayWishes
   GET /MessageReports/:schoolId
   GET /MessagingSettings/:schoolId
   POST /EmailSettings
   POST /EmailSettings/Test
   POST /WhatsApp/Connect
   GET /WhatsApp/Status/:schoolId
   POST /WhatsApp/Disconnect
   GET /Card/Student/:schoolId
   GET /Card/Student/:schoolId/:classId
   GET /Card/Student/:schoolId/:classId/:sectionId
   GET /Card/Staff/:schoolId/:type
   GET /Card/Admit/:schoolId/:examGroupId/:classId
   POST /CardTemplate/save
   GET /CardTemplate/:schoolId
   DELETE /CardTemplate/:id
   GET /Media/:schoolId
   POST /MediaUpload
   POST /MediaDelete
   POST /AiChat/Groq
   GET /AdmitCardData/:schoolId/:examGroupId/:classId

📁 backend/routes/staffAttendanceRoutes.js
   POST /Mark
   GET /ForDate/:schoolId/:date
   GET /Summary/:schoolId/:from/:to

📁 backend/routes/transportRoutes.js
   POST /PickupPoint
   GET /PickupPoint/:schoolId
   DELETE /PickupPoint/:id
   POST /Route
   GET /Route/:schoolId
   PUT /Route/:id
   DELETE /Route/:id
   POST /Vehicle
   GET /Vehicle/:schoolId
   PUT /Vehicle/:id
   DELETE /Vehicle/:id
   POST /RouteStop
   GET /RouteStop/:routeId
   DELETE /RouteStop/:id
   POST /StudentTransport
   GET /StudentTransport/:schoolId
   DELETE /StudentTransport/:id

### FRONTEND PAGES
  • frontend/src/pages/Accountant/AccountantDashboard.jsx → API_BASE
  • frontend/src/pages/AccountantList.jsx → API_BASE
  • frontend/src/pages/AdminDashboard.jsx → AdminDashboard
  • frontend/src/pages/AdminLoginPage.jsx → AdminLoginPage
  • frontend/src/pages/AdminRegisterPage.jsx → REGISTER_URL
  • frontend/src/pages/AdmissionEnquiry.jsx → API_BASE
  • frontend/src/pages/Attendance/ApproveLeavePage.jsx → ApproveLeavePage
  • frontend/src/pages/Attendance/AttendanceByDatePage.jsx → AttendanceByDatePage
  • frontend/src/pages/Attendance/components/ApproveLeavePanel.jsx → API_BASE
  • frontend/src/pages/Attendance/components/AttendanceByDatePanel.jsx → API_BASE
  • frontend/src/pages/Attendance/components/StudentAttendancePanel.jsx → StudentAttendancePanel
  • frontend/src/pages/Attendance/StaffAttendancePage.jsx → API_BASE
  • frontend/src/pages/Attendance/StudentAttendancePage.jsx → StudentAttendancePage
  • frontend/src/pages/BirthdayWish.jsx → API_BASE
  • frontend/src/pages/CampusManagement.jsx → CampusManagement
  • frontend/src/pages/card-design/CardDesigner.jsx → DraggableElement
  • frontend/src/pages/card-design/CardRenderer.jsx → CardRenderer
  • frontend/src/pages/card-design/ReportCard.jsx → ReportCard
  • frontend/src/pages/card-design/StaffIdCard.jsx → StaffIdCard
  • frontend/src/pages/card-design/StudentIdCard.jsx → StudentIdCard
  • frontend/src/pages/ClassSchedule.jsx → API_BASE
  • frontend/src/pages/ComplainPage.jsx → API_BASE
  • frontend/src/pages/cursor.jsx → useCanvasCursor
  • frontend/src/pages/DesignationManagement.jsx → SortableCard
  • frontend/src/pages/DisabledStudents.jsx → API_BASE
  • frontend/src/pages/DisableReasonPage.jsx → DisableReasonPage
  • frontend/src/pages/ExamGroup.jsx → API_BASE
  • frontend/src/pages/examination/DesignAdmitCard.jsx → DesignAdmitCard
  • frontend/src/pages/examination/DesignMarkSheet.jsx → DesignMarkSheet
  • frontend/src/pages/examination/PrintAdmitCard.jsx → PrintAdmitCard
  • frontend/src/pages/examination/PrintMarkSheet.jsx → PrintMarkSheet
  • frontend/src/pages/ExamResult.jsx → API_BASE
  • frontend/src/pages/ExamSchedule.jsx → API_BASE
  • frontend/src/pages/ExpenseManagement.jsx → API_BASE
  • frontend/src/pages/FeeAssignment.jsx → API_BASE
  • frontend/src/pages/FeeCollection.jsx → API_BASE
  • frontend/src/pages/FeeManagement.jsx → API_BASE
  • frontend/src/pages/FeeReminder.jsx → API_BASE
  • frontend/src/pages/FeeReports.jsx → API_BASE
  • frontend/src/pages/HumanResource/DesignationManagement.jsx → API_BASE
  • frontend/src/pages/HumanResource/StaffPayrollPage.jsx → API_BASE
  • frontend/src/pages/IncomeManagement.jsx → API_BASE
  • frontend/src/pages/Inventory/AddItemStock.jsx → API_BASE
  • frontend/src/pages/Inventory/IssueItems.jsx → API_BASE
  • frontend/src/pages/Inventory/ItemCategory.jsx → API_BASE
  • frontend/src/pages/Inventory/ItemMaster.jsx → API_BASE
  • frontend/src/pages/Inventory/ItemStore.jsx → API_BASE
  • frontend/src/pages/Inventory/ItemSupplier.jsx → API_BASE
  • frontend/src/pages/LandingPage.jsx → features
  • frontend/src/pages/LessonPlan/components/LessonList.jsx → API_BASE
  • frontend/src/pages/LessonPlan/components/LessonPlanManager.jsx → API_BASE
  • frontend/src/pages/LessonPlan/components/SyllabusStatus.jsx → API_BASE
  • frontend/src/pages/LessonPlan/LessonPlanPage.jsx → LessonPlanPage
  • frontend/src/pages/LessonPlan/LessonTopics.jsx → LessonTopics
  • frontend/src/pages/LessonPlan/PlanManager.jsx → PlanManager
  • frontend/src/pages/LessonPlan/SyllabusTracker.jsx → SyllabusTracker
  • frontend/src/pages/LoginPage.jsx → LoginPage
  • frontend/src/pages/MarksDivision.jsx → API_BASE
  • frontend/src/pages/MarksGrade.jsx → API_BASE
  • frontend/src/pages/MediaManager.jsx → MediaManager
  • frontend/src/pages/MessageReport.jsx → MessageReport
  • frontend/src/pages/MessageTemplates.jsx → API_BASE
  • frontend/src/pages/NotFoundPage.jsx → NotFoundPage
  • frontend/src/pages/NotificationsPage.jsx → NotificationsPage
  • frontend/src/pages/Parent/ParentAttendance.jsx → ParentAttendance
  • frontend/src/pages/Parent/ParentFees.jsx → ParentFees
  • frontend/src/pages/Parent/ParentHomework.jsx → MOCK_HOMEWORK
  • frontend/src/pages/Parent/ParentReportCard.jsx → ParentReportCard
  • frontend/src/pages/ParentDashboard.jsx → ParentDashboard
  • frontend/src/pages/PhoneCallLog.jsx → API_BASE
  • frontend/src/pages/Promotion.jsx → API_BASE
  • frontend/src/pages/ReceptionistDashboard.jsx → API_BASE
  • frontend/src/pages/ReceptionistList.jsx → API_BASE
  • frontend/src/pages/ReportsPage.jsx → enrollmentConfig
  • frontend/src/pages/SendMessages.jsx → API_BASE
  • frontend/src/pages/SettingsProfile.jsx → API_BASE
  • frontend/src/pages/ShowClasses.jsx → API_BASE
  • frontend/src/pages/StaffDirectory.jsx → API_BASE
  • frontend/src/pages/StudentAdmission.jsx → StudentAdmission
  • frontend/src/pages/StudentDetailPage.jsx → API_BASE
  • frontend/src/pages/StudentFeeDetail.jsx → API_BASE
  • frontend/src/pages/StudentList.jsx → API_BASE
  • frontend/src/pages/SubjectGroupPage.jsx → API_BASE
  • frontend/src/pages/SubjectManagement.jsx → API_BASE
  • frontend/src/pages/TeacherDashboard.jsx → TeacherDashboard
  • frontend/src/pages/TeacherList.jsx → API_BASE
  • frontend/src/pages/TeacherSchedule.jsx → API_BASE
  • frontend/src/pages/Transport/components/StudentTransportPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportPickupPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportRoutePanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportStopPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportVehiclePanel.jsx → API_BASE
  • frontend/src/pages/Transport/TransportPage.jsx → TransportPage
  • frontend/src/pages/Transport/TransportPickupPage.jsx → TransportPickupPage
  • frontend/src/pages/Transport/TransportRoutesPage.jsx → TransportRoutesPage
  • frontend/src/pages/Transport/TransportStopsPage.jsx → TransportStopsPage
  • frontend/src/pages/Transport/TransportStudentsPage.jsx → TransportStudentsPage
  • frontend/src/pages/Transport/TransportVehiclesPage.jsx → TransportVehiclesPage
  • frontend/src/pages/VisitorBook.jsx → API_BASE

### FRONTEND COMPONENTS
  • frontend/src/pages/Attendance/components/ApproveLeavePanel.jsx → API_BASE
  • frontend/src/pages/Attendance/components/AttendanceByDatePanel.jsx → API_BASE
  • frontend/src/pages/Attendance/components/StudentAttendancePanel.jsx → StudentAttendancePanel
  • frontend/src/pages/LessonPlan/components/LessonList.jsx → API_BASE
  • frontend/src/pages/LessonPlan/components/LessonPlanManager.jsx → API_BASE
  • frontend/src/pages/LessonPlan/components/SyllabusStatus.jsx → API_BASE
  • frontend/src/pages/Transport/components/StudentTransportPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportPickupPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportRoutePanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportStopPanel.jsx → API_BASE
  • frontend/src/pages/Transport/components/TransportVehiclePanel.jsx → API_BASE
  • frontend/src/components/accountant-login-form.jsx → navigate
  • frontend/src/components/AdminLayout.jsx → AdminLayout
  • frontend/src/components/AiChatbot.jsx → AiChatbot
  • frontend/src/components/app-sidebar.jsx → adminNavData
  • frontend/src/components/CalendarDialog.jsx → CalendarDialog
  • frontend/src/components/CalendarModal.jsx → API_BASE
  • frontend/src/components/CampusSelector.jsx → CampusSelector
  • frontend/src/components/card-templates/AdmitCardLayout.jsx → AdmitCardLayout
  • frontend/src/components/card-templates/MarkSheetLayout.jsx → ones
  • frontend/src/components/DashboardCalendar.jsx → DashboardCalendar
  • frontend/src/components/form-popup/AssignClassModal.jsx → API_BASE
  • frontend/src/components/form-popup/CampusModal.jsx → CampusModal
  • frontend/src/components/form-popup/ComplainModal.jsx → ComplainModal
  • frontend/src/components/form-popup/ConfirmDeleteModal.jsx → ConfirmDeleteModal
  • frontend/src/components/form-popup/DesignationModal.jsx → DesignationModal
  • frontend/src/components/form-popup/DisableReasonModal.jsx → DisableReasonModal
  • frontend/src/components/form-popup/EnquiryModal.jsx → EnquiryModal
  • frontend/src/components/form-popup/EventFormModal.jsx → EventFormModal
  • frontend/src/components/form-popup/PhoneCallModal.jsx → PhoneCallModal
  • frontend/src/components/form-popup/StaffModal.jsx → StaffModal
  • frontend/src/components/form-popup/StudentAdmissionModal.jsx → StudentAdmissionModal
  • frontend/src/components/form-popup/StudentDetailsModal.jsx → StudentDetailsModal
  • frontend/src/components/form-popup/StudentModal.jsx → API_BASE
  • frontend/src/components/form-popup/TaskFormModal.jsx → API_BASE
  • frontend/src/components/form-popup/TeacherModal.jsx → TeacherModal
  • frontend/src/components/form-popup/VisitorModal.jsx → API_BASE
  • frontend/src/components/forms/StudentAdmissionForm.jsx → API_BASE
  • frontend/src/components/login-form.jsx → navigate
  • frontend/src/components/mode-toggle.jsx → isDark
  • frontend/src/components/nav-main.jsx → location
  • frontend/src/components/nav-user.jsx → isDark
  • frontend/src/components/NotificationCenter.jsx → NotificationCenter
  • frontend/src/components/parent-login-form.jsx → navigate
  • frontend/src/components/ProtectedRoute.jsx → ProtectedRoute
  • frontend/src/components/receptionist-login-form.jsx → navigate
  • frontend/src/components/register-form.jsx → REGISTER_URL
  • frontend/src/components/SearchBar.jsx → SearchBar
  • frontend/src/components/Sidebar-logo.jsx → SidebarLogo
  • frontend/src/components/TablePagination.jsx → TablePagination
  • frontend/src/components/TaskModal.jsx → API_BASE
  • frontend/src/components/teacher-login-form.jsx → navigate
  • frontend/src/components/team-switcher.jsx → navigate
  • frontend/src/components/theme-provider.jsx → initialState
  • frontend/src/components/Toast.jsx → Toast
  • frontend/src/components/ui/accordion.jsx → Accordion
  • frontend/src/components/ui/alert-dialog.jsx → AlertDialog
  • frontend/src/components/ui/alert.jsx → alertVariants
  • frontend/src/components/ui/avatar.jsx → Avatar
  • frontend/src/components/ui/badge.jsx → badgeVariants
  • frontend/src/components/ui/breadcrumb.jsx → Breadcrumb
  • frontend/src/components/ui/button.jsx → buttonVariants
  • frontend/src/components/ui/calendar.jsx → defaultClassNames
  • frontend/src/components/ui/card.jsx → Card
  • frontend/src/components/ui/chart.jsx → THEMES
  • frontend/src/components/ui/checkbox.jsx → Checkbox
  • frontend/src/components/ui/collapsible.jsx → Collapsible
  • frontend/src/components/ui/ColorPicker.jsx → PRESET_COLORS
  • frontend/src/components/ui/command.jsx → Command
  • frontend/src/components/ui/DatePicker.jsx → DatePicker
  • frontend/src/components/ui/dialog.jsx → Dialog
  • frontend/src/components/ui/drawer.jsx → Drawer
  • frontend/src/components/ui/dropdown-menu.jsx → DropdownMenu
  • frontend/src/components/ui/email-pass.jsx → requirements
  • frontend/src/components/ui/empty.jsx → emptyMediaVariants
  • frontend/src/components/ui/field.jsx → Field
  • frontend/src/components/ui/input.jsx → Input
  • frontend/src/components/ui/label.jsx → labelVariants
  • frontend/src/components/ui/MonthPicker.jsx → MonthPicker
  • frontend/src/components/ui/pagination.jsx → Pagination
  • frontend/src/components/ui/password.jsx → PASSWORD_REQUIREMENTS
  • frontend/src/components/ui/popover.jsx → Popover
  • frontend/src/components/ui/progress.jsx → Progress
  • frontend/src/components/ui/radio-group.jsx → RadioGroup
  • frontend/src/components/ui/rich-text-editor.jsx → ToolbarButton
  • frontend/src/components/ui/scroll-area.jsx → ScrollArea
  • frontend/src/components/ui/select.jsx → Select
  • frontend/src/components/ui/separator.jsx → Separator
  • frontend/src/components/ui/sheet.jsx → Sheet
  • frontend/src/components/ui/sidebar.jsx → SIDEBAR_COOKIE_NAME
  • frontend/src/components/ui/skeleton.jsx → Skeleton
  • frontend/src/components/ui/slider.jsx → Slider
  • frontend/src/components/ui/sonner.jsx → Toaster
  • frontend/src/components/ui/switch.jsx → Switch
  • frontend/src/components/ui/table.jsx → Table
  • frontend/src/components/ui/tabs.jsx → Tabs
  • frontend/src/components/ui/textarea.jsx → Textarea
  • frontend/src/components/ui/toggle.jsx → toggleVariants
  • frontend/src/components/ui/tooltip.jsx → TooltipProvider

`;

module.exports = CODEBASE_SUMMARY;
