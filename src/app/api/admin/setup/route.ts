import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase } from '@/utils/dbSetup';

// Simple middleware to check admin auth - same as other admin endpoints
const checkAdminAuth = (request: NextRequest) => {
  const referer = request.headers.get('referer') || '';
  if (!referer.includes('/admin')) {
    return false;
  }
  return true;
};

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run database setup
    const result = await setupDatabase();

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to set up database', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    });

  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 