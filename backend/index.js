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
// CORS configuration for local network + Vercel deployments
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://192.168.10.4:5173',
            'http://192.168.10.21:5173',
            process.env.FRONTEND_URL,       // Deployed Frontend URL (from env)
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any *.vercel.app URL (production + preview deployments)
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
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
        if (require.main === module) {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server started on port ${PORT}`);
                console.log(`📱 Access from other devices: http://192.168.10.4:${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.log("❌ Database Connection Error:", err);
    });

module.exports = app;
