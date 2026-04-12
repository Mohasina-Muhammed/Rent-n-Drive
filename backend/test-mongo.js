const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:ayzin123@cluster0.qyjhq.mongodb.net/Rent-n-Drive?appName=Cluster0';

console.log("Attempting to connect with URI:", uri.replace(/ayzin123/, '***'));

mongoose.connect(uri)
  .then(() => {
    console.log("✅ SUCCESS: Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("RAW ERROR OBJECT:");
    console.error(err);
    process.exit(1);
  });
