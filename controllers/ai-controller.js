const { getChatResponse } = require('../services/groq-service');

const groqChat = async (req, res) => {
    try {
        const { query, schoolId, history } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required." });
        }

        const result = await getChatResponse(query, schoolId, history);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ success: false, message: result.error });
        }
    } catch (error) {
        console.error('Groq Chat Controller Error:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { groqChat };