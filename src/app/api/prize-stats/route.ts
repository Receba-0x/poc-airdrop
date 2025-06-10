import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

// Verificar se as variáveis do Supabase estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET(request: NextRequest) {
  try {
    // Se o Supabase não estiver configurado, retornar dados mock
    if (!isSupabaseConfigured || !supabase) {
      console.log('📊 Returning mock stats (Supabase not configured)');
      
      return NextResponse.json({
        success: true,
        data: {
          prizeStatistics: [],
          totalBoxesOpened: 0,
          totalCryptoBoxesOpened: 0,
          totalSuperPrizeBoxesOpened: 0,
          recentPurchases: []
        }
      });
    }

    // Buscar estatísticas usando a view criada
    const { data: prizeStats, error: statsError } = await supabase
      .from('prize_statistics')
      .select('*')
      .order('prize_id');

    if (statsError) {
      console.error('Error fetching prize statistics:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch prize statistics' },
        { status: 500 }
      );
    }

    // Buscar estoque de caixas do box_stock table
    const { data: boxStockData, error: boxStockError } = await supabase
      .from('box_stock')
      .select('*');

    if (boxStockError) {
      console.error('Error fetching box stock:', boxStockError);
      return NextResponse.json(
        { error: 'Failed to fetch box stock' },
        { status: 500 }
      );
    }

    // Se não houver dados de estoque, criar valores padrão
    let cryptoBoxData = boxStockData?.find(box => box.box_type === 'crypto');
    let superPrizeBoxData = boxStockData?.find(box => box.box_type === 'super_prize');

    const DEFAULT_MAX_BOXES = 275;

    // Valores padrão se não existirem registros
    const cryptoBoxInitial = cryptoBoxData?.initial_stock || DEFAULT_MAX_BOXES;
    const cryptoBoxCurrent = cryptoBoxData?.current_stock || DEFAULT_MAX_BOXES;
    const cryptoBoxesOpened = cryptoBoxInitial - cryptoBoxCurrent;

    const superPrizeBoxInitial = superPrizeBoxData?.initial_stock || DEFAULT_MAX_BOXES;
    const superPrizeBoxCurrent = superPrizeBoxData?.current_stock || DEFAULT_MAX_BOXES;
    const superPrizeBoxesOpened = superPrizeBoxInitial - superPrizeBoxCurrent;

    const totalBoxesOpened = cryptoBoxesOpened + superPrizeBoxesOpened;

    // Buscar últimas aberturas de caixas
    const { data: recentPurchases, error: recentError } = await supabase
      .from('purchases')
      .select('wallet_address, prize_name, purchase_timestamp, is_crypto, is_crypto_box, box_type')
      .order('purchase_timestamp', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent purchases:', recentError);
    }

    return NextResponse.json({
      success: true,
      data: {
        prizeStatistics: prizeStats,
        totalBoxesOpened,
        totalCryptoBoxesOpened: cryptoBoxesOpened,
        totalSuperPrizeBoxesOpened: superPrizeBoxesOpened,
        remainingCryptoBoxes: cryptoBoxCurrent,
        remainingSuperPrizeBoxes: superPrizeBoxCurrent,
        maxCryptoBoxes: cryptoBoxInitial,
        maxSuperPrizeBoxes: superPrizeBoxInitial,
        recentPurchases: recentPurchases || []
      }
    });

  } catch (error) {
    console.error('Error fetching prize statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 