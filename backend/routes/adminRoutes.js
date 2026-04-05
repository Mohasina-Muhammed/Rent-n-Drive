const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('./authRoutes');

router.use(authMiddleware);

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.get('/vehicles/pending', adminController.getPendingVehicles);
router.put('/vehicles/:id/approve', adminController.updateVehicleApproval);
router.get('/bookings/all', adminController.getAllBookings);
router.get('/active-rentals', adminController.getActiveRentals);
router.post('/block-vehicle', adminController.blockVehicle);
router.get('/vehicles/all', adminController.getAllVehicles);
router.get('/conflicts', adminController.getConflicts);

// Pricing Category Routes
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
