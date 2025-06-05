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