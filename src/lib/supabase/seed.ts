
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing Supabase Environment Variables.');
    console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- DATA ---
const FUNDS = [
    { name: "Fund I", vintage: "2020", committed_capital: 10000000, currency: "USD" },
    { name: "Fund II", vintage: "2023", committed_capital: 30000000, currency: "USD" },
    { name: "Fund III", vintage: "2025", committed_capital: 50000000, currency: "USD" },
];

const INVESTORS = [
    { name: "Insight Partners", type: "VC", website: "insightpartners.com", contact_email: "investor@insightpartners.com" },
    { name: "Index Ventures", type: "VC", website: "indexventures.com", contact_email: "partners@indexventures.com" },
    { name: "Sequoia", type: "VC", website: "sequoiacap.com", contact_email: "pitch@sequoiacap.com" },
    { name: "Naval Ravikant", type: "Angel", website: "angel.co/naval", contact_email: "naval@angel.co" },
    { name: "Salesforce Ventures", type: "CVC", website: "salesforce.com/invest", contact_email: "ventures@salesforce.com" },
    { name: "Andreessen Horowitz", type: "VC", website: "a16z.com", contact_email: "deals@a16z.com" },
];

const INDUSTRIES = [
    { name: "Artificial Intelligence" },
    { name: "Fintech" },
    { name: "Cybersecurity" },
    { name: "Healthcare" },
    { name: "Infrastructure" },
];

// --- SEED FUNCTION ---
async function seed() {
    console.log('🌱 Starting Seed Process...');

    // 1. Funds
    console.log('Insering Funds...');
    const { error: fundError } = await supabase.from('funds').insert(FUNDS);
    if (fundError) console.error('Error inserting funds:', fundError);

    // 2. Investors
    console.log('Inserting Investors...');
    const { error: invError } = await supabase.from('investors').insert(INVESTORS);
    if (invError) console.error('Error inserting investors:', invError);

    // 3. Industries (Companies - creating dummy to hold industries if needed, or just skip as we don't have an industry table yet, purely text)
    // Note: Our schema puts 'sector' directly on Companies. We can't seed 'Industries' table because it doesn't exist in our SQL (it was just a Settings mock).
    // We will assume industries are just text tags for now.

    console.log('✅ Seed Complete!');
}

seed();
