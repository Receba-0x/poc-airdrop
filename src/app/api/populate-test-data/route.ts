import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dados de teste mais realistas
const SAMPLE_TRANSACTIONS = [
  {
    wallet_address: '7xKXtestWallet1ABC123',
    amount_purchased: 156,
    token_amount_burned: 234.567,
    hours_ago: 2
  },
  {
    wallet_address: '9yJKtestWallet2DEF456',
    amount_purchased: 89,
    token_amount_burned: 134.221,
    hours_ago: 4
  },
  {
    wallet_address: '3zMNtestWallet3GHI789',
    amount_purchased: 245,
    token_amount_burned: 389.123,
    hours_ago: 6
  },
  {
    wallet_address: '5aPQtestWallet4JKL012',
    amount_purchased: 67,
    token_amount_burned: 102.456,
    hours_ago: 8
  },
  {
    wallet_address: '8bRStestWallet5MNO345',
    amount_purchased: 178,
    token_amount_burned: 267.789,
    hours_ago: 12
  },
  {
    wallet_address: '2cTUtestWallet6PQR678',
    amount_purchased: 134,
    token_amount_burned: 201.234,
    hours_ago: 18
  },
  {
    wallet_address: '6dVWtestWallet7STU901',
    amount_purchased: 298,
    token_amount_burned: 445.678,
    hours_ago: 24
  }
];

function generateFakeTransactionSignature() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateFakeNftMint() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se já existem dados de teste
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .ilike('wallet_address', '%test%')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Test data already exists',
        action: 'skipped'
      });
    }

    const testTransactions = SAMPLE_TRANSACTIONS.map(sample => {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - sample.hours_ago);

      return {
        wallet_address: sample.wallet_address,
        nft_mint: generateFakeNftMint(),
        nft_metadata: generateFakeNftMint(),
        amount_purchased: sample.amount_purchased,
        token_amount_burned: sample.token_amount_burned,
        transaction_signature: generateFakeTransactionSignature(),
        purchase_timestamp: timestamp.toISOString(),
        created_at: timestamp.toISOString(),
        burn_event_data: {
          initial_test_data: true,
          wallet: sample.wallet_address,
          timestamp: timestamp.getTime()
        },
        status: 'completed'
      };
    });

    const { data, error } = await supabase
      .from('purchases')
      .insert(testTransactions)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to populate test data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${testTransactions.length} test transactions created successfully`,
      data: data
    });

  } catch (error) {
    console.error('Error populating test data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 