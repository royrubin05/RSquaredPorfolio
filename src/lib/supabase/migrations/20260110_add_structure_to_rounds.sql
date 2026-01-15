-- Add structure column (e.g. 'SAFE', 'Equity', 'Priced Round')
ALTER TABLE financing_rounds
ADD COLUMN IF NOT EXISTS structure TEXT DEFAULT 'Equity';

-- Ensure other potential missing SAFE/Equity fields exist
ALTER TABLE financing_rounds
ADD COLUMN IF NOT EXISTS valuation_cap NUMERIC,
ADD COLUMN IF NOT EXISTS safe_discount NUMERIC,
ADD COLUMN IF NOT EXISTS post_money_valuation NUMERIC;

COMMENT ON COLUMN financing_rounds.structure IS 'Type of financing round: SAFE, Equity, Convertible Note, etc.';
