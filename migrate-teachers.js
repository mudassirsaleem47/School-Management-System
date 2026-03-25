/**
 * Migration Script: Migrate Teachers to Staff Collection
 * 
 * This script migrates all existing teachers from the 'teacher' collection
 * to the new 'staff' collection with role='Teacher'
 * 
 * Run this ONCE after deploying the new Staff model
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Teacher = require('./models/teacherSchema');
const Staff = require('./models/staffSchema');

const migrateTeachersToStaff = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');

        // Fetch all teachers
        const teachers = await Teacher.find({}).populate('school');
        console.log(`📚 Found ${teachers.length} teachers to migrate`);

        if (teachers.length === 0) {
            console.log('ℹ️  No teachers to migrate');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Migrate each teacher
        for (const teacher of teachers) {
            try {
                // Check if already migrated (by email)
                const existingStaff = await Staff.findOne({ email: teacher.email });
                
                if (existingStaff) {
                    console.log(`⏭️  Skipping ${teacher.name} - already exists in Staff`);
                    continue;
                }

                // Create new staff member from teacher
                const staffData = {
                    name: teacher.name,
                    email: teacher.email,
                    password: teacher.password, // Copy hashed password
                    phone: teacher.teacherPhone || '',
                    role: 'Teacher',
                    school: teacher.school,
                    
                    // Teacher-specific fields
                    subject: teacher.teachSubject || '',
                    qualification: teacher.teachQualification || '',
                    assignedClasses: teacher.teachSclass || [],
                    
                    // Common fields
                    joiningDate: teacher.createdAt || new Date(),
                    status: 'active'
                };

                const newStaff = new Staff(staffData);
                await newStaff.save();

                successCount++;
                console.log(`✅ Migrated: ${teacher.name} (${teacher.email})`);

            } catch (error) {
                errorCount++;
                errors.push({
                    teacher: teacher.name,
                    email: teacher.email,
                    error: error.message
                });
                console.error(`❌ Error migrating ${teacher.name}:`, error.message);
            }
        }

        // Summary
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully migrated: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(err => {
                console.log(`  - ${err.teacher} (${err.email}): ${err.error}`);
            });
        }

        console.log('\n✅ Migration completed!');
        console.log('\n⚠️  IMPORTANT: Review the migrated data in Staff Management before deleting old teachers');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run migration
migrateTeachersToStaff();
