import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple middleware to check admin auth
const checkAdminAuth = (request: NextRequest) => {
  // For demo purposes - this is just basic protection
  const referer = request.headers.get('referer') || '';
  
  // Only allow requests from the admin page
  if (!referer.includes('/admin')) {
    return false;
  }
  
  return true;
};

export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get stock data
    const { data, error } = await supabase
      .from('prize_stock')
      .select('*')
      .order('prize_id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock data' },
        { status: 500 }
      );
    }

    // If no stock data is found, return sample data for demo purposes
    if (!data || data.length === 0) {
      // These are sample data for demonstration - replace with actual data from DB
      const sampleData = [
        { id: 1, prize_id: 8, prize_name: 'Macbook Pro', current_stock: 5, initial_stock: 10 },
        { id: 2, prize_id: 9, prize_name: 'iPhone 15', current_stock: 8, initial_stock: 20 },
        { id: 3, prize_id: 10, prize_name: 'PlayStation 5', current_stock: 3, initial_stock: 15 },
        { id: 4, prize_id: 11, prize_name: 'Airpods Pro', current_stock: 12, initial_stock: 30 },
        { id: 5, prize_id: 12, prize_name: 'Nintendo Switch', current_stock: 7, initial_stock: 25 },
        { id: 6, prize_id: 13, prize_name: 'Gift Card', current_stock: 50, initial_stock: 100 },
      ];
      
      return NextResponse.json({
        success: true,
        data: sampleData,
        message: 'Sample data provided as prize_stock table not found'
      });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 