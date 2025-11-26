-- ============================================
-- Tabela para armazenar envios de tokens
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Criar tabela de transferências de tokens
CREATE TABLE IF NOT EXISTS token_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_wallet TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  amount_raw TEXT NOT NULL, -- Quantidade em unidades menores (sem decimais)
  decimals INTEGER NOT NULL DEFAULT 6,
  token_mint TEXT NOT NULL,
  transaction_signature TEXT NOT NULL UNIQUE,
  system_wallet TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  network TEXT NOT NULL, -- 'mainnet', 'devnet', 'testnet'
  block_time TIMESTAMP WITH TIME ZONE,
  slot BIGINT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_token_transfers_recipient_wallet ON token_transfers(recipient_wallet);
CREATE INDEX IF NOT EXISTS idx_token_transfers_transaction_signature ON token_transfers(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_token_transfers_user_email ON token_transfers(user_email);
CREATE INDEX IF NOT EXISTS idx_token_transfers_token_mint ON token_transfers(token_mint);
CREATE INDEX IF NOT EXISTS idx_token_transfers_created_at ON token_transfers(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transfers_status ON token_transfers(status);

-- Habilitar Row Level Security
ALTER TABLE token_transfers ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver
DROP POLICY IF EXISTS "Allow public insert on token_transfers" ON token_transfers;

-- Criar política para permitir inserção pública (do servidor)
CREATE POLICY "Allow public insert on token_transfers"
ON token_transfers
FOR INSERT
TO public
WITH CHECK (true);

-- Criar política para permitir leitura pública (opcional - ajuste conforme necessário)
DROP POLICY IF EXISTS "Allow public select on token_transfers" ON token_transfers;
CREATE POLICY "Allow public select on token_transfers"
ON token_transfers
FOR SELECT
TO public
USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_token_transfers_updated_at ON token_transfers;
CREATE TRIGGER update_token_transfers_updated_at
    BEFORE UPDATE ON token_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

