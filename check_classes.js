const mongoose = require('mongoose');
require('dotenv').config();
require('./models/adminSchema');
require('./models/campusSchema');
const Sclass = require('./models/sclassSchema');

const checkClasses = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const classes = await Sclass.find({}).populate('school').populate('campus');
        console.log("Total Classes:", classes.length);
        classes.forEach(c => {
            console.log(`Class: ${c.sclassName}, ClassID: ${c._id}, SchoolID: ${c.school?._id}, SchoolName: ${c.school?.schoolName}, CampusID: ${c.campus?._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkClasses();
