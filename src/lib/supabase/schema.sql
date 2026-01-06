-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Funds (Checkbooks)
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Fund II"
    committed_capital NUMERIC NOT NULL, -- e.g. 30000000
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies (Assets)
CREATE TYPE company_status AS ENUM ('Active', 'Exit', 'Dead');

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Nimble"
    legal_name TEXT,
    status company_status DEFAULT 'Active',
    industry TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Investors (The Network CRM)
CREATE TYPE investor_type AS ENUM ('VC', 'Angel', 'CVC');

CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "Insight Partners"
    type investor_type NOT NULL,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FinancingRounds (Market Events)
CREATE TABLE financing_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    round_label TEXT NOT NULL, -- e.g. "Series A"
    close_date DATE NOT NULL,
    pre_money_valuation NUMERIC,
    price_per_share NUMERIC NOT NULL, -- Critical: Drivers valuation
    round_size NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RoundSyndicate (Junction Table)
CREATE TYPE syndicate_role AS ENUM ('Lead', 'Major Investor', 'Follower');

CREATE TABLE round_syndicate (
    round_id UUID NOT NULL REFERENCES financing_rounds(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    role syndicate_role NOT NULL,
    PRIMARY KEY (round_id, investor_id)
);

-- 6. Transactions (The Ledger)
CREATE TYPE transaction_type AS ENUM ('Initial Investment', 'Follow-on', 'Warrant', 'Exit');
CREATE TYPE security_type AS ENUM ('SAFE', 'Equity', 'Note');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES financing_rounds(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    amount_invested NUMERIC NOT NULL, -- Cost Basis
    shares_purchased NUMERIC NOT NULL,
    security_type security_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_financing_rounds_company_id ON financing_rounds(company_id);
CREATE INDEX idx_transactions_fund_id ON transactions(fund_id);
CREATE INDEX idx_transactions_round_id ON transactions(round_id);
