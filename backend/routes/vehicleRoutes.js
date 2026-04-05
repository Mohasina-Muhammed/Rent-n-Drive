const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware } = require('./authRoutes');

// Public routes
router.get('/categories', vehicleController.getAllCategories);
router.get('/', vehicleController.getVehicles);

// Protected routes — /my-vehicles must come before /:id to avoid wildcard shadowing
router.get('/my-vehicles', authMiddleware, vehicleController.getOwnerVehicles);

// Public single-vehicle route (after named routes)
router.get('/:id', vehicleController.getVehicleById);

router.post('/', authMiddleware, vehicleController.createVehicle);
router.put('/:id', authMiddleware, vehicleController.updateVehicle);
router.put('/:id/maintenance-toggle', authMiddleware, vehicleController.toggleVehicleMaintenance);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

module.exports = router;
