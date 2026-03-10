const Groq = require('groq-sdk');
const mongoose = require('mongoose');
const CODEBASE_SUMMARY = require('../../codebaseSummary');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Models to provide context if needed
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const Staff = require('../models/staffSchema');
const Sclass = require('../models/sclassSchema');
const FeeTransaction = require('../models/feeTransactionSchema');
const Enquiry = require('../models/enquirySchema');
const InventoryItem = require('../models/inventoryItemSchema');
const Campus = require('../models/campusSchema');
const Subject = require('../models/subjectSchema');
const TransportRoute = require('../models/transportRouteSchema');

const SYSTEM_PROMPT = `

**Codebase Technical Structure:**
Use this knowledge ONLY if the user asks for technical help or "Where is X feature implemented?":
${CODEBASE_SUMMARY}`;

async function getChatResponse(userQuery, schoolId, history = []) {
    try {
        // Fetch detailed stats for context if schoolId is provided
        let contextData = "";
        if (schoolId) {
            // Multi-query for maximum context
            const [
                studentCount, teacherCount, staffCount, classes,
                enquiryCount, feeStats, inventoryCount, campusCount,
                subjectCount, transportCount
            ] = await Promise.all([
                Student.countDocuments({ school: schoolId }).catch(() => 0),
                Teacher.countDocuments({ school: schoolId }).catch(() => 0),
                Staff.countDocuments({ school: schoolId }).catch(() => 0),
                Sclass.find({ school: schoolId }).limit(10).select('sclassName sections').catch(() => []),
                Enquiry.countDocuments({ school: schoolId }).catch(() => 0),
                FeeTransaction.aggregate([
                    { $match: { school: new mongoose.Types.ObjectId(schoolId), status: 'Active' } },
                    { $group: { _id: null, totalCollected: { $sum: "$amount" } } }
                ]).catch(() => []),
                InventoryItem.countDocuments({ school: schoolId }).catch(() => 0),
                Campus.countDocuments({ school: schoolId }).catch(() => 0),
                Subject.countDocuments({ school: schoolId }).catch(() => 0),
                TransportRoute.countDocuments({ school: schoolId }).catch(() => 0),
            ]);

            const totalCollected = feeStats.length > 0 ? feeStats[0].totalCollected : 0;
            
            contextData = `\n\n**School Data Context (VERY IMPORTANT - Use this for accuracy):**
            - Students: ${studentCount}
            - Teaching Staff: ${teacherCount}
            - Non-Teaching Staff: ${staffCount}
            - Total Fee Collected: Rs. ${totalCollected.toLocaleString()}
            - Active Enquiries: ${enquiryCount}
            - Inventory Stock (Items): ${inventoryCount}
            - Schools/Campuses: ${campusCount}
            - Total Subjects: ${subjectCount}
            - Transport Routes: ${transportCount}
            - Registered Classes: ${classes.map(c => c.sclassName).join(', ')}`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT + contextData },
                ...history,
                { role: "user", content: userQuery }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 1024,
        });

        return {
            success: true,
            response: chatCompletion.choices[0]?.message?.content || "No response from AI."
        };
    } catch (error) {
        console.error('Groq API Error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { getChatResponse };

