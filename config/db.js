const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in .env file, using default local connection');
    } else {
      console.log('🌐 Using MongoDB Atlas connection');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🟢 MongoDB Connected Successfully!');
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log('─────────────────────────────────────────────────');
    
  } catch (error) {
    console.error('🔴 MongoDB Connection Failed!');
    console.error(`❌ Error: ${error.message}`);
    console.log('─────────────────────────────────────────────────');
    console.log('💡 Possible solutions:');
    console.log('   1. Check if MONGODB_URI is correctly set in .env file');
    console.log('   2. Verify your MongoDB Atlas credentials');
    console.log('   3. Ensure your IP address is whitelisted in Atlas');
    console.log('   4. Check network connectivity to MongoDB Atlas');
    console.log('─────────────────────────────────────────────────');
    process.exit(1);
  }
};

module.exports = connectDB;
