-- Add missing columns for Feature Requests
ALTER TABLE feature_requests 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Feature',
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;
