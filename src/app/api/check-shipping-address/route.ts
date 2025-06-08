import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        hasAddress: false
      }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking shipping address:', error);
      return NextResponse.json(
        { success: false, error: 'Database error', hasAddress: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasAddress: data && data.length > 0,
      data: data && data.length > 0 ? data[0] : null
    });
  } catch (error: any) {
    console.error('Error in check-shipping-address endpoint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error', hasAddress: false },
      { status: 500 }
    );
  }
} 