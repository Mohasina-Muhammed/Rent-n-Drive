const Vehicle = require('../models/Vehicle');
const PricingCategory = require('../models/PricingCategory');

// Get all vehicles with optional filtering
exports.getVehicles = async (req, res, next) => {
  try {
    const { type, fuelType, transmission, minPrice, maxPrice, search, city } = req.query;
    
    let filter = { isApproved: true };
    if (type) filter.type = type;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter['pricing.daily'] = {};
      if (minPrice) filter['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.daily'].$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .populate('owner', 'name email phone')
      .populate('pricingCategory');
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// Get single vehicle
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('pricingCategory');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// Create a new vehicle (Owner/Admin)
exports.createVehicle = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add vehicles' });
    }

    const newVehicle = new Vehicle({
      ...req.body,
      owner: req.user.id
    });

    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    next(error);
  }
};

// Update vehicle (Owner/Admin)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    // When owner updates, reset approval statuses
    const updates = { ...req.body };
    if (req.user.role !== 'admin') {
      updates.isApproved = false;
      updates.isRejected = false;
      updates.rejectionReason = '';
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

// Get vehicles owned by the authenticated user
exports.getOwnerVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle vehicle maintenance status
exports.toggleVehicleMaintenance = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Ensure only the owner or an admin can toggle maintenance
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this vehicle' });
    }

    // Toggle status
    vehicle.availabilityStatus = vehicle.availabilityStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    await vehicle.save();

    res.status(200).json({ 
      message: `Vehicle is now ${vehicle.availabilityStatus.toLowerCase()}`, 
      status: vehicle.availabilityStatus 
    });
  } catch (error) {
    next(error);
  }
};

// NEW: Get all pricing categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await PricingCategory.find({ isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

