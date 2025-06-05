-- Arquivo de configuração para ser executado no Supabase SQL Editor
-- Este script cria a tabela prize_stock e a função para decrementar o estoque

-- Primeiro, cria a tabela de estoque de prêmios se não existir
CREATE TABLE IF NOT EXISTS prize_stock (
  id SERIAL PRIMARY KEY,
  prize_id INTEGER NOT NULL UNIQUE,
  prize_name TEXT NOT NULL,
  current_stock INTEGER NOT NULL,
  initial_stock INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cria ou substitui a função para decrementar o estoque
CREATE OR REPLACE FUNCTION decrement_stock(prize_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE prize_stock
  SET 
    current_stock = GREATEST(current_stock - 1, 0),
    updated_at = now()
  WHERE prize_stock.prize_id = $1
  RETURNING current_stock INTO new_stock;
  
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql;

-- Cria ou substitui a função que o código da aplicação chama para inicializar a tabela
CREATE OR REPLACE FUNCTION create_prize_stock_table()
RETURNS void AS $$
BEGIN
  -- Os dados iniciais para prêmios físicos
  INSERT INTO prize_stock (prize_id, prize_name, current_stock, initial_stock)
  VALUES
    (8, 'Macbook Pro', 10, 10),
    (9, 'iPhone 15', 20, 20),
    (10, 'PlayStation 5', 15, 15),
    (11, 'Airpods Pro', 30, 30),
    (12, 'Nintendo Switch', 25, 25),
    (13, 'Gift Card', 100, 100)
  ON CONFLICT (prize_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Adiciona políticas de segurança para controle de acesso (RLS)
ALTER TABLE prize_stock ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas leitura por usuários anônimos
CREATE POLICY "Public prize stock read access" 
  ON prize_stock FOR SELECT 
  USING (true);

-- Política para permitir atualizações apenas pela função de API
CREATE POLICY "Update stock through function only" 
  ON prize_stock FOR UPDATE 
  USING (true);

-- Executar a função para preencher os dados iniciais
SELECT create_prize_stock_table(); 