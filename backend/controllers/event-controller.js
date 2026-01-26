const Event = require('../models/eventSchema.js');

// Create new event
const createEvent = async (req, res) => {
    try {
        const { eventTitle, eventDescription, eventFrom, eventTo, eventColor, eventType, visibility, schoolId, createdBy, createdByModel } = req.body;

        // Validate date range
        if (new Date(eventFrom) > new Date(eventTo)) {
            return res.status(400).json({ message: 'Event start date must be before end date' });
        }

        const event = new Event({
            eventTitle,
            eventDescription,
            eventFrom,
            eventTo,
            eventColor: eventColor || '#3b82f6',
            eventType: eventType || 'Other',
            visibility: visibility || 'Public',
            schoolId,
            createdBy,
            createdByModel: createdByModel || 'admin'
        });

        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all events by school
const getEventsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const events = await Event.find({ schoolId })
            .populate('createdBy', 'name email')
            .sort({ eventFrom: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id)
            .populate('createdBy', 'name email');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate date range if both dates are provided
        if (updateData.eventFrom && updateData.eventTo) {
            if (new Date(updateData.eventFrom) > new Date(updateData.eventTo)) {
                return res.status(400).json({ message: 'Event start date must be before end date' });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEvent,
    getEventsBySchool,
    getEventById,
    updateEvent,
    deleteEvent
};
