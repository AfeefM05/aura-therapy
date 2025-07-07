import mongoose from 'mongoose';

// Clean up the MongoDB URI - remove any problematic parameters
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rivalcoder01:rbSSQ1G10FwMfTSm@cluster0.cxk21at.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Remove appName parameter which can cause issues
MONGODB_URI = MONGODB_URI.replace(/&appName=[^&]*/, '');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 