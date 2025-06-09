import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Missing wallet parameter' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        hasAddress: false,
        message: 'Database not configured'
      });
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipping addresses:', error);
      return NextResponse.json(
        { success: false, error: 'Error fetching shipping addresses' },
        { status: 500 }
      );
    }

    const hasAddress = data && data.length > 0;

    return NextResponse.json({
      success: true,
      hasAddress,
      data: hasAddress ? data : null,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error processing shipping address check:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 