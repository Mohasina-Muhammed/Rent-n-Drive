const mongoose = require('mongoose');
require('dotenv').config();
const PricingCategory = require('./models/PricingCategory');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await PricingCategory.find();
  console.log('Categories:', JSON.stringify(categories, null, 2));
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
