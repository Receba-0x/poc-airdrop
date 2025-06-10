import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function setupDatabase() {
  try {
    console.log('Checking database setup...');
    
    // Check if prize_stock table exists
    const { data: stockExists, error: stockCheckError } = await supabase
      .from('prize_stock')
      .select('*')
      .limit(1);
    
    if (stockCheckError && stockCheckError.code === '42P01') { // Table doesn't exist
      console.log('Creating prize_stock table...');
      
      // Create prize_stock table (using SQL query through Supabase's REST API)
      const { error: createError } = await supabase.rpc('create_prize_stock_table', {});
      
      if (createError) {
        console.error('Error creating prize_stock table:', createError);
        
        // Fallback: Create stock for existing prizes in purchases table
        console.log('Attempting to create stock data from existing purchases...');
        await createStockFromPurchases();
      } else {
        console.log('prize_stock table created successfully.');
      }
    } else {
      console.log('prize_stock table already exists.');
    }
    
    // Check if box_stock table exists
    const { data: boxStockExists, error: boxStockCheckError } = await supabase
      .from('box_stock')
      .select('*')
      .limit(1);
    
    if (boxStockCheckError && boxStockCheckError.code === '42P01') { // Table doesn't exist
      console.log('Creating box_stock table...');
      
      // Create box_stock table directly using SQL
      const { error: createBoxStockError } = await supabase.rpc('create_box_stock_table', {});
      
      if (createBoxStockError) {
        console.error('Error creating box_stock table:', createBoxStockError);
        
        // Fallback: Create box_stock table directly
        await createBoxStockTable();
      } else {
        console.log('box_stock table created successfully.');
      }
    } else {
      console.log('box_stock table already exists.');
    }
    
    console.log('Database setup complete.');
    return { success: true };
  } catch (error) {
    console.error('Database setup error:', error);
    return { success: false, error };
  }
}

/**
 * Create stock data based on existing purchases
 * This is a fallback method if the table creation fails
 */
async function createStockFromPurchases() {
  try {
    // Get unique prize IDs from purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('prize_id, prize_name')
      .order('prize_id');
    
    if (purchasesError) {
      throw new Error(`Error fetching purchases: ${purchasesError.message}`);
    }
    
    // Extract unique prizes
    const uniquePrizes = Array.from(
      new Map(purchases.map(p => [p.prize_id, { prize_id: p.prize_id, prize_name: p.prize_name }]))
      .values()
    );
    
    // Physical prizes only (IDs based on save-purchase/route.ts)
    const physicalPrizes = uniquePrizes.filter(p => 
      [8, 9, 10, 11, 12, 13].includes(p.prize_id)
    );
    
    if (physicalPrizes.length === 0) {
      console.log('No physical prizes found in purchases.');
      return;
    }
    
    // Count purchases by prize_id
    const prizeCounts: Record<number, number> = {};
    purchases.forEach(p => {
      if ([8, 9, 10, 11, 12, 13].includes(p.prize_id)) {
        prizeCounts[p.prize_id] = (prizeCounts[p.prize_id] || 0) + 1;
      }
    });
    
    // Create stock data
    const stockData = physicalPrizes.map(prize => ({
      prize_id: prize.prize_id,
      prize_name: prize.prize_name,
      current_stock: Math.max(10 - (prizeCounts[prize.prize_id] || 0), 0), // Assume initial stock was 10
      initial_stock: 10
    }));
    
    // Insert stock data
    const { error: insertError } = await supabase
      .from('prize_stock')
      .insert(stockData);
    
    if (insertError) {
      throw new Error(`Error inserting stock data: ${insertError.message}`);
    }
    
    console.log(`Created stock data for ${stockData.length} prizes.`);
  } catch (error) {
    console.error('Error creating stock from purchases:', error);
    throw error;
  }
}

/**
 * Create box_stock table with initial data if needed
 */
async function createBoxStockTable() {
  try {
    // First, create the table
    const { error: tableError } = await supabase.from('box_stock').select('count');
    
    // If error means table doesn't exist, create it
    if (tableError && tableError.code === '42P01') {
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
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTable });
      
      if (createError) {
        throw new Error(`Error creating box_stock table: ${createError.message}`);
      }
    }
    
    // Count existing purchases by box type to determine initial stock
    const { data: cryptoCount, error: cryptoCountError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('is_crypto_box', true);
      
    const { data: superPrizeCount, error: superPrizeCountError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('is_crypto_box', false);
    
    // Handle errors
    if (cryptoCountError) console.error('Error counting crypto boxes:', cryptoCountError);
    if (superPrizeCountError) console.error('Error counting super prize boxes:', superPrizeCountError);
    
    const MAX_BOXES = 275;
    const cryptoBoxesOpened = cryptoCount ? Number(cryptoCount) : 0;
    const superPrizeBoxesOpened = superPrizeCount ? Number(superPrizeCount) : 0;
    
    // Insert initial box stock data
    const { error: insertError } = await supabase
      .from('box_stock')
      .insert([
        {
          box_type: 'crypto',
          name: 'Crypto Box',
          current_stock: Math.max(0, MAX_BOXES - cryptoBoxesOpened),
          initial_stock: MAX_BOXES
        },
        {
          box_type: 'super_prize',
          name: 'Super Prize Box',
          current_stock: Math.max(0, MAX_BOXES - superPrizeBoxesOpened),
          initial_stock: MAX_BOXES
        }
      ]);
    
    if (insertError) {
      // If error is about unique constraint, the records may already exist
      if (insertError.code !== '23505') { // Not a unique violation
        throw new Error(`Error inserting initial box stock data: ${insertError.message}`);
      }
    }
    
    console.log(`Created box_stock table with initial data`);
  } catch (error) {
    console.error('Error creating box_stock table:', error);
    throw error;
  }
}

// Create a SQL function to create the box_stock table
// This should be run once via the Supabase dashboard SQL editor
export const createBoxStockTableSQL = `
-- Create function to set up box_stock table
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

// Create a SQL function to create the prize_stock table
// This should be run once via the Supabase dashboard SQL editor
export const createPrizeStockTableSQL = `
-- Create function to set up prize_stock table
CREATE OR REPLACE FUNCTION create_prize_stock_table()
RETURNS void AS $$
BEGIN
  -- Create prize_stock table if it doesn't exist
  CREATE TABLE IF NOT EXISTS prize_stock (
    id SERIAL PRIMARY KEY,
    prize_id INTEGER NOT NULL UNIQUE,
    prize_name TEXT NOT NULL,
    current_stock INTEGER NOT NULL,
    initial_stock INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Initial stock data for physical prizes
  INSERT INTO prize_stock (prize_id, prize_name, current_stock, initial_stock)
  VALUES
    (8, 'Macbook Pro', 10, 10),
    (9, 'iPhone 15', 20, 20),
    (10, 'PlayStation 5', 15, 15),
    (11, 'Airpods Pro', 30, 30),
    (12, 'Nintendo Switch', 25, 25),
    (13, 'Gift Card', 100, 100)
  ON CONFLICT (prize_id) DO NOTHING;
  
  -- Create function to decrement stock
  CREATE OR REPLACE FUNCTION decrement_stock(prize_id INTEGER)
  RETURNS INTEGER AS $$
  DECLARE
    new_stock INTEGER;
  BEGIN
    UPDATE prize_stock
    SET current_stock = GREATEST(current_stock - 1, 0)
    WHERE prize_stock.prize_id = $1
    RETURNING current_stock INTO new_stock;
    
    RETURN new_stock;
  END;
  $$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;
`; 