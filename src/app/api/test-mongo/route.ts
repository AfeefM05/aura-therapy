import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Test with a simple connection first
    const testUri = 'mongodb+srv://rivalcoder01:rbSSQ1G10FwMfTSm@cluster0.cxk21at.mongodb.net/test?retryWrites=true&w=majority';
    
    console.log('Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(testUri, {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    
    console.log('MongoDB connected successfully!');
    
    // Test a simple operation
    const collections = await connection.connection.db.listCollections().toArray();
    
    await mongoose.disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
} 