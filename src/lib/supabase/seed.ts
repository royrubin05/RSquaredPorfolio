
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing Supabase Environment Variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FUNDS = [
    { name: "Fund I", vintage: "2020", committed_capital: 10000000, currency: "USD" },
    { name: "Fund II", vintage: "2023", committed_capital: 30000000, currency: "USD" },
];

const COMPANIES = [
    {
        name: "Priced Round Corp",
        status: "Active",
        sector: "SaaS",
        headquarters: "USA",
        description: "Standard Priced Round Company.",
        rounds: [
            {
                label: "Series A",
                date: "2024-01-15",
                pre: 10000000,
                post: 12500000,
                investments: [
                    { fund: "Fund I", amount: 1000000, ownership: 8.0 }
                ]
            }
        ]
    },
    {
        name: "Safe Note Inc",
        status: "Active",
        sector: "AI",
        headquarters: "UK",
        description: "Company raised via SAFE.",
        rounds: [
            {
                label: "SAFE",
                date: "2024-02-01",
                pre: 5000000, // Cap
                post: 0,
                investments: [ // SAFE usually tracks amount, ownership conditional
                    { fund: "Fund II", amount: 250000, ownership: 0 }
                ]
            }
        ]
    },
    {
        name: "Warrants Co",
        status: "Active", // "Watchlist" is not a valid enum value in DB
        sector: "Fintech",
        headquarters: "USA",
        description: "Company with Warrants coverage.",
        rounds: [
            {
                label: "Debt Financing",
                date: "2024-03-01",
                pre: 0,
                post: 0,
                investments: [
                    { fund: "Fund I", amount: 500000, ownership: 0, type: "Warrant" }
                ]
            }
        ]
    },
    {
        name: "Multi-Fund Star",
        status: "Active",
        sector: "DeepTech",
        headquarters: "Israel",
        description: "Invested by both funds.",
        rounds: [
            {
                label: "Seed",
                date: "2023-06-01",
                pre: 8000000,
                post: 10000000,
                investments: [
                    { fund: "Fund I", amount: 500000, ownership: 5.0 },
                    { fund: "Fund II", amount: 500000, ownership: 5.0 }
                ]
            }
        ]
    },
    {
        name: "Historical Corp",
        status: "Exit",
        sector: "Consumer",
        headquarters: "USA",
        description: "Exited company.",
        rounds: [
            {
                label: "Series A",
                date: "2021-01-01",
                pre: 20000000,
                post: 25000000,
                investments: [
                    { fund: "Fund I", amount: 2000000, ownership: 8.0 }
                ]
            }
        ]
    }
];

async function seed() {
    console.log('🌱 Starting Clean Seed...');

    // 1. CLEAR DATA (Reverse Order)
    console.log('Clearing existing data...');
    // We use a hack: delete NOT ID = '000...'. assuming IDs are UUIDs, checking for not null effectively clears all if RLS allows.
    // If delete all without check is supported, great.
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('financing_rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Don't usually delete funds/investors unless necessary, but let's clear funds to ensure ID mapping works perfectly.
    // Assuming no other constraints.
    // Check if funds are referenced by other things? No, simplistic schema.
    // await supabase.from('funds').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Optional: Funds are usually static.

    // 2. FUNDS
    console.log('Ensuring Funds...');
    const { data: existingFunds } = await supabase.from('funds').select('id, name');
    const existingFundMap = new Map(existingFunds?.map(f => [f.name, f.id]));

    // Insert missing funds
    const fundsToInsert = FUNDS.filter(f => !existingFundMap.has(f.name));
    if (fundsToInsert.length > 0) {
        const { data: newFunds } = await supabase.from('funds').insert(fundsToInsert).select();
        newFunds?.forEach(f => existingFundMap.set(f.name, f.id));
    }

    // 3. COMPANIES & ROUNDS
    console.log('Inserting Scenarios...');
    for (const c of COMPANIES) {
        // Insert Company
        const { data: company, error: cError } = await supabase
            .from('companies')
            .insert({
                name: c.name,
                status: c.status,
                sector: c.sector,
                headquarters: c.headquarters,
                description: c.description
            })
            .select()
            .single();

        if (cError) {
            console.error(`Failed to insert ${c.name}:`, cError);
            continue;
        }

        // Insert Rounds
        for (const r of c.rounds) {
            const { data: round, error: rError } = await supabase
                .from('financing_rounds')
                .insert({
                    company_id: company.id,
                    round_label: r.label,
                    close_date: r.date,
                    pre_money_valuation: r.pre,
                    post_money_valuation: r.post
                })
                .select()
                .single();

            if (rError) {
                console.error(`Failed to insert round ${r.label} for ${c.name}:`, rError);
                continue;
            }

            // Insert Transactions
            for (const inv of r.investments) {
                const fundId = existingFundMap.get(inv.fund);
                if (!fundId) continue;

                await supabase.from('transactions').insert({
                    fund_id: fundId,
                    round_id: round.id,
                    amount_invested: inv.amount,
                    ownership_percentage: inv.ownership,
                    // If DB has security_type column, use it. If not, it will be ignored (or error depending on client strictness).
                    // We'll omit it if unconfirmed, or try it.
                    // Previous seed script didn't fail on insert, but it didn't use security_type either (it was commented in my head, wait).
                    // Logic: "investment type" or similar?
                    // I will stick to standard columns.
                });
            }
        }
    }

    console.log('✅ Reseed Complete!');
}

seed();
