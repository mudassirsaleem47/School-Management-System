const mongoose = require('mongoose');
const Admin = require('./models/adminSchema');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        console.log("Connected to DB");
        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admins.`);
        
        for (const admin of admins) {
            console.log(`Admin ${admin.name} (${admin.email}): schoolLogo = ${admin.schoolLogo}`);
            if (admin.schoolLogo && !admin.schoolLogo.startsWith('http')) {
                console.log('  -> Found legacy/broken local path. Clearing it...');
                admin.schoolLogo = ""; // Clear it so frontend shows placeholder
                await admin.save();
                console.log('  -> Cleared.');
            }
        }
        await mongoose.connection.close(); // Close connection
        process.exit(0); // Ensure process exits
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
