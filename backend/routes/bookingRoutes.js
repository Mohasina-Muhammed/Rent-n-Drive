const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('./authRoutes');

// All booking routes require authentication
router.use(authMiddleware);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
