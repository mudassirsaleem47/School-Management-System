const Groq = require('groq-sdk');
const mongoose = require('mongoose');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bcrypt = require('bcryptjs');

// Import all models
const Sclass = require('../models/sclassSchema');
const Teacher = require('../models/teacherSchema');
const Student = require('../models/studentSchema');
const Staff = require('../models/staffSchema');
const Attendance = require('../models/attendanceSchema');
const FeeTransaction = require('../models/feeTransactionSchema');
const InventoryItem = require('../models/inventoryItemSchema');
const ExamSchedule = require('../models/examScheduleSchema');

const TOOLS = [
  // ── READ ──────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_students",
      description: "Get all students of the school",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_classes",
      description: "Get all classes (sclasses) of the school",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_teachers",
      description: "Get all teachers of the school",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_staff",
      description: "Get all staff members",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_fee_statistics",
      description: "Get fee collection statistics and summary",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_inventory_status",
      description: "Get current status of school inventory and stock items",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_attendance",
      description: "Get attendance for a class on a specific date",
      parameters: {
        type: "object",
        properties: {
          classId: { type: "string", description: "Class ID" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" }
        },
        required: ["classId", "date"]
      }
    }
  },

  // ── CREATE ────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_exam_schedules",
      description: "Get upcoming exam schedules and dates",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "create_class",
      description: "Create a new class in the school",
      parameters: {
        type: "object",
        properties: {
          sclassName: { type: "string", description: "Name of the class e.g. 'Class 5' or 'Grade 10'" },
          sectionName: { type: "string", description: "Name of the first section (default: A)" }
        },
        required: ["sclassName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_teacher",
      description: "Add a new teacher to the school",
      parameters: {
        type: "object",
        properties: {
          name:     { type: "string", description: "Full name of teacher" },
          email:    { type: "string", description: "Email address" },
          password: { type: "string", description: "Login password" },
          phone:    { type: "string", description: "Phone number" },
          subject:  { type: "string", description: "Subject taught" },
          qualification: { type: "string", description: "Educational qualification" },
          salary:   { type: "number", description: "Monthly salary" }
        },
        required: ["name", "email", "password", "phone", "subject", "qualification", "salary"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_student",
      description: "Admit/register a new student",
      parameters: {
        type: "object",
        properties: {
          name:       { type: "string", description: "Student full name" },
          rollNum:    { type: "number", description: "Roll number" },
          sclassName: { type: "string", description: "Class ID to enroll student in" },
          section:    { type: "string", description: "Section name (default: A)" },
          password:   { type: "string", description: "Login password" }
        },
        required: ["name", "rollNum", "sclassName", "password"]
      }
    }
  },

  // ── UPDATE ────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "update_class",
      description: "Rename or update an existing class",
      parameters: {
        type: "object",
        properties: {
          classId:    { type: "string", description: "ID of the class to update" },
          sclassName: { type: "string", description: "New name for the class" }
        },
        required: ["classId", "sclassName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_teacher",
      description: "Update teacher information",
      parameters: {
        type: "object",
        properties: {
          teacherId: { type: "string", description: "Teacher ID" },
          name:      { type: "string", description: "New name (optional)" },
          email:     { type: "string", description: "New email (optional)" }
        },
        required: ["teacherId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_student",
      description: "Update student information",
      parameters: {
        type: "object",
        properties: {
          studentId: { type: "string", description: "Student ID" },
          name:      { type: "string", description: "New name (optional)" },
          rollNum:   { type: "number", description: "New roll number (optional)" }
        },
        required: ["studentId"]
      }
    }
  },

  // ── DELETE ────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "delete_class",
      description: "Permanently delete a class from the school. MUST confirm with user first.",
      parameters: {
        type: "object",
        properties: {
          classId:   { type: "string", description: "ID of the class to delete" },
          className: { type: "string", description: "Name of class (for confirmation message)" }
        },
        required: ["classId", "className"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_teacher",
      description: "Remove a teacher from the school. MUST confirm with user first.",
      parameters: {
        type: "object",
        properties: {
          teacherId:   { type: "string", description: "Teacher ID" },
          teacherName: { type: "string", description: "Teacher name for confirmation" }
        },
        required: ["teacherId", "teacherName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_student",
      description: "Remove a student from the school. MUST confirm with user first.",
      parameters: {
        type: "object",
        properties: {
          studentId:   { type: "string", description: "Student ID" },
          studentName: { type: "string", description: "Student name for confirmation" }
        },
        required: ["studentId", "studentName"]
      }
    }
  },

  // ── CONFIRMATION ──────────────────────────────────────
  {
    type: "function",
    function: {
      name: "ask_confirmation",
      description: "Ask user to confirm a destructive action before executing it. Always call this before any delete operation.",
      parameters: {
        type: "object",
        properties: {
          action:  { type: "string", description: "What will happen e.g. 'Delete Class 5'" },
          details: { type: "string", description: "Extra info to show user" },
          pendingTool: { type: "string", description: "Tool name to run after confirmation" },
          pendingArgs: { type: "object", description: "Args to pass to pending tool" }
        },
        required: ["action", "pendingTool", "pendingArgs"]
      }
    }
  }
];

const groqChat = async (req, res) => {
  const { query, schoolId, confirmedAction } = req.body;

  const SYSTEM_PROMPT = `
You are an intelligent AI assistant for a School Management System (SaaS).
You have access to tools that can READ records and perform actions (CREATE, UPDATE, DELETE).

## OPERATIONAL GUIDELINES:
1. **Safety First**: Before any DELETE operation, you must ask the user for confirmation.
2. **Efficiency**: Use the available tools to get real data instead of guessing.
3. **Language**: Respond in the same language the user uses (Urdu Roman / English).
4. **Context**: Current School ID: ${schoolId}. Today: ${new Date().toLocaleDateString('en-PK')}.
5. **Confirmation**: If a user confirms a pending action ("yes", "kar do", etc.), execute it.
`;

  try {
    // If user confirmed a pending action, execute it directly
    if (confirmedAction) {
      const result = await executeTool(confirmedAction.tool, confirmedAction.args, schoolId);
      return res.json({ success: true, response: result.message, actionDone: true });
    }

    // Normal Groq call with tools
    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3-32b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: query }
      ],
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
    });

    const message = completion.choices[0].message;

    // If AI wants to call a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      // Confirmation requested — send to frontend
      if (toolName === 'ask_confirmation') {
        return res.json({
          success: true,
          response: `⚠️ **Confirm Action**\n\n**${toolArgs.action}**\n${toolArgs.details || ''}\n\nAre you sure? This action cannot be undone.`,
          requiresConfirmation: true,
          pendingAction: { tool: toolArgs.pendingTool, args: toolArgs.pendingArgs }
        });
      }

      // Execute the tool
      const result = await executeTool(toolName, toolArgs, schoolId);
      return res.json({ success: true, response: result.message });
    }

    // Plain text response
    return res.json({ success: true, response: message.content });

  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, response: 'Server error: ' + err.message });
  }
};

async function executeTool(toolName, args, schoolId) {
  try {
    switch (toolName) {
      // READ
      case 'get_students': {
        const students = await Student.find({ school: schoolId }).select('name rollNum sclassName').populate('sclassName', 'sclassName');
        if (students.length === 0) return { message: "No students found." };
        return { message: `📚 **Total Students: ${students.length}**\n\n` + students.map(s => `* ${s.name} (Roll: ${s.rollNum}, Class: ${s.sclassName?.sclassName || 'N/A'})`).join('\n') };
      }
      case 'get_classes': {
        const classes = await Sclass.find({ school: schoolId });
        if (classes.length === 0) return { message: "No classes found." };
        return { message: `🏫 **Total Classes: ${classes.length}**\n\n` + classes.map(c => `* ${c.sclassName} (ID: \`${c._id}\`)`).join('\n') };
      }
      case 'get_teachers': {
        const teachers = await Teacher.find({ school: schoolId }).select('name email');
        if (teachers.length === 0) return { message: "No teachers found." };
        return { message: `👩‍🏫 **Total Teachers: ${teachers.length}**\n\n` + teachers.map(t => `* ${t.name} — ${t.email}`).join('\n') };
      }
      case 'get_staff': {
        const staffList = await Staff.find({ school: schoolId }).select('name email role');
        if (staffList.length === 0) return { message: "No staff members found." };
        return { message: `👥 **Total Staff: ${staffList.length}**\n\n` + staffList.map(s => `* ${s.name} — ${s.role || 'Staff'}`).join('\n') };
      }
      case 'get_fee_statistics': {
        const feeStats = await FeeTransaction.aggregate([
          { $match: { school: new mongoose.Types.ObjectId(schoolId), status: 'Active' } },
          { $group: { _id: null, totalCollected: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        const total = feeStats.length > 0 ? feeStats[0].totalCollected : 0;
        const count = feeStats.length > 0 ? feeStats[0].count : 0;
        return { message: `💰 **Fee Collection Summary**\n\n* Total Collected: Rs. ${total.toLocaleString()}\n* Total Transactions: ${count}` };
      }
      case 'get_attendance': {
        const date = new Date(args.date);
        const attendance = await Attendance.find({ school: schoolId, sclass: args.classId, date: { $gte: new Date(date.setHours(0,0,0)), $lte: new Date(date.setHours(23,59,59)) } }).populate('student', 'name');
        if (attendance.length === 0) return { message: `No attendance found for this class on ${args.date}.` };
        const present = attendance.filter(a => a.status === 'Present').length;
        return { message: `📊 **Attendance for ${args.date}**\n\n* Total Records: ${attendance.length}\n* Present: ${present}\n* Absent: ${attendance.length - present}\n\nList:\n` + attendance.map(a => `* ${a.student?.name}: ${a.status}`).join('\n') };
      }
      case 'get_inventory_status': {
        const inventory = await InventoryItem.find({ school: schoolId });
        if (inventory.length === 0) return { message: "No inventory items found." };
        return { message: `📦 **School Inventory Status**\n\n` + inventory.map(item => `* ${item.itemName} — Category: ${item.itemCategory}, Qty: ${item.quantity}`).join('\n') };
      }
      case 'get_exam_schedules': {
        const schedules = await ExamSchedule.find({ school: schoolId, examDate: { $gte: new Date() } }).sort({ examDate: 1 }).limit(10).populate('class', 'sclassName');
        if (schedules.length === 0) return { message: "No upcoming exams found." };
        return { message: `📝 **Upcoming Exams**\n\n` + schedules.map(s => `* **${s.subject}** (${s.class?.sclassName || 'N/A'}) — Date: ${new Date(s.examDate).toLocaleDateString()}`).join('\n') };
      }

      // CREATE
      case 'create_class': {
        const existing = await Sclass.findOne({ school: schoolId, sclassName: args.sclassName });
        if (existing) return { message: `⚠️ "${args.sclassName}" already exists.` };
        const newClass = new Sclass({ 
          sclassName: args.sclassName, 
          sections: [{ sectionName: args.sectionName || 'A' }],
          school: schoolId 
        });
        await newClass.save();
        return { message: `✅ **${args.sclassName}** successfully created with Section **${args.sectionName || 'A'}**!` };
      }
      case 'create_teacher': {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(args.password, salt);
        const teacher = new Teacher({ 
            name: args.name, 
            email: args.email, 
            password: hashedPassword, 
            phone: args.phone,
            subject: args.subject,
            qualification: args.qualification,
            salary: args.salary,
            school: schoolId 
        });
        await teacher.save();
        return { message: `✅ Teacher **${args.name}** successfully added!` };
      }
      case 'create_student': {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(args.password, salt);
        
        // Find class ID if a name was provided instead of a valid ObjectId
        let finalClassId = args.sclassName;
        if (!mongoose.Types.ObjectId.isValid(args.sclassName)) {
            const foundClass = await Sclass.findOne({ 
                school: schoolId, 
                sclassName: { $regex: new RegExp(`^${args.sclassName}$`, 'i') } 
            });
            if (foundClass) {
                finalClassId = foundClass._id;
            } else {
                return { message: `❌ Class "${args.sclassName}" nahi mili. Pehle class check karein ya correct name den.` };
            }
        }

        const student = new Student({ 
          name: args.name, 
          rollNum: args.rollNum, 
          password: hashedPassword, 
          sclassName: finalClassId, 
          section: args.section || 'A',
          school: schoolId 
        });
        await student.save();
        return { message: `✅ Student **${args.name}** (Roll: ${args.rollNum}) successfully admitted!` };
      }

      // UPDATE
      case 'update_class': {
        let finalClassId = args.classId;
        if (!mongoose.Types.ObjectId.isValid(args.classId)) {
            const foundClass = await Sclass.findOne({ 
                school: schoolId, 
                sclassName: { $regex: new RegExp(`^${args.classId}$`, 'i') } 
            });
            if (foundClass) finalClassId = foundClass._id;
            else return { message: `❌ Class "${args.classId}" nahi mili.` };
        }
        await Sclass.findByIdAndUpdate(finalClassId, { sclassName: args.sclassName });
        return { message: `✅ Class renamed to **${args.sclassName}**` };
      }
      case 'update_teacher': {
        const update = {};
        if (args.name) update.name = args.name;
        if (args.email) update.email = args.email;
        await Teacher.findByIdAndUpdate(args.teacherId, update);
        return { message: `✅ Teacher information updated.` };
      }
      case 'update_student': {
        const update = {};
        if (args.name) update.name = args.name;
        if (args.rollNum) update.rollNum = args.rollNum;
        await Student.findByIdAndUpdate(args.studentId, update);
        return { message: `✅ Student information updated.` };
      }

      // DELETE
      case 'delete_class': {
        let finalClassId = args.classId;
        if (!mongoose.Types.ObjectId.isValid(args.classId)) {
            const foundClass = await Sclass.findOne({ 
                school: schoolId, 
                sclassName: { $regex: new RegExp(`^${args.classId}$`, 'i') } 
            });
            if (foundClass) finalClassId = foundClass._id;
            else return { message: `❌ Class "${args.classId}" nahi mili.` };
        }
        await Sclass.findByIdAndDelete(finalClassId);
        return { message: `🗑️ **${args.className}** permanently deleted.` };
      }
      case 'delete_teacher': {
        let finalId = args.teacherId;
        if (!mongoose.Types.ObjectId.isValid(args.teacherId)) {
            const found = await Teacher.findOne({ 
                school: schoolId, 
                name: { $regex: new RegExp(`^${args.teacherId}$`, 'i') } 
            });
            if (found) finalId = found._id;
            else return { message: `❌ Teacher "${args.teacherId}" nahi milay.` };
        }
        await Teacher.findByIdAndDelete(finalId);
        return { message: `🗑️ Teacher **${args.teacherName}** removed.` };
      }
      case 'delete_student': {
        let finalId = args.studentId;
        if (!mongoose.Types.ObjectId.isValid(args.studentId)) {
            const found = await Student.findOne({ 
                school: schoolId, 
                name: { $regex: new RegExp(`^${args.studentId}$`, 'i') } 
            });
            if (found) finalId = found._id;
            else return { message: `❌ Student "${args.studentId}" nahi mila.` };
        }
        await Student.findByIdAndDelete(finalId);
        return { message: `🗑️ Student **${args.studentName}** removed.` };
      }

      default:
        return { message: `Unknown action: ${toolName}` };
    }
  } catch (error) {
    return { message: `❌ Error executing ${toolName}: ${error.message}` };
  }
}

module.exports = { groqChat };
