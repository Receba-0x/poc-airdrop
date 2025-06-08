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

-- Adicionar um índice para consulta por NFT mint (não transaction_id)
CREATE INDEX IF NOT EXISTS idx_purchases_nft_mint ON purchases(nft_mint);

-- Adicionar um índice para consulta por carteira
CREATE INDEX IF NOT EXISTS idx_purchases_wallet_address ON purchases(wallet_address); 