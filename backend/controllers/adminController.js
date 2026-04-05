const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const PricingCategory = require('../models/PricingCategory');

// NEW: Pricing Categories Management
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await PricingCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = new PricingCategory(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await PricingCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Revenue Stats
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Conversion Rate
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const conversionRate = totalBookings > 0 ? ((approvedBookings / totalBookings) * 100).toFixed(2) : 0;

    // Avg Rental Duration
    const approvedList = await Booking.find({ status: 'Approved' });
    let totalDays = 0;
    approvedList.forEach(b => {
      const diff = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24));
      totalDays += diff;
    });
    const avgDuration = approvedBookings > 0 ? (totalDays / approvedBookings).toFixed(2) : 0;

    // Monthly Active Users (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mau = await User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } });

    // Utilization Rate (Rough Estimate: Total Booked Days / Potential Available Days in last 30 days)
    const potentialDays = totalVehicles * 30;
    const utilizationRate = potentialDays > 0 ? ((totalDays / potentialDays) * 100).toFixed(2) : 0;

    // Revenue by City
    const revenueByCity = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $lookup: { from: 'vehicles', localField: 'vehicle', foreignField: '_id', as: 'v' } },
      { $unwind: '$v' },
      { $group: { _id: '$v.city', revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]);

    // Bookings over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      totalUsers,
      totalVehicles,
      totalBookings,
      revenue: totalRevenue[0]?.total || 0,
      revenueByCity,
      monthlyStats,
      conversionRate,
      avgDuration,
      mau,
      utilizationRate,
      usageRate: totalVehicles > 0 ? (totalBookings / totalVehicles).toFixed(2) : 0
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// NEW: Manage User Status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isVerified = !user.isVerified; 
    await user.save();
    res.status(200).json({ message: 'User status updated', user });
  } catch (error) {
    next(error);
  }
};

// NEW: Get Pending Vehicles
exports.getPendingVehicles = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const vehicles = await Vehicle.find({ isApproved: false, isRejected: false }).populate('owner', 'name email phone address');
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// NEW: Approve / Reject Vehicle
exports.updateVehicleApproval = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { approved } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (approved) {
      vehicle.isApproved = true;
      vehicle.isRejected = false;
      vehicle.rejectionReason = '';
      await vehicle.save();
      res.status(200).json({ message: 'Vehicle approved successfully' });
    } else {
      vehicle.isApproved = false;
      vehicle.isRejected = true;
      vehicle.rejectionReason = req.body.reason || 'Rejected by administrator';
      await vehicle.save();
      res.status(200).json({ message: 'Vehicle rejected successfully' });
    }
  } catch (error) {
    next(error);
  }
};

// NEW: Get All Bookings for Monitoring
exports.getAllBookings = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const bookings = await Booking.find()
      .populate('vehicle', 'brand model registrationNumber')
      .populate('customer', 'name email phone address')
      .populate('owner', 'name email phone address')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// NEW: Get Active Rentals
exports.getActiveRentals = async (req, res, next) => {
  try {
    const now = new Date();
    const actives = await Booking.find({
      status: 'Approved',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .populate('vehicle', 'brand model registrationNumber images')
    .populate('customer', 'name phone email')
    .sort({ endDate: 1 });
    res.status(200).json(actives);
  } catch (error) {
    next(error);
  }
};

// NEW: Block Vehicle for Maintenance
exports.blockVehicle = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, reason } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    vehicle.maintenancePeriods.push({ startDate, endDate, reason });
    await vehicle.save();
    res.status(200).json({ message: 'Maintenance scheduled' });
  } catch (error) {
    next(error);
  }
};

// NEW: Get All Vehicles for Admin
exports.getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('owner', 'name');
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// NEW: Get Booking Conflicts
exports.getConflicts = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['Approved', 'Pending'] } })
      .populate('vehicle', 'brand model registrationNumber maintenancePeriods');
    
    const conflicts = [];
    for (let i = 0; i < bookings.length; i++) {
      const b1 = bookings[i];
      
      // Check overlap with maintenance
      const maintenanceOverlap = b1.vehicle.maintenancePeriods.find(m => {
        return (new Date(b1.startDate) <= new Date(m.endDate) && new Date(b1.endDate) >= new Date(m.startDate));
      });
      if (maintenanceOverlap) {
        conflicts.push({ type: 'Maintenance', booking: b1, maintenance: maintenanceOverlap });
      }

      // Check overlap with other bookings
      for (let j = i + 1; j < bookings.length; j++) {
        const b2 = bookings[j];
        if (b1.vehicle._id.toString() === b2.vehicle._id.toString()) {
          if (new Date(b1.startDate) <= new Date(b2.endDate) && new Date(b1.endDate) >= new Date(b2.startDate)) {
            conflicts.push({ type: 'Overlap', booking1: b1, booking2: b2 });
          }
        }
      }
    }
    res.status(200).json(conflicts);
  } catch (error) {
    next(error);
  }
};
