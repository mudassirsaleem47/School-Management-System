const express = require('express');
const router = express.Router();
const TransportPickupPoint = require('../models/transportPickupPointSchema');
const TransportRoute = require('../models/transportRouteSchema');
const TransportVehicle = require('../models/transportVehicleSchema');
const TransportRouteStop = require('../models/transportRouteStopSchema');
const StudentTransport = require('../models/studentTransportSchema');
const Student = require('../models/studentSchema');

// ==========================================
// Pickup Points Routes
// ==========================================
// Create
router.post('/PickupPoint', async (req, res) => {
    try {
        const point = new TransportPickupPoint(req.body);
        const result = await point.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// List
router.get('/PickupPoint/:schoolId', async (req, res) => {
    try {
        const points = await TransportPickupPoint.find({ school: req.params.schoolId });
        res.send(points);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Delete
router.delete('/PickupPoint/:id', async (req, res) => {
    try {
        const result = await TransportPickupPoint.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ==========================================
// Routes Routes
// ==========================================
// Create
router.post('/Route', async (req, res) => {
    try {
        const route = new TransportRoute(req.body);
        const result = await route.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// List
router.get('/Route/:schoolId', async (req, res) => {
    try {
        const routes = await TransportRoute.find({ school: req.params.schoolId });
        res.send(routes);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Update
router.put('/Route/:id', async (req, res) => {
    try {
        const result = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Delete
router.delete('/Route/:id', async (req, res) => {
    try {
        const result = await TransportRoute.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ==========================================
// Vehicles Routes
// ==========================================
// Create
router.post('/Vehicle', async (req, res) => {
    try {
        const vehicle = new TransportVehicle(req.body);
        const result = await vehicle.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// List
router.get('/Vehicle/:schoolId', async (req, res) => {
    try {
        const vehicles = await TransportVehicle.find({ school: req.params.schoolId }).populate('assignedRoute', 'routeTitle');
        res.send(vehicles);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Update (Assign Route)
router.put('/Vehicle/:id', async (req, res) => {
    try {
        const result = await TransportVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Delete
router.delete('/Vehicle/:id', async (req, res) => {
    try {
        const result = await TransportVehicle.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ==========================================
// Route Pickup Points (Stops/Fees)
// ==========================================
// Add Stop to Route
router.post('/RouteStop', async (req, res) => {
    try {
        const stop = new TransportRouteStop(req.body);
        const result = await stop.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// List Stops for Route
router.get('/RouteStop/:routeId', async (req, res) => {
    try {
        const stops = await TransportRouteStop.find({ route: req.params.routeId }).populate('pickupPoint', 'pickupPointName latitude longitude');
        res.send(stops);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Delete Stop
router.delete('/RouteStop/:id', async (req, res) => {
    try {
        const result = await TransportRouteStop.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ==========================================
// Student Transport Assignment
// ==========================================
// Assign Student
router.post('/StudentTransport', async (req, res) => {
    try {
        const assignment = new StudentTransport(req.body);
        const result = await assignment.save();
        
        // Optionally update student record if needed
        // await Student.findByIdAndUpdate(req.body.student, { transportMode: 'School Transport' });

        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});
// List Students in Transport
router.get('/StudentTransport/:schoolId', async (req, res) => {
    try {
        const list = await StudentTransport.find({ school: req.params.schoolId })
            .populate('student', 'name sclass section rollNum')
            .populate('routeStop');
        res.send(list);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Remove Student
router.delete('/StudentTransport/:id', async (req, res) => {
    try {
        const result = await StudentTransport.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
