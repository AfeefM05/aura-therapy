import { NextRequest, NextResponse } from 'next/server';
import { getUserData, setUserData, updateUserData, createUser, userExists } from '@/utils/mongoUserStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const userData = await getUserData(username);
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, userData } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (userData) {
      // Update existing user data
      const success = await setUserData(username, userData);
      if (!success) {
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
      }
    } else {
      // Create new user
      const success = await createUser(username);
      if (!success) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, updates } = body;

    if (!username || !updates) {
      return NextResponse.json({ error: 'Username and updates are required' }, { status: 400 });
    }

    const success = await updateUserData(username, updates);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 