const mongoose = require("mongoose");
const Student = require("./models/studentSchema");
const Admin = require("./models/adminSchema");
const Sclass = require("./models/sclassSchema");
const dotenv = require("dotenv");

dotenv.config();

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");

        const admin = await Admin.findOne();
        if (!admin) {
            console.error("No Admin/School found. Please create a school first.");
            process.exit(1);
        }

        const sclass = await Sclass.findOne({ school: admin._id });
        if (!sclass) {
            console.error("No Class found for this school. Please create a class first.");
            process.exit(1);
        }

        console.log(`Seeding students for School: ${admin.schoolName}, Class: ${sclass.sclassName}`);

        const students = [];
        const sections = ["A", "B", "C"];
        const genders = ["Male", "Female"];

        for (let i = 1; i <= 20; i++) {
            const gender = i % 2 === 0 ? "Female" : "Male";
            const avatarUrl = gender === "Male" 
                ? `https://avatar.iran.liara.run/public/boy?username=student${i}` 
                : `https://avatar.iran.liara.run/public/girl?username=student${i}`;

            students.push({
                name: `Student ${i}`,
                rollNum: 1000 + i,
                password: "password123",
                sclassName: sclass._id,
                school: admin._id,
                section: sections[i % 3], // Rotate sections
                role: "Student",
                studentPhoto: avatarUrl,
                father: {
                    name: `Father ${i}`,
                    phone: "1234567890",
                    occupation: "Engineer",
                },
                mother: {
                    name: `Mother ${i}`,
                    phone: "0987654321",
                    occupation: "Doctor",
                },
                email: `student${i}@example.com`,
                admissionDate: new Date(),
                gender: gender
            });
        }

        await Student.insertMany(students);
        console.log("Successfully added 20 students with images!");
        process.exit();
    } catch (error) {
        console.error("Error seeding students:", error);
        process.exit(1);
    }
};

seedStudents();
