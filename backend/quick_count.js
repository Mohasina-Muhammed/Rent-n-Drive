const mongoose = require('mongoose');
require('dotenv').config();
const PricingCategory = require('./models/PricingCategory');

async function run() {
  console.log('Connecting...');
  await mongoose.connect(process.env.MONGO_URI, { connectTimeoutMS: 5000 });
  console.log('Connected.');
  const count = await PricingCategory.countDocuments();
  console.log('Total Categories:', count);
  const categories = await PricingCategory.find();
  console.log('Category Names:', categories.map(c => c.name));
  process.exit(0);
}
run().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
