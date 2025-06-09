import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/utils/auth';

export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const isAuthorized = await isAuthenticated(authHeader);

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 500 });
    }

    // 1. Total de compras
    const { count: total_purchases, error: countError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total purchases:', countError);
      return NextResponse.json({
        success: false,
        error: countError.message
      }, { status: 500 });
    }

    // 2. Total de valor gasto (soma de amount_purchased)
    const { data: valueData, error: valueError } = await supabase
      .from('purchases')
      .select('amount_purchased');

    if (valueError) {
      console.error('Error fetching purchase values:', valueError);
      return NextResponse.json({
        success: false,
        error: valueError.message
      }, { status: 500 });
    }

    const total_value = valueData.reduce((sum, item) => sum + (item.amount_purchased || 0), 0);

    const { data: physicalData, error: physicalError } = await supabase
      .from('purchases')
      .select('count')
      .eq('is_crypto', false);

    const { data: cryptoData, error: cryptoError } = await supabase
      .from('purchases')
      .select('count')
      .eq('is_crypto', true);

    if (physicalError || cryptoError) {
      console.error('Error fetching prize types:', physicalError || cryptoError);
      return NextResponse.json({
        success: false,
        error: (physicalError || cryptoError)?.message
      }, { status: 500 });
    }

    const physical_prizes_claimed = physicalData?.length - 1 || 0;
    const crypto_prizes_claimed = cryptoData?.length - 1 || 0;

    console.log('physical_prizes_claimed', physical_prizes_claimed);
    console.log('crypto_prizes_claimed', crypto_prizes_claimed);

    const { data: walletsData, error: walletsError } = await supabase
      .rpc('get_top_wallets', { limit_count: 5 });

    if (walletsError) {
      console.error('Error fetching top wallets:', walletsError);
      return NextResponse.json({
        success: false,
        error: walletsError.message
      }, { status: 500 });
    }

    const top_wallets = (walletsData || []).map((item: { wallet_address: string; purchase_count: number }) => ({
      wallet_address: item.wallet_address,
      purchase_count: item.purchase_count
    }));

    const { data: prizesData, error: prizesError } = await supabase
      .rpc('get_top_prizes', { limit_count: 5 });

    if (prizesError) {
      console.error('Error fetching prizes by popularity:', prizesError);
      return NextResponse.json({
        success: false,
        error: prizesError.message
      }, { status: 500 });
    }

    const prizes_by_popularity = (prizesData || []).map((item: { prize_id: number; prize_name: string; claim_count: number }) => ({
      prize_id: item.prize_id,
      prize_name: item.prize_name,
      claim_count: item.claim_count
    }));

    const { data: activityData, error: activityError } = await supabase
      .from('purchases')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
      return NextResponse.json({
        success: false,
        error: activityError.message
      }, { status: 500 });
    }

    const activityByDay = (activityData || []).reduce((acc: Record<string, number>, item: { created_at: string }) => {
      const date = new Date(item.created_at);
      const dateString = date.toISOString().split('T')[0];

      if (!acc[dateString]) {
        acc[dateString] = 0;
      }
      acc[dateString]++;

      return acc;
    }, {});

    const recent_activity = Object.entries(activityByDay)
      .map(([date, purchase_count]) => ({ date, purchase_count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .reverse();
    return NextResponse.json({
      success: true,
      data: {
        total_purchases: total_purchases || 0,
        total_value,
        physical_prizes_claimed,
        crypto_prizes_claimed,
        top_wallets,
        prizes_by_popularity,
        recent_activity
      }
    });

  } catch (error) {
    console.error('Error in statistics endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 