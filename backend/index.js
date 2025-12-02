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
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Basic Route (Check karne ke liye ke server chal raha hai ya nahi)
app.get("/", (req, res) => {
    res.send("School Management System Backend is Working!");
});

app.use('/', routes);

// Database Connection aur Server Start
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ Database Connection Error:", err);
    });
