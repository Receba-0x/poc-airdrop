import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.log('📦 Returning initial stock (Supabase not configured)');

      const initialStock = {
        8: 90,   // Camisas
        9: 40,   // Bolas
        10: 30,  // Chuteiras
        11: 1,   // MacBook
        12: 2,   // iPhone
        13: 10   // Ticket Dourado
      };

      return NextResponse.json({
        success: true,
        stock: initialStock
      });
    }

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

    const stockMap: { [key: number]: number } = {};
    data.forEach(item => {
      stockMap[item.prize_id] = item.current_stock;
    });

    return NextResponse.json({
      success: true,
      stock: stockMap
    });

  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 