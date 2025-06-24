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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from('purchases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching purchases:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      total: count,
      page,
      pageSize
    });

  } catch (error) {
    console.error('Error in purchases endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 