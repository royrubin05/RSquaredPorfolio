
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactionStructure() {
    console.log('Checking Transaction -> Company Link...');

    // Fetch a few transactions and see if company_id is populated
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id, amount_invested, company_id, round_id')
        .limit(5);

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log('Sample Transactions:');
    transactions?.forEach(t => {
        console.log(`ID: ${t.id}, Amount: ${t.amount_invested}, CompanyID: ${t.company_id}, RoundID: ${t.round_id}`);
    });

    // Check specifically for BookOutdoors SPV transactions
    const { data: fundTx } = await supabase
        .from('transactions')
        .select('id, amount_invested, company_id, round_id, funds!inner(name)')
        .ilike('funds.name', '%BookOutdoors%');

    console.log('\nBookOutdoors Transactions:');
    fundTx?.forEach(t => {
        console.log(`ID: ${t.id}, CompanyID: ${t.company_id} (Should not be null if logic relies on it)`);
    });
}

checkTransactionStructure();
