import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      console.log('Supabase not configured, returning mock data');
      return NextResponse.json({
        success: true,
        transactions: [
          {
            id: "mock1",
            wallet_address: wallet,
            nft_mint: "mock_mint_123",
            transaction_signature: "mock_tx_123",
            prize_id: 5,
            prize_name: "Camisa de Time",
            purchase_timestamp: new Date().toISOString(),
            is_crypto: false,
            status: "completed"
          },
          {
            id: "mock2",
            wallet_address: wallet,
            nft_mint: "mock_mint_456",
            transaction_signature: "mock_tx_456",
            prize_id: 101,
            prize_name: "0.01 SOL",
            purchase_timestamp: new Date(Date.now() - 86400000).toISOString(),
            is_crypto: true,
            status: "completed"
          },
          {
            id: "mock3",
            wallet_address: wallet,
            nft_mint: "mock_mint_789",
            transaction_signature: "mock_tx_789",
            prize_id: 8,
            prize_name: "MacBook M3",
            purchase_timestamp: new Date(Date.now() - 172800000).toISOString(),
            is_crypto: false,
            status: "completed"
          }
        ]
      });
    }
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('wallet_address', wallet)
      .order('purchase_timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch transactions'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions: data
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
} 