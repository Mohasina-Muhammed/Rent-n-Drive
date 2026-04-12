const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const PricingCategory = require('./models/PricingCategory');

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  {
    name: 'Economy',
    description: 'Budget-friendly motorcycles and compact cars.',
    baseDaily: 25,
    isActive: true
  },
  {
    name: 'Standard',
    description: 'Reliable sedans and mid-range scooters.',
    baseDaily: 45,
    isActive: true
  },
  {
    name: 'Luxury',
    description: 'High-end motorcycles and premium SUVs.',
    baseDaily: 120,
    isActive: true
  },
  {
    name: 'Superbike',
    description: 'High-performance motorcycles.',
    baseDaily: 80,
    isActive: true
  }
];

async function seed() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if categories already exist
    const existing = await PricingCategory.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Found ${existing} existing categories. Skipping seed to avoid duplicates.`);
      const all = await PricingCategory.find();
      console.log('Current Categories:', all.map(c => c.name).join(', '));
    } else {
      console.log('🌱 Seeding default categories...');
      await PricingCategory.insertMany(categories);
      console.log('✅ Default categories seeded successfully!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
