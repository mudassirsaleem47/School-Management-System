const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('./models/teacherSchema');

async function debugTeacherLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://mongodb:27017/school-management');
        console.log('✅ Connected to MongoDB\n');

        // Get a teacher from database
        const teacher = await Teacher.findOne({ email: 'adil@test.com' });
        
        if (!teacher) {
            console.log('❌ Teacher not found with email: adil@test.com');
            console.log('\n📋 All teachers in database:');
            const allTeachers = await Teacher.find({}, { name: 1, email: 1 });
            allTeachers.forEach(t => console.log(`  - ${t.name}: ${t.email}`));
            process.exit(1);
        }

        console.log('✅ Teacher found!');
        console.log('Name:', teacher.name);
        console.log('Email:', teacher.email);
        console.log('Password Hash:', teacher.password);
        console.log('Hash Length:', teacher.password.length);
        console.log('Hash starts with:', teacher.password.substring(0, 7));
        
        // Test common passwords
        console.log('\n🔐 Testing passwords:');
        const testPasswords = ['test123', 'adil123', 'password', '123456', 'teacher123', 'adil'];
        
        for (const pwd of testPasswords) {
            const isValid = await bcrypt.compare(pwd, teacher.password);
            console.log(`  Password "${pwd}": ${isValid ? '✅ MATCH!' : '❌ No match'}`);
            if (isValid) {
                console.log(`\n🎉 FOUND IT! Use password: "${pwd}"`);
            }
        }
        
        // Create a test hash to verify bcrypt is working
        console.log('\n🧪 Bcrypt Test:');
        const testHash = await bcrypt.hash('test123', 10);
        const testVerify = await bcrypt.compare('test123', testHash);
        console.log('Bcrypt working:', testVerify ? '✅ YES' : '❌ NO');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

debugTeacherLogin();