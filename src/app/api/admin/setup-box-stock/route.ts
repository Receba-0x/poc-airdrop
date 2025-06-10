import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticated } from '@/utils/auth';
import { createBoxStockTableSQL } from '@/utils/dbSetup';

export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: Request) {
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

    // Create function first
    const createFunction = `
      CREATE OR REPLACE FUNCTION create_box_stock_table()
      RETURNS void AS $$
      BEGIN
        -- Create box_stock table if it doesn't exist
        CREATE TABLE IF NOT EXISTS box_stock (
          id SERIAL PRIMARY KEY,
          box_type TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          current_stock INTEGER NOT NULL,
          initial_stock INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Initial stock data
        INSERT INTO box_stock (box_type, name, current_stock, initial_stock)
        VALUES
          ('crypto', 'Crypto Box', 275, 275),
          ('super_prize', 'Super Prize Box', 275, 275)
        ON CONFLICT (box_type) DO NOTHING;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Execute the function creation
    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql: createFunction
    });

    if (createFunctionError) {
      console.error('Error creating function:', createFunctionError);
      return NextResponse.json({
        success: false,
        error: createFunctionError.message
      }, { status: 500 });
    }

    // Call the function to create the box_stock table
    const { error: callFunctionError } = await supabase.rpc('create_box_stock_table');

    if (callFunctionError) {
      console.error('Error calling create_box_stock_table function:', callFunctionError);
      
      // Try direct SQL as fallback
      const createTable = `
        CREATE TABLE IF NOT EXISTS box_stock (
          id SERIAL PRIMARY KEY,
          box_type TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          current_stock INTEGER NOT NULL,
          initial_stock INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        INSERT INTO box_stock (box_type, name, current_stock, initial_stock)
        VALUES
          ('crypto', 'Crypto Box', 275, 275),
          ('super_prize', 'Super Prize Box', 275, 275)
        ON CONFLICT (box_type) DO NOTHING;
      `;
      
      const { error: directSqlError } = await supabase.rpc('exec_sql', {
        sql: createTable
      });
      
      if (directSqlError) {
        console.error('Error executing direct SQL:', directSqlError);
        return NextResponse.json({
          success: false,
          error: directSqlError.message
        }, { status: 500 });
      }
    }

    // Migration successful
    return NextResponse.json({
      success: true,
      message: 'Box stock table set up successfully'
    });

  } catch (error) {
    console.error('Error in setup-box-stock endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 