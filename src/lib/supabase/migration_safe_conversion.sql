-- Add column to store original SAFE terms when converting to Equity
ALTER TABLE financing_rounds
ADD COLUMN IF NOT EXISTS original_safe_terms JSONB;

-- Comment
COMMENT ON COLUMN financing_rounds.original_safe_terms IS 'Stores the original Valuation Cap and Discount when a SAFE round is converted to Equity, allowing for reversion.';
