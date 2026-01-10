-- Create Feature Requests Table
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Done'
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Optional, depending on policy, but good practice)
-- ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access for team" ON feature_requests FOR ALL USING (true);
