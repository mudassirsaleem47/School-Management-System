const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/studentSchema');

// MongoDB connection - using correct database name
mongoose.connect('mongodb://school-mongodb:27017/school-management');

// Muslim names for students
const muslimNames = [
    { first: 'Muhammad', last: 'Ahmed' },
    { first: 'Ali', last: 'Hassan' },
    { first: 'Fatima', last: 'Khan' },
    { first: 'Ayesha', last: 'Ali' },
    { first: 'Omar', last: 'Farooq' },
    { first: 'Zainab', last: 'Hussain' },
    { first: 'Ibrahim', last: 'Malik' },
    { first: 'Maryam', last: 'Siddiqui' },
    { first: 'Usman', last: 'Raza' },
    { first: 'Khadija', last: 'Noor' },
    { first: 'Bilal', last: 'Sheikh' },
    { first: 'Aisha', last: 'Iqbal' },
    { first: 'Hamza', last: 'Yousaf' },
    { first: 'Hafsa', last: 'Zahid' },
    { first: 'Talha', last: 'Aziz' },
    { first: 'Ruqayyah', last: 'Rehman' },
    { first: 'Zubair', last: 'Akram' },
    { first: 'Safiya', last: 'Nawaz' },
    { first: 'Saad', last: 'Tariq' },
    { first: 'Amina', last: 'Jamil' }
];

// Father names
const fatherNames = [
    'Abdul Rahman', 'Muhammad Saleem', 'Ahmed Ali', 'Hassan Mahmood',
    'Farooq Ahmad', 'Hussain Shah', 'Malik Riaz', 'Siddique Ahmed',
    'Raza Khan', 'Noor Muhammad', 'Sheikh Akbar', 'Iqbal Hussain',
    'Yousaf Ali', 'Zahid Mehmood', 'Aziz Ahmed', 'Rehman Malik',
    'Akram Shah', 'Nawaz Sharif', 'Tariq Jameel', 'Jamil Ahmed'
];

async function addMuslimStudents() {
    try {
        // School ID from user's database
        const schoolId = '69527427c48cfd29c702ecf7';
        
        // First, let's find an existing class
        const Sclass = require('./models/sclassSchema');
        
        // Convert string to ObjectId
        const ObjectId = mongoose.Types.ObjectId;
        const schoolObjectId = new ObjectId(schoolId);
        
        const existingClass = await Sclass.findOne({ school: schoolObjectId });
        
        if (!existingClass) {
            console.log('❌ No class found for this school.');
            console.log('Available classes:');
            const allClasses = await Sclass.find({});
            console.log(allClasses);
            process.exit(1);
        }
        
        const classId = existingClass._id;
        console.log(`✅ Using class: ${existingClass.sclassName} (${classId})`);
        console.log('Starting to add 20 Muslim students...\n');

        const salt = await bcrypt.genSalt(10);
        
        for (let i = 0; i < 20; i++) {
            const student = muslimNames[i];
            const hashedPassword = await bcrypt.hash('student123', salt);
            
            const newStudent = new Student({
                name: `${student.first} ${student.last}`,
                firstName: student.first,
                lastName: student.last,
                rollNum: 1000 + i + 1,
                password: hashedPassword,
                sclassName: classId,
                section: 'A',
                school: schoolId,
                status: 'Active',
                gender: i % 2 === 0 ? 'Male' : 'Female',
                dateOfBirth: new Date(2010 + (i % 5), i % 12, (i % 28) + 1),
                religion: 'Islam',
                category: 'General',
                mobileNumber: `0300${Math.floor(1000000 + Math.random() * 9000000)}`,
                email: `${student.first.toLowerCase()}.${student.last.toLowerCase()}@student.com`,
                admissionDate: new Date(2024, 0, 1),
                bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
                father: {
                    name: fatherNames[i],
                    phone: `0321${Math.floor(1000000 + Math.random() * 9000000)}`,
                    occupation: ['Businessman', 'Teacher', 'Engineer', 'Doctor', 'Lawyer'][i % 5]
                }
            });

            await newStudent.save();
            console.log(`✅ Added: ${newStudent.name} (Roll: ${newStudent.rollNum})`);
        }

        console.log('\n🎉 Successfully added 20 Muslim students!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding students:', error);
        process.exit(1);
    }
}

addMuslimStudents();
