-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Funds (Checkbooks)
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Fund II"
    vintage TEXT,       -- e.g. "2023"
    committed_capital NUMERIC NOT NULL, -- AUM
    investable_amount NUMERIC,
    currency TEXT DEFAULT 'USD',
    formation_date DATE,
    investment_period_start DATE,
    investment_period_end DATE,
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

-- 3. Investors (The Network CRM)
CREATE TYPE investor_type AS ENUM ('VC', 'Angel', 'CVC', 'PE', 'Family Office');

CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type investor_type,
    website TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 5. RoundSyndicate (Junction Table)
CREATE TYPE syndicate_role AS ENUM ('Lead', 'Co-Investor');

CREATE TABLE round_syndicate (
    round_id UUID REFERENCES financing_rounds(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    role syndicate_role DEFAULT 'Co-Investor',
    PRIMARY KEY (round_id, investor_id)
);

-- 6. Transactions (The Ledger)
CREATE TYPE transaction_type AS ENUM ('Investment', 'Exit');
CREATE TYPE security_type AS ENUM ('SAFE', 'Equity', 'Note', 'Warrant');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fund_id UUID REFERENCES funds(id),
    round_id UUID REFERENCES financing_rounds(id),
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    amount_invested NUMERIC NOT NULL, -- Cost Basis
    shares_purchased NUMERIC,
    ownership_percentage NUMERIC, -- Snapshot at time of deal
    security_type security_type,
    -- Warrant Specifics
    warrant_coverage_percentage NUMERIC, -- e.g. 20%
    warrant_expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Documents (Data Room)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, 
    round_id UUID REFERENCES financing_rounds(id) ON DELETE CASCADE,
    fund_id UUID REFERENCES funds(id),
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

