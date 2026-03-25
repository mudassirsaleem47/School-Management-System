const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple chat without function calling (for testing)
async function simpleChat(query) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(query);
        const response = result.response.text();
        return { success: true, response };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

module.exports = { simpleChat };
