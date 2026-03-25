const fs = require('fs');
const path = 'g:/School-Management-System - Copy/backend/controllers/student-controller.js';
let content = fs.readFileSync(path, 'utf8');

const newFunction = `
const getNextAdmissionNumber = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const prefix = "SMS";

        const lastStudent = await Student.findOne({ school: schoolId })
            .sort({ admissionNum: -1 })
            .select('admissionNum');

        let nextNumber = 1;
        if (lastStudent && lastStudent.admissionNum) {
            const lastNumStr = lastStudent.admissionNum.split('-')[1];
            if (lastNumStr) {
                const lastNum = parseInt(lastNumStr, 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        res.status(200).json({ nextAdmissionNum: \`\${prefix}-\${nextNumber.toString().padStart(4, '0')}\` });
    } catch (err) {
        res.status(500).json({ message: "Error fetching next admission number", error: err.message });
    }
};
`;

content = content.replace('module.exports = {', newFunction + '\nmodule.exports = {');
content = content.replace('promoteStudents };', 'promoteStudents, getNextAdmissionNumber };');

fs.writeFileSync(path, content);
console.log('Done');
