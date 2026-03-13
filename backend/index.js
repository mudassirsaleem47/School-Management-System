const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    try {
        const parsed = new URL(origin);
        const host = parsed.hostname;

        if (host === 'localhost' || host === '127.0.0.1') return true;
        if (/^192\.168\./.test(host)) return true;
        if (host === 'hostingersite.com' || host.endsWith('.hostingersite.com')) return true;
        if (host === 'vercel.app' || host.endsWith('.vercel.app')) return true;

        return false;
    } catch (error) {
        return false;
    }
};

// Middleware
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
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

module.exports = app;
