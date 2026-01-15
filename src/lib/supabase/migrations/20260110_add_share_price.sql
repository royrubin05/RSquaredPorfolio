-- Add share_price to financing_rounds if it doesn't exist
ALTER TABLE financing_rounds
ADD COLUMN IF NOT EXISTS share_price NUMERIC;

-- Ensure original_safe_terms exists (re-runnable)
ALTER TABLE financing_rounds
ADD COLUMN IF NOT EXISTS original_safe_terms JSONB;

COMMENT ON COLUMN financing_rounds.share_price IS 'Price per share for Equity rounds';
