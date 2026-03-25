const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Models
const Teacher = require("./models/teacherSchema");
const Admin = require("./models/adminSchema");
const Sclass = require("./models/sclassSchema");

dotenv.config();

const firstNames = [
    "Muhammad", "Ahmed", "Ali", "Hassan", "Hussain", "Fatima", "Ayesha", "Zainab", "Omar", "Usman", "Abubakar",
    "Hamza", "Bilal", "Talha", "Saad", "Ammar", "Yusuf", "Ibrahim", "Musa", "Isa", "Maryam", "Khadija",
    "Hafsa", "Asma", "Sana", "Hira", "Saba", "Nida", "Zara", "Sara"
];

const lastNames = [
    "Khan", "Ali", "Ahmed", "Raza", "Hussain", "Iqbal", "Malik", "Chaudhry", "Butt", "Sheikh", "Qureshi",
    "Siddiqui", "Farooq", "Baig", "Mirza", "Shah", "Gilani", "Abbasi", "Jutt", "Cheema", "Bajwa", "Rehman",
    "Akram", "Aslam", "Aziz", "Bhatti", "Lashari", "Memon", "Soomro", "Zafar"
];

const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu", "Islamiyat", "Computer Science", "Pakistan Studies", "History"
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateTeachers = async (schoolId, sclassId) => {
    const teachers = [];
    const hashedPassword = await bcrypt.hash("123456", 10);

    for (let i = 1; i <= 12; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        
        teachers.push({
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}_teacher@example.com`,
            password: hashedPassword,
            phone: `0300${Math.floor(1000000 + Math.random() * 9000000)}`,
            subject: getRandomElement(subjects),
            qualification: "Masters",
            experience: Math.floor(Math.random() * 10) + 1, // 1-10 years
            salary: 30000 + Math.floor(Math.random() * 50000), // 30k-80k
            school: schoolId,
            assignedClasses: sclassId ? [sclassId] : [],
            role: "Teacher",
            joiningDate: new Date()
        });
    }
    return teachers;
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Connected");

        // 1. Fetch School (Admin)
        const school = await Admin.findOne();
        if (!school) {
            console.error("❌ No School (Admin) found! Log in as Admin first to create one.");
            process.exit(1);
        }
        console.log(`Found School: ${school.schoolName}`);

        // 2. Fetch Class (Sclass) - Optional but good for assigning
        const sclass = await Sclass.findOne({ school: school._id });
        if (sclass) {
             console.log(`Found Class to assign: ${sclass.sclassName}`);
        }

        // 3. Generate Data
        const teacherData = await generateTeachers(school._id, sclass ? sclass._id : null);

        // 4. Insert
        await Teacher.insertMany(teacherData);
        console.log("✅ Successfully inserted 12 teachers with Pakistani Islamic names!");

    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seed();
