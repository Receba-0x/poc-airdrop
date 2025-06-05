import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
  try {
    const {
      wallet,
      nftMint,
      nftMetadata,
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

    if (!wallet || !nftMint || !transactionSignature || !prizeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Se o Supabase não estiver configurado, apenas fazer log dos dados
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎁 Purchase data (Supabase not configured):');
      console.log({
        wallet,
        nftMint,
        nftMetadata,
        tokenAmount,
        transactionSignature,
        prizeId,
        prizeName,
        randomNumber,
        userSeed,
        serverSeed,
        nonce,
        timestamp
      });

      return NextResponse.json({
        success: true,
        message: 'Data logged successfully (database not configured)',
        data: { id: Date.now() }
      });
    }

    // Inserir dados da compra/abertura de caixa
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          wallet_address: wallet,
          nft_mint: nftMint,
          nft_metadata: nftMetadata,
          amount_purchased: tokenAmount,
          token_amount_burned: tokenAmount,
          transaction_signature: transactionSignature,
          prize_id: prizeId,
          prize_name: prizeName,
          random_number: randomNumber,
          user_seed: userSeed,
          server_seed: serverSeed,
          nonce: nonce,
          purchase_timestamp: timestamp,
          is_crypto: prizeId >= 100 && prizeId <= 111, // Verificar se é prêmio crypto
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

    // Se for prêmio físico, atualizar estoque usando a função RPC
    const physicalPrizes = [8, 9, 10, 11, 12, 13];
    if (physicalPrizes.includes(prizeId)) {
      const { data: stockData, error: stockError } = await supabase
        .rpc('decrement_stock', { prize_id: prizeId });

      if (stockError) {
        console.error('Error updating stock:', stockError);
        // Não falha a transação se não conseguir atualizar estoque
      } else {
        console.log(`Stock updated for prize ${prizeId}, new stock: ${stockData}`);
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