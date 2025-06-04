import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const {
      wallet,
      nftMint,
      nftMetadata,
      amount,
      tokenAmount,
      transactionSignature,
      prizeId,
      prizeName,
      randomNumber,
      userSeed,
      serverSeed,
      nonce,
      timestamp,
    } = await request.json();

    if (!wallet || !nftMint || !transactionSignature || !amount || !prizeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Inserir dados da compra/abertura de caixa
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          wallet_address: wallet,
          nft_mint: nftMint,
          nft_metadata: nftMetadata,
          amount_purchased: amount,
          token_amount_burned: tokenAmount,
          transaction_signature: transactionSignature,
          prize_id: prizeId,
          prize_name: prizeName,
          random_number: randomNumber,
          user_seed: userSeed,
          server_seed: serverSeed,
          nonce: nonce,
          purchase_timestamp: timestamp,
          status: 'completed'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save purchase data' },
        { status: 500 }
      );
    }

    // Se for prêmio físico, atualizar estoque
    const physicalPrizes = [8, 9, 10, 11, 12, 13];
    if (physicalPrizes.includes(prizeId)) {
      const { error: stockError } = await supabase
        .from('prize_stock')
        .update({
          current_stock: supabase.rpc('decrement_stock', { prize_id: prizeId })
        })
        .eq('prize_id', prizeId);

      if (stockError) {
        console.error('Error updating stock:', stockError);
        // Não falha a transação se não conseguir atualizar estoque
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Error saving purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 