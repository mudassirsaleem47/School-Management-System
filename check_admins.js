const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/adminSchema');

const checkAdmins = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const admins = await Admin.find({});
        console.log("Total Admins:", admins.length);
        admins.forEach(a => {
            console.log(`Admin: ${a.schoolName}, Email: ${a.email}, ID: ${a._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmins();
