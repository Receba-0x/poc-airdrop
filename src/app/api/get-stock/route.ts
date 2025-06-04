import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
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

    // Converter para formato de objeto para facilitar acesso
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