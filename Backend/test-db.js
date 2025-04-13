const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://thapelo:9riJ5EMUQ20SxnFR@constitutionalarchive-c.qr3eves.mongodb.net/ConstitutionalArchive_DB?retryWrites=true&w=majority';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Test a simple query
    const users = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`📊 Total users: ${users}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();