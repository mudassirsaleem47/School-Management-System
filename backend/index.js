const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes/route");

// Config setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Data samajhne ke liye)
app.use(express.json());
// CORS configuration for local network access
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://192.168.10.5:5173',  // Old IP
        'http://192.168.10.21:5173'  // Your local network IP
    ],
    credentials: true
}));
app.use('/uploads', express.static('uploads'));

// Basic Route (Check karne ke liye ke server chal raha hai ya nahi)
app.get("/", (req, res) => {
    res.send("School Management System Backend is Working!");
});

app.use('/', routes);

const transportRoutes = require("./routes/transportRoutes");
app.use('/Transport', transportRoutes);

const lessonPlanRoutes = require("./routes/lessonPlanRoutes");
app.use('/LessonPlan', lessonPlanRoutes);

const attendanceRoutes = require("./routes/attendanceRoutes");
app.use('/Attendance', attendanceRoutes);

// Database Connection aur Server Start
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server started on port ${PORT}`);
            console.log(`📱 Access from other devices: http://192.168.10.21:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ Database Connection Error:", err);
    });
