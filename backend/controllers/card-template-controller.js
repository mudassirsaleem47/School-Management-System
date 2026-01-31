const CardTemplate = require('../models/cardTemplateSchema');

const saveTemplate = async (req, res) => {
    try {
        let { school, name, cardType, elements, dimensions, orientation } = req.body;
        let { backgroundImage } = req.body;

        if (req.file) {
            backgroundImage = req.file.path;
        }
        
        // Parse Form Data strings if they are strings
        if (typeof elements === 'string') {
            try { elements = JSON.parse(elements); } catch (e) {
                console.error("Error parsing elements:", e);
                return res.status(400).json({ message: "Invalid elements format" });
            }
        }

        if (typeof dimensions === 'string') {
            try { dimensions = JSON.parse(dimensions); } catch (e) {
                 // Ignore or handle
            }
        }
        
        // Handle dimensions if sent as flattened keys (dimensions[width])
        if (!dimensions && req.body['dimensions[width]']) {
             dimensions = {
                 width: req.body['dimensions[width]'],
                 height: req.body['dimensions[height]']
             };
        }

        const template = new CardTemplate({
            school,
            name,
            backgroundImage,
            cardType,
            elements, 
            dimensions,
            orientation
        });

        const savedTemplate = await template.save();
        res.status(201).json(savedTemplate);
    } catch (err) {
        console.error("Error saving template:", err);
        res.status(500).json({ message: "Failed to save template", error: err.message });
    }
};

const getTemplates = async (req, res) => {
    try {
        const templates = await CardTemplate.find({ school: req.params.schoolId });
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteTemplate = async (req, res) => {
    try {
        await CardTemplate.findByIdAndDelete(req.params.id);
        res.status(200).json("Template deleted");
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { saveTemplate, getTemplates, deleteTemplate };
