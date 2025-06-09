import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Lista de IDs de prêmios físicos que devem ter o estoque atualizado
const PHYSICAL_PRIZES = [5, 6, 7, 8, 9, 10];

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

    if (!wallet || !transactionSignature || !prizeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        message: 'Data logged successfully (database not configured)',
        data: { id: Date.now() }
      });
    }

    // Verificar o estoque atual antes de processar
    let currentStock = null;
    if (PHYSICAL_PRIZES.includes(prizeId)) {
      try {
        const { data: stockCheck } = await supabase
          .from('prize_stock')
          .select('current_stock')
          .eq('prize_id', prizeId)
          .single();
        
        currentStock = stockCheck?.current_stock;
        console.log(`Verificando estoque para prêmio ${prizeId}: ${currentStock}`);
        
        // Se o estoque estiver zerado, retornar erro
        if (currentStock !== null && currentStock <= 0) {
          return NextResponse.json(
            { error: 'Prize out of stock', prize_id: prizeId },
            { status: 400 }
          );
        }
      } catch (stockError) {
        console.error('Erro ao verificar estoque:', stockError);
        // Continuamos mesmo com erro na verificação do estoque
      }
    }

    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          wallet_address: wallet,
          nft_mint: nftMint,
          nft_metadata: nftMetadata,
          amount_purchased: Number(Number(tokenAmount) / 1e9),
          token_amount_burned: Number(Number(tokenAmount) / 1e9),
          transaction_signature: transactionSignature,
          prize_id: prizeId,
          prize_name: prizeName,
          random_number: randomNumber,
          user_seed: userSeed,
          server_seed: serverSeed,
          nonce: nonce,
          purchase_timestamp: timestamp,
          is_crypto: prizeId >= 100 && prizeId <= 111 || prizeId >= 1 && prizeId <= 4,
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

    // Atualizar o estoque para prêmios físicos
    let stockUpdated = false;
    let newStock = null;
    
    if (PHYSICAL_PRIZES.includes(prizeId)) {
      try {
        const { data: stockData, error: stockError } = await supabase
          .rpc('decrement_stock', { p_prize_id: prizeId });

        if (stockError) {
          console.error(`Erro ao atualizar estoque para prêmio ${prizeId}:`, stockError);
        } else {
          newStock = stockData;
          stockUpdated = true;
          console.log(`Estoque atualizado para prêmio ${prizeId}, novo estoque: ${newStock}`);
        }
      } catch (stockUpdateError) {
        console.error('Erro ao chamar função de atualização de estoque:', stockUpdateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      stock_updated: stockUpdated,
      new_stock: newStock
    });

  } catch (error) {
    console.error('Error saving purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 