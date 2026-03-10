// backend/controllers/aiChat-controller.js
// 
// Codebase-aware AI controller
// Setup: node generate-codebase-summary.js  ← pehle yeh chalao

const Groq = require('groq-sdk');
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Codebase Summary Import ───────────────────────────────────────────────────
// Pehle "node generate-codebase-summary.js" chalao — yeh file tab banti hai
let CODEBASE_SUMMARY = '';
try {
  CODEBASE_SUMMARY = require('./codebaseSummary');
  console.log('✅ Codebase summary loaded into AI context');
} catch (e) {
  console.warn('⚠️  codebaseSummary.js not found. Run: node generate-codebase-summary.js');
  CODEBASE_SUMMARY = 'Codebase summary not available.';
}

// ── System Prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(schoolId) {
  return `
You are an intelligent AI assistant for a School Management System (SaaS).
You have complete knowledge of this system's codebase, features, and database.

## YOUR CAPABILITIES:
- Answer questions about the system features and how to use them
- Tell users WHERE to find things in the UI (exact navigation)
- Explain HOW things work (based on actual code structure below)
- Fetch live data when needed (students, fees, attendance, etc.)
- Perform actions: create, update, delete records

## RULES:
1. Always answer in the same language the user uses (Urdu Roman or English)
2. When user asks "yeh feature kahan hai" — give exact UI path e.g. "Sidebar → Fee Management → Collect Fee"
3. When user asks "yeh kaise kaam karta hai" — explain based on the actual code structure
4. For DELETE actions — always confirm first
5. Be concise and helpful
6. Current School ID: ${schoolId}
7. Today: ${new Date().toLocaleDateString('en-PK')}

## NAVIGATION MAP (UI paths):
- Students        → Sidebar > Students > Student List
- Add Student     → Sidebar > Students > Add Student  
- Teachers        → Sidebar > Teachers > Teacher List
- Classes         → Sidebar > Classes
- Fee Structure   → Sidebar > Fee Management > Fee Structure
- Collect Fee     → Sidebar > Fee Management > Collect Fee
- Pending Fees    → Sidebar > Fee Management > Pending Fees
- Fee Report      → Sidebar > Fee Management > Transactions
- Attendance      → Sidebar > Attendance > Student Attendance
- Staff Attend.   → Sidebar > Attendance > Staff Attendance
- Exam Groups     → Sidebar > Examination > Exam Groups
- Results         → Sidebar > Examination > Results
- Payroll         → Sidebar > Staff > Payroll
- Inventory       → Sidebar > Inventory
- Transport       → Sidebar > Transport
- Lesson Plans    → Sidebar > Lesson Plans
- Events          → Sidebar > Events
- Reports         → Each section has its own Reports tab
- Settings        → Top right gear icon

## ACTUAL CODEBASE STRUCTURE:
${CODEBASE_SUMMARY}
`.trim();
}

// ── Main Controller ───────────────────────────────────────────────────────────
exports.groqChat = async (req, res) => {
  const { query, schoolId, confirmedAction, conversationHistory = [] } = req.body;

  if (!query && !confirmedAction) {
    return res.status(400).json({ success: false, response: 'Query is required.' });
  }

  try {
    // Build messages array — include conversation history for context
    const messages = [
      ...conversationHistory.slice(-6), // last 6 messages for context window
      { role: 'user', content: query || 'Confirmed action.' }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: buildSystemPrompt(schoolId) },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.3, // lower = more factual, less creative
    });

    const response = completion.choices[0].message.content;

    return res.json({
      success: true,
      response,
      // Return AI message to frontend so it can append to history
      newAssistantMessage: { role: 'assistant', content: response }
    });

  } catch (err) {
    console.error('Groq AI Error:', err.message);
    return res.status(500).json({
      success: false,
      response: 'AI service mein masla aa gaya. Thori der baad try karein.'
    });
  }
};
