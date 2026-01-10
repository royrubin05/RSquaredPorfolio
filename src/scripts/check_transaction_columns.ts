
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use Anon Key as per verify_industries.ts

console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions(companyId: string) {
    console.log(`Checking transactions for Company ID: ${companyId}`);

    // Get Rounds first
    const { data: rounds, error: roundsError } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('company_id', companyId);

    if (roundsError) {
        console.error('Error fetching rounds:', roundsError);
        return;
    }

    console.log(`Found ${rounds.length} rounds.`);

    // Get Transactions
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .in('round_id', rounds.map(r => r.id));

    if (txError) {
        console.error('Error fetching transactions:', txError);
        return;
    }

    console.log(`Found ${transactions.length} transactions.`);
    transactions.forEach((t, i) => {
        console.log(`\nTransaction ${i + 1}:`);
        console.log(`  ID: ${t.id}`);
        console.log(`  Round ID: ${t.round_id}`);
        console.log(`  Amount: ${t.amount_invested}`);
        console.log(`  Shares: ${t.shares_purchased}`);
        console.log(`  Ownership (%): ${t.ownership_percentage}`);
        console.log(`  Equity Type (col): ${t.equity_type}`);
        console.log(`  Security Type: ${t.security_type}`);
    });
}

// Company ID from User: 4baab0b2-588b-4f8f-adc0-313c11acf553
checkTransactions('4baab0b2-588b-4f8f-adc0-313c11acf553');
