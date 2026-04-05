const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['2Wheeler', '4Wheeler'], required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    pricing: {
      daily: { type: Number, required: true },
      weekly: { type: Number, required: true },
      monthly: { type: Number, required: true }
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Booked', 'Maintenance'],
      default: 'Available'
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isRejected: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    images: [{ type: String }],
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
    transmission: { type: String, enum: ['Manual', 'Automatic'] },
    city: { type: String, default: 'Not Specified' },
    pricingCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingCategory' },
    maintenancePeriods: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
