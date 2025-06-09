-- Add team_selected column to purchases table
ALTER TABLE IF EXISTS purchases
ADD COLUMN IF NOT EXISTS team_selected VARCHAR(50);

-- Add comment to describe the column
COMMENT ON COLUMN purchases.team_selected IS 'Team selection for jersey prizes (e.g., corinthians, brasil, flamengo, internacional)'; 