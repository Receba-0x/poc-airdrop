import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/utils/auth';

export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
  try {
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
    const { prize_id, new_stock, action } = await request.json();
    if (!prize_id || (new_stock === undefined && action !== 'reset')) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters (prize_id, new_stock or action)'
      }, { status: 400 });
    }

    let result;
    if (action === 'reset') {
      result = await supabase.rpc('reset_prize_stock', { p_prize_id: prize_id });
    } else if (action === 'increment') {
      result = await supabase.rpc('increment_stock', { p_prize_id: prize_id });
    } else if (action === 'decrement') {
      result = await supabase.rpc('decrement_stock', { p_prize_id: prize_id });
    } else {
      result = await supabase
        .from('prize_stock')
        .update({
          current_stock: new_stock,
          updated_at: new Date().toISOString()
        })
        .eq('prize_id', prize_id);
    }

    if (result.error) {
      console.error('Error updating stock:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error.message
      }, { status: 500 });
    }

    // Buscar os dados atualizados
    const { data: updatedStock, error: fetchError } = await supabase
      .from('prize_stock')
      .select('*')
      .eq('prize_id', prize_id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated stock:', fetchError);
      return NextResponse.json({
        success: true,
        message: 'Stock updated but could not fetch the updated data'
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedStock
    });

  } catch (error) {
    console.error('Error in update-stock endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Função para obter todos os estoques
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

    // Obter o prize_id dos parâmetros da URL, se fornecido
    const url = new URL(request.url);
    const prize_id = url.searchParams.get('prize_id');

    let query = supabase.from('prize_stock').select('*');

    // Se um prize_id específico foi fornecido, filtrar por ele
    if (prize_id) {
      query = query.eq('prize_id', prize_id);
    } else {
      // Caso contrário, ordenar pelo prize_id
      query = query.order('prize_id');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stock data:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: prize_id ? (data[0] || null) : data
    });

  } catch (error) {
    console.error('Error in get-stock endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}