const mongoose = require('mongoose');
require('dotenv').config();
const Campus = require('./models/campusSchema');

const checkCampuses = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017/school_management";
        await mongoose.connect(mongoUrl);
        const campuses = await Campus.find({});
        console.log("Total Campuses:", campuses.length);
        campuses.forEach(c => {
            console.log(`Campus: ${c.campusName}, Code: ${c.campusCode}, ID: ${c._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCampuses();
