import { NextRequest, NextResponse } from 'next/server';
import { migrateLocalStorageToMongoDB, clearLocalStorageData } from '@/utils/migration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'migrate') {
      const result = await migrateLocalStorageToMongoDB();
      return NextResponse.json(result);
    } else if (action === 'clear') {
      clearLocalStorageData();
      return NextResponse.json({ 
        success: true, 
        message: 'LocalStorage data cleared successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "migrate" or "clear"' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 