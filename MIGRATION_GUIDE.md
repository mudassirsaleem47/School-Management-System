# Teacher to Staff Migration Guide

## Purpose
This script migrates existing teachers from the old `teacher` collection to the new unified `staff` collection.

## Prerequisites
✅ Backend server should be stopped
✅ Database backup recommended
✅ New Staff model deployed

## How to Run

### Step 1: Backup Database (IMPORTANT!)
```powershell
# Optional but HIGHLY recommended
# Create a backup of your MongoDB database before running migration
```

### Step 2: Run Migration Script
```powershell
cd backend
node migrate-teachers.js
```

### Step 3: Verify Migration
1. Check the console output for success/error count
2. Go to `/admin/staff` page
3. Filter by "Teachers" - all migrated teachers should appear
4. Verify data is correct (names, emails, subjects, etc.)

## What Gets Migrated

| Old Teacher Field | New Staff Field | Notes |
|------------------|-----------------|-------|
| `name` | `name` | Direct copy |
| `email` | `email` | Used to check duplicates |
| `password` | `password` | Hashed password preserved |
| `teacherPhone` | `phone` | Contact number |
| `teachSubject` | `subject` | Teaching subject |
| `teachQualification` | `qualification` | Education |
| `teachSclass` | `assignedClasses` | Array of class IDs |
| `school` | `school` | School reference |
| - | `role` | Set to 'Teacher' |
| `createdAt` | `joiningDate` | Original creation date |
| - | `status` | Set to 'active' |

## Safety Features

✅ **Duplicate Check**: Won't migrate if email already exists in Staff
✅ **Error Handling**: Shows which teachers failed with error messages
✅ **Summary Report**: Displays success/failure counts
✅ **Non-destructive**: Original teacher records remain untouched

## After Migration

1. ✅ Verify all teachers in Staff Management
2. ✅ Test that teachers can log in (if staff login is implemented)
3. ⚠️  **DO NOT DELETE** old teacher records until fully verified
4. 🔄 Update any code references from Teacher to Staff model

## Troubleshooting

### Duplicate Email Error
- Some teacher already exists in Staff with same email
- Check Staff Management to verify
- Skip or manually resolve

### Connection Error
- Check `.env` file has correct `MONGO_URL`
- Ensure MongoDB is running
- Check network connection

### Permission Error
- Ensure you have write access to database
- Run with appropriate permissions

## Rollback (If Needed)

If migration has issues:
1. Stop using Staff Management
2. Delete migrated staff records (optional)
3. Continue using old Teachers page
4. Fix issues and re-run migration

---

**Created by**: Multi-Role System Implementation
**Date**: 2025-12-27
