const dotenv = require("dotenv");
dotenv.config();

// Debug logs for environment (Safe because it's just keys existence check)
console.log("Environment Check:");
console.log("- PORT:", process.env.PORT || 5000);
console.log("- MONGO_URL:", process.env.MONGO_URL ? "Defined ✅" : "MISSING ❌");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Defined ✅" : "MISSING (Using Fallback) ⚠️");
console.log("- CLOUDINARY:", process.env.CLOUDINARY_CLOUD_NAME ? "Defined ✅" : "MISSING ❌");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/route");
const transportRoutes = require("./routes/transportRoutes");
const lessonPlanRoutes = require("./routes/lessonPlanRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const staffAttendanceRoutes = require("./routes/staffAttendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const designationRoutes = require("./routes/designationRoutes");
const issueItemRoutes = require("./routes/issueItemRoutes");
const inventoryItemRoutes = require("./routes/inventoryItemRoutes");
const itemMasterRoutes = require("./routes/itemMasterRoutes");
const itemCategoryRoutes = require("./routes/itemCategoryRoutes");
const itemSupplierRoutes = require("./routes/itemSupplierRoutes");
const itemStoreRoutes = require("./routes/itemStoreRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const isAllowedOrigin = (origin) => {
    return true; // DEBUG: Allow all temporarily to see the real 500 error
};

// Middleware
app.use(express.json());
app.use(cors({
    origin: true, // DEBUG: Allow all for preflight debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/", (req, res) => {
    res.send("School Management System Backend is Working!");
});

app.use('/', routes);
app.use('/Transport', transportRoutes);
app.use('/LessonPlan', lessonPlanRoutes);
app.use('/Attendance', attendanceRoutes);
app.use('/StaffAttendance', staffAttendanceRoutes);
app.use('/Payroll', payrollRoutes);
app.use('/Designation', designationRoutes);
app.use('/Inventory/IssueItem', issueItemRoutes);
app.use('/Inventory/Stock', inventoryItemRoutes);
app.use('/Inventory/Item', itemMasterRoutes);
app.use('/Inventory/Category', itemCategoryRoutes);
app.use('/Inventory/Supplier', itemSupplierRoutes);
app.use('/Inventory/Store', itemStoreRoutes);


// Database Connection
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
        if (require.main === module) {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server started on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.log("Database Connection Error:", err);
    });

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Uncaught Server Error:", err);
    res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: err.message
    });
});

module.exports = app;
