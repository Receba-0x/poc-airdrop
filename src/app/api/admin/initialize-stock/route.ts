import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/utils/auth';

// Configuração de runtime para garantir execução no servidor
export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const isAuthorized = await isAuthenticated(authHeader);
    
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Chamar a função para criar/preencher a tabela prize_stock
    const { data, error } = await supabase.rpc('create_prize_stock_table');

    if (error) {
      console.error('Error initializing prize stock table:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Obter os dados da tabela para confirmar
    const { data: stockData, error: fetchError } = await supabase
      .from('prize_stock')
      .select('*')
      .order('prize_id');

    if (fetchError) {
      console.error('Error fetching prize stock data:', fetchError);
      return NextResponse.json({ 
        success: true, 
        message: 'Prize stock table initialized but could not fetch data'
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Prize stock table initialized successfully',
      data: stockData
    });

  } catch (error) {
    console.error('Error in initialize-stock endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 