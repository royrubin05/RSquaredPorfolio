-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Funds (Checkbooks)
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Fund II"
    vintage TEXT,       -- e.g. "2023"
    committed_capital NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies (Assets)
CREATE TYPE company_status AS ENUM ('Active', 'Exit', 'Dead');

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    legal_name TEXT,
    status company_status DEFAULT 'Active',
    sector TEXT,
    description TEXT,
    website TEXT,
    founded_year TEXT,
    headquarters TEXT,
    drive_folder_id TEXT, -- Google Drive Folder ID for this Company
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... (Investors table remains same)

-- 4. FinancingRounds (Market Events)
CREATE TABLE financing_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    round_label TEXT NOT NULL,
    close_date DATE NOT NULL,
    pre_money_valuation NUMERIC,
    post_money_valuation NUMERIC,
    price_per_share NUMERIC,
    round_size NUMERIC,
    shares_issued NUMERIC,
    drive_folder_id TEXT, -- Google Drive Folder ID for this Round
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... (Syndicate & Transactions remain same)

-- 7. Documents (Data Room)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, 
    round_id UUID REFERENCES financing_rounds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT,
    size_bytes BIGINT,
    uploaded_by UUID,
    -- Storage Metadata
    storage_provider TEXT DEFAULT 'google_drive', -- 'google_drive' or 'supabase'
    file_url TEXT, -- View Link (WebViewLink)
    drive_file_id TEXT, -- Google Drive File ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notes (Updates & Annotations)
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT, -- Temporary until Auth is fully linked
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rounds_company ON financing_rounds(company_id);
CREATE INDEX idx_tx_fund ON transactions(fund_id);
CREATE INDEX idx_tx_round ON transactions(round_id);
CREATE INDEX idx_docs_company ON documents(company_id);
CREATE INDEX idx_notes_company ON notes(company_id);

