-- Add submitted_by column to feature_requests
ALTER TABLE feature_requests 
ADD COLUMN IF NOT EXISTS submitted_by TEXT;
