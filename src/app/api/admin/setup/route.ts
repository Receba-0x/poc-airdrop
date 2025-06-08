import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase } from '@/utils/dbSetup';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Simple middleware to check admin auth - same as other admin endpoints
const checkAdminAuth = (request: NextRequest) => {
  const referer = request.headers.get('referer') || '';
  if (!referer.includes('/admin')) {
    return false;
  }
  return true;
};

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    // Setup básico - Tabela de compras
    const setupPurchasesSQL = `
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        wallet_address TEXT NOT NULL,
        nft_mint TEXT,
        nft_metadata JSONB,
        amount_purchased NUMERIC(18, 9) NOT NULL,
        prize_id INTEGER NOT NULL,
        prize_name TEXT NOT NULL,
        transaction_signature TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_crypto BOOLEAN DEFAULT FALSE
      );
    `;

    // Setup de estoque
    const setupStockSQL = `
      CREATE TABLE IF NOT EXISTS prize_stock (
        id SERIAL PRIMARY KEY,
        prize_id INTEGER NOT NULL,
        prize_name TEXT NOT NULL,
        current_stock INTEGER NOT NULL,
        initial_stock INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Setup de endereços de entrega e atualizações nas compras
    const shippingSetupPath = path.join(process.cwd(), 'scripts', 'setup_shipping_addresses.sql');
    let shippingSetupSQL = '';
    
    try {
      shippingSetupSQL = fs.readFileSync(shippingSetupPath, 'utf8');
    } catch (err) {
      console.error('Erro ao ler arquivo SQL de endereços:', err);
      shippingSetupSQL = `
        -- Tabela para armazenar endereços de entrega
        CREATE TABLE IF NOT EXISTS shipping_addresses (
          id SERIAL PRIMARY KEY,
          wallet_address TEXT NOT NULL,
          full_name TEXT NOT NULL,
          country TEXT NOT NULL,
          street_address TEXT NOT NULL,
          apartment TEXT,
          city TEXT NOT NULL,
          state_province TEXT NOT NULL,
          zip_code TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índice para buscas por carteira
        CREATE INDEX IF NOT EXISTS idx_shipping_addresses_wallet ON shipping_addresses(wallet_address);
        
        -- Adicionar coluna na tabela de compras para referenciar o endereço de entrega
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipping_address_id INTEGER REFERENCES shipping_addresses(id);
        
        -- Adicionar coluna para armazenar a assinatura de queima do NFT
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS burn_signature TEXT;
        
        -- Adicionar coluna de status para indicar se o item foi reclamado
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
        
        -- Adicionar um índice para consulta por transação
        CREATE INDEX IF NOT EXISTS idx_purchases_nft_mint ON purchases(nft_mint);
        
        -- Adicionar um índice para consulta por carteira
        CREATE INDEX IF NOT EXISTS idx_purchases_wallet_address ON purchases(wallet_address);
      `;
    }

    // Executar SQL de configuração
    console.log('Executando SQL de configuração...');
    await supabase.rpc('exec_sql', { sql: setupPurchasesSQL });
    await supabase.rpc('exec_sql', { sql: setupStockSQL });
    await supabase.rpc('exec_sql', { sql: shippingSetupSQL });

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    });
  } catch (error: any) {
    console.error('Error setting up database:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error setting up database'
    }, { status: 500 });
  }
} 