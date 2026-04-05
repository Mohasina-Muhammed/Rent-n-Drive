const mongoose = require('mongoose');

const pricingCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    baseDaily: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingCategory', pricingCategorySchema);
