const mongoose = require('mongoose');
require('dotenv').config();
require('./models/adminSchema');
require('./models/campusSchema');
const Staff = require('./models/staffSchema');

const checkAllStaff = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const staff = await Staff.find({}).populate('school').populate('campus');
        console.log("Total Staff:", staff.length);
        staff.forEach(s => {
            console.log(`Staff: ${s.name}, Role: ${s.role}, Designation: ${s.designation}, SchoolID: ${s.school?._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAllStaff();
