const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// Create a new booking (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, totalPrice } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // NEW: Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book vehicles. Owners and admins are restricted.' });
    }

    // NEW: Prevent self-booking
    if (vehicle.owner.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot book your own vehicle.' });
    }

    if (vehicle.availabilityStatus !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is not currently available' });
    }

    // 1. Check maintenance periods
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);
    const inMaintenance = vehicle.maintenancePeriods?.some(p => {
      return (reqStart <= new Date(p.endDate) && reqEnd >= new Date(p.startDate));
    });

    if (inMaintenance) {
      return res.status(400).json({ message: 'Vehicle is scheduled for maintenance during these dates' });
    }

    // 2. Check for overlapping approved bookings
    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: 'Approved',
      $or: [
        { startDate: { $lte: reqEnd }, endDate: { $gte: reqStart } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Vehicle is already booked for these dates' });
    }

    const newBooking = new Booking({
      customer: req.user.id,
      vehicle: vehicleId,
      owner: vehicle.owner,
      startDate,
      endDate,
      totalPrice
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    next(error);
  }
};

// Get bookings for current user (Customer or Owner)
exports.getMyBookings = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'owner') {
      filter.owner = req.user.id;
    }

    const bookings = await Booking.find(filter)
      .populate('vehicle', 'brand model registrationNumber type pricing images')
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Update booking status (Owner/Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    // Sync vehicle availability status based on booking status
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle) {
      if (status === 'Approved') {
        vehicle.availabilityStatus = 'Booked';
      } else if (['Completed', 'Rejected', 'Cancelled'].includes(status)) {
        vehicle.availabilityStatus = 'Available';
      }
      await vehicle.save();
    }

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    next(error);
  }
};
