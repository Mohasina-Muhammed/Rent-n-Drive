const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('./authRoutes');

// All booking routes require authentication
router.use(authMiddleware);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
