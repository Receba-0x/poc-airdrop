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

    // 3. Contagem de prêmios físicos e crypto
    // Buscar todos os registros e contar manualmente
    const { data: prizeRecords, error: prizeError } = await supabase
      .from('purchases')
      .select('is_crypto');

    if (prizeError) {
      console.error('Error fetching prize types:', prizeError);
      return NextResponse.json({
        success: false,
        error: prizeError.message
      }, { status: 500 });
    }

    let physical_prizes_claimed = 0;
    let crypto_prizes_claimed = 0;
    
    if (prizeRecords) {
      prizeRecords.forEach((record: { is_crypto: boolean }) => {
        if (record.is_crypto === false) {
          physical_prizes_claimed++;
        } else if (record.is_crypto === true) {
          crypto_prizes_claimed++;
        }
      });
    }
    
    console.log('Contagem de prêmios físicos:', physical_prizes_claimed);
    console.log('Contagem de prêmios crypto:', crypto_prizes_claimed);

    // 4. Top Wallets
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

    // 5. Prêmios por popularidade
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

    // 6. Atividade recente (últimos 30 dias)
    const { data: activityData, error: activityError } = await supabase
      .from('purchases')
      .select('created_at, amount_purchased, prize_id, prize_name, wallet_address')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
      return NextResponse.json({
        success: false,
        error: activityError.message
      }, { status: 500 });
    }

    // Agrupar por dia para gráfico de atividade
    const activityByDay = (activityData || []).reduce((acc: Record<string, number>, item: { created_at: string }) => {
      const date = new Date(item.created_at);
      const dateString = date.toISOString().split('T')[0];

      if (!acc[dateString]) {
        acc[dateString] = 0;
      }
      acc[dateString]++;

      return acc;
    }, {});

    // Último mês de atividade para gráficos
    const last30Days = getLast30Days();
    const dailyActivity = last30Days.map(date => {
      return {
        date,
        count: activityByDay[date] || 0
      };
    });

    // 7. Distribuição de vendas por valor
    const valueDistribution = (activityData || []).reduce((acc: Record<string, number>, item: { amount_purchased: number }) => {
      // Categorizar por faixas de valor
      let category = '0-10';
      const amount = item.amount_purchased || 0;
      
      if (amount > 100) category = '100+';
      else if (amount > 50) category = '50-100';
      else if (amount > 25) category = '25-50';
      else if (amount > 10) category = '10-25';
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      
      return acc;
    }, {});

    // 8. Distribuição de prêmios por tipo
    const prizeDistribution = (activityData || []).reduce((acc: Record<string, number>, item: { prize_id: number; prize_name: string }) => {
      const prizeName = item.prize_name || `Prize ${item.prize_id}`;
      
      if (!acc[prizeName]) {
        acc[prizeName] = 0;
      }
      acc[prizeName]++;
      
      return acc;
    }, {});

    // 9. Volume de vendas por dia (em valor)
    const volumeByDay = (activityData || []).reduce((acc: Record<string, number>, item: { created_at: string; amount_purchased: number }) => {
      const date = new Date(item.created_at);
      const dateString = date.toISOString().split('T')[0];

      if (!acc[dateString]) {
        acc[dateString] = 0;
      }
      acc[dateString] += (item.amount_purchased || 0);

      return acc;
    }, {});

    const dailyVolume = last30Days.map(date => {
      return {
        date,
        value: parseFloat((volumeByDay[date] || 0).toFixed(2))
      };
    });

    // 10. Vendas por hora do dia
    const salesByHour = (activityData || []).reduce((acc: number[], item: { created_at: string }) => {
      const date = new Date(item.created_at);
      const hour = date.getUTCHours();
      
      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour]++;
      
      return acc;
    }, Array(24).fill(0));

    // 11. Contar carteiras únicas
    const uniqueWallets = new Set();
    (activityData || []).forEach((item: { wallet_address: string }) => {
      if (item.wallet_address) {
        uniqueWallets.add(item.wallet_address);
      }
    });

    // 12. Taxa de conversão (últimas 5 compras)
    const recent_activity = Object.entries(activityByDay)
      .map(([date, purchase_count]) => ({ date, purchase_count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .reverse();
      
    // 13. Obter dados de estoque das caixas
    let box_stock_data = [];
    try {
      const { data: boxStockData, error: boxStockError } = await supabase
        .from('box_stock')
        .select('*')
        .order('box_type');
        
      if (boxStockError) {
        console.error('Error fetching box stock data:', boxStockError);
      } else {
        box_stock_data = boxStockData || [];
      }
    } catch (err) {
      console.error('Error fetching box stock:', err);
    }
    
    // 14. Contar compras por tipo de caixa
    let crypto_boxes_opened = 0;
    let super_prize_boxes_opened = 0;
    
    try {
      const { data: boxStockData, error: boxStockError } = await supabase
        .from('box_stock')
        .select('*');
        
      if (boxStockError) {
        console.error('Error fetching box stock data for counts:', boxStockError);
      } else if (boxStockData && boxStockData.length > 0) {
        // Calcular com base na diferença entre estoque inicial e atual
        const cryptoBox = boxStockData.find(b => b.box_type === 'crypto');
        const superPrizeBox = boxStockData.find(b => b.box_type === 'super_prize');
        
        if (cryptoBox) {
          crypto_boxes_opened = cryptoBox.initial_stock - cryptoBox.current_stock;
        }
        
        if (superPrizeBox) {
          super_prize_boxes_opened = superPrizeBox.initial_stock - superPrizeBox.current_stock;
        }
        
        console.log('Box counts from stock difference:', { crypto_boxes_opened, super_prize_boxes_opened });
      } else {
        // Fallback: contar das compras
        const { count: cryptoCount, error: cryptoError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('is_crypto_box', true);
          
        const { count: superPrizeCount, error: superPrizeError } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('is_crypto_box', false);
          
        if (cryptoError) {
          console.error('Error counting crypto boxes:', cryptoError);
        } else {
          crypto_boxes_opened = cryptoCount || 0;
        }
        
        if (superPrizeError) {
          console.error('Error counting super prize boxes:', superPrizeError);
        } else {
          super_prize_boxes_opened = superPrizeCount || 0;
        }
        
        console.log('Box counts from purchase records:', { crypto_boxes_opened, super_prize_boxes_opened });
      }
    } catch (err) {
      console.error('Error counting box types:', err);
    }

    return NextResponse.json({
      success: true,
      data: {
        total_purchases: total_purchases || 0,
        total_value,
        physical_prizes_claimed,
        crypto_prizes_claimed,
        unique_wallets: uniqueWallets.size,
        top_wallets,
        prizes_by_popularity,
        recent_activity,
        
        // Dados para gráficos
        daily_activity: dailyActivity,
        daily_volume: dailyVolume,
        prize_distribution: Object.entries(prizeDistribution).map(([name, count]) => ({ name, count })),
        value_distribution: Object.entries(valueDistribution).map(([range, count]) => ({ range, count })),
        sales_by_hour: salesByHour.map((count, hour) => ({ hour, count })),
        
        // Dados de estoque das caixas
        box_stock_data,
        crypto_boxes_opened,
        super_prize_boxes_opened
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

// Função auxiliar para gerar array com os últimos 30 dias
function getLast30Days(): string[] {
  const dates = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
} 