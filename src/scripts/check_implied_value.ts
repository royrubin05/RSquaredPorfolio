
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanyData(companyId: string) {
    console.log(`Checking data for company: ${companyId}`);

    // 1. Fetch Rounds
    const { data: rounds, error: roundsError } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('company_id', companyId)
        .order('close_date', { ascending: false }); // Debug the raw sort order

    if (roundsError) {
        console.error('Error fetching rounds:', roundsError);
        return;
    }

    console.log('\n--- Rounds (Sorted by DB close_date desc) ---');
    rounds?.forEach((r, idx) => {
        console.log(`#${idx + 1} ID: ${r.id}`);
        console.log(`   Label: ${r.round_label}`);
        console.log(`   Date: ${r.close_date}`);
        console.log(`   Valuation: ${r.post_money_valuation}`);
        console.log(`   PPS: ${r.price_per_share}`);
        console.log(`   Created At: ${r.created_at}`);
    });

    // 2. Fetch Transactions
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*, funds(name)')
        .in('round_id', rounds?.map(r => r.id) || []);

    if (txError) {
        console.error('Error fetching transactions:', txError);
        return;
    }

    console.log('\n--- Transactions ---');
    transactions?.forEach(t => {
        console.log(`ID: ${t.id}`);
        console.log(`   Fund: ${t.funds?.name}`);
        console.log(`   Round ID: ${t.round_id}`);
        console.log(`   Amount: ${t.amount_invested}`);
        console.log(`   Shares: ${t.shares_purchased}`);
        console.log(`   Type: ${t.equity_type}`);
    });

    // 3. Simulate Logic
    const latestRound = rounds?.[0];
    const latestPps = Number(latestRound?.price_per_share);
    console.log(`\n--- Simulation ---`);
    console.log(`Latest Round for PPS Logic: ${latestRound?.round_label} (${latestRound?.close_date})`);
    console.log(`Latest PPS: ${latestPps}`);

    if (transactions) {
        let totalShares = 0;
        let totalCost = 0;
        transactions.forEach(t => {
            totalShares += Number(t.shares_purchased || 0);
            totalCost += Number(t.amount_invested || 0);
        });

        const impliedValue = totalShares * latestPps;
        console.log(`Total Shares: ${totalShares}`);
        console.log(`Total Cost: ${totalCost}`);
        console.log(`Calculated Implied Value (Shares * PPS): ${impliedValue}`);
    }
}

checkCompanyData('4baab0b2-588b-4f8f-adc0-313c11acf553');
