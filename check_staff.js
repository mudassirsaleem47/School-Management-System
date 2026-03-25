const mongoose = require('mongoose');
require('dotenv').config();
require('./models/adminSchema');
require('./models/campusSchema');
const Staff = require('./models/staffSchema');

const checkStaff = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const staff = await Staff.find({ designation: 'Principal' }).populate('school').populate('campus');
        console.log("Total Principals:", staff.length);
        staff.forEach(s => {
            console.log(`Principal: ${s.name}, Email: ${s.email}, Status: ${s.status}, SchoolID: ${s.school?._id}, CampusID: ${s.campus?._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStaff();
