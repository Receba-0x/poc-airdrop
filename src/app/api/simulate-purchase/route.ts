import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de carteiras fake para simulação
const FAKE_WALLETS = [
  '7xKXKNx...ABC123',
  '9yJKLNm...DEF456', 
  '3zMNPQr...GHI789',
  '5aPQRSt...JKL012',
  '8bRSTUv...MNO345'
];

function generateRandomWallet() {
  return FAKE_WALLETS[Math.floor(Math.random() * FAKE_WALLETS.length)];
}

function generateRandomAmount() {
  return Math.floor(Math.random() * 1000) + 50; // Between 50-1050
}

function generateRandomTokenAmount() {
  return (Math.random() * 500 + 100).toFixed(3); // Between 100-600 with 3 decimals
}

function generateFakeTransactionSignature() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 88; i++) { // Solana signatures are ~88 chars
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateFakeNftMint() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 44; i++) { // Solana addresses are ~44 chars
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { count = 1 } = await request.json();

    const transactions = [];

    for (let i = 0; i < count; i++) {
      const fakeTransaction = {
        wallet_address: generateRandomWallet(),
        nft_mint: generateFakeNftMint(),
        nft_metadata: generateFakeNftMint(), // Using same function for metadata
        amount_purchased: generateRandomAmount(),
        token_amount_burned: parseFloat(generateRandomTokenAmount()),
        transaction_signature: generateFakeTransactionSignature(),
        purchase_timestamp: new Date().toISOString(),
        burn_event_data: {
          simulated: true,
          test_data: `Test transaction ${i + 1}`,
          timestamp: Date.now()
        },
        status: 'completed'
      };

      transactions.push(fakeTransaction);
    }

    const { data, error } = await supabase
      .from('purchases')
      .insert(transactions)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create simulated purchases' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${count} simulated purchase(s) created successfully`,
      data: data
    });

  } catch (error) {
    console.error('Error creating simulated purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 