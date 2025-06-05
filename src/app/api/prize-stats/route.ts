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

    // Buscar total de caixas abertas
    const { count: totalBoxes, error: countError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total boxes count:', countError);
    }

    // Buscar últimas aberturas de caixas
    const { data: recentPurchases, error: recentError } = await supabase
      .from('purchases')
      .select('wallet_address, prize_name, purchase_timestamp')
      .order('purchase_timestamp', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent purchases:', recentError);
    }

    return NextResponse.json({
      success: true,
      data: {
        prizeStatistics: prizeStats,
        totalBoxesOpened: totalBoxes || 0,
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