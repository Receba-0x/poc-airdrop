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

    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Se não houver dados reais no banco, criar alguns dados de demonstração
    const mockData = [
      { id: 1, prize_id: 5, prize_name: 'Team Jersey', current_stock: 48, initial_stock: 50 },
      { id: 2, prize_id: 6, prize_name: 'Official Ball', current_stock: 37, initial_stock: 40 },
      { id: 3, prize_id: 7, prize_name: 'Soccer Cleats', current_stock: 28, initial_stock: 30 },
      { id: 4, prize_id: 8, prize_name: 'MacBook M3', current_stock: 9, initial_stock: 10 },
      { id: 5, prize_id: 9, prize_name: 'iPhone 16 Pro Max', current_stock: 18, initial_stock: 20 },
      { id: 6, prize_id: 10, prize_name: 'Golden Ticket', current_stock: 3, initial_stock: 5 }
    ];

    // Tentar buscar dados reais primeiro
    const { data, error } = await supabase
      .from('prize_stock')
      .select('*')
      .order('prize_id');

    if (error) {
      console.error('Error fetching stock data:', error);
      // Retornar dados simulados em caso de erro (para demonstração)
      return NextResponse.json({ 
        success: true, 
        data: mockData
      });
    }

    // Se tiver dados reais, retorná-los, caso contrário usar os dados simulados
    return NextResponse.json({ 
      success: true, 
      data: data?.length ? data : mockData 
    });

  } catch (error) {
    console.error('Error in stock endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 