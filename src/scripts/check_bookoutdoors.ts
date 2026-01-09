
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking BookOutdoors SPV Data...');

    // 1. Find the Fund
    const { data: funds, error: fundError } = await supabase
        .from('funds')
        .select('*')
        .ilike('name', '%BookOutdoors%');

    if (fundError) {
        console.error('Error fetching funds:', fundError);
        return;
    }

    if (!funds || funds.length === 0) {
        console.log('No fund found matching "BookOutdoors"');
    } else {
        funds.forEach(f => {
            console.log(`Fund Found: ${f.name} (ID: ${f.id})`);
            console.log(`  - Committed Capital: ${f.committed_capital}`);
            console.log(`  - Investable Amount: ${f.investable_amount}`);

            // 2. Find Transactions for this Fund
            checkTransactions(f.id);
        });
    }
}

async function checkTransactions(fundId: string) {
    const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*, financing_rounds(id, round_label, company_id, companies(name))')
        .eq('fund_id', fundId);

    if (txError) {
        console.error('Error fetching transactions:', txError);
        return;
    }

    const totalInvested = txs?.reduce((sum, t) => sum + Number(t.amount_invested), 0) || 0;
    console.log(`  - Transactions Found: ${txs?.length}`);
    console.log(`  - Total Invested per Transactions: ${totalInvested}`);

    txs?.forEach(t => {
        // @ts-ignore
        const companyName = t.financing_rounds?.companies?.name || 'Unknown';
        // @ts-ignore
        const roundName = t.financing_rounds?.round_label || 'Unknown';
        console.log(`    -> Tx: $${t.amount_invested} in ${companyName} (${roundName})`);
    });
}

checkData();
