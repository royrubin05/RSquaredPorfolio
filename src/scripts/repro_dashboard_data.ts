
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDashboardLogic() {
    console.log('Checking Dashboard Logic consistency...');

    // 1. Fetch Funds
    const { data: funds, error: fundsError } = await supabase.from('funds').select('*');
    if (fundsError) console.error(fundsError);
    console.log(`Funds Fetched: ${funds?.length}`);

    // 2. Fetch Transactions (EXACT QUERY FROM data.ts)
    // .select('amount_invested, fund_id, funds(name, vintage, committed_capital), round_id, financing_rounds!inner(company_id)');

    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount_invested, fund_id, funds(name, vintage, committed_capital), round_id, financing_rounds!inner(company_id)');

    if (txError) {
        console.error('Error fetching transactions:', txError);
    } else {
        console.log(`Transactions Fetched: ${transactions?.length}`);
    }

    // 3. Replicate Calculation
    const boFund = funds?.find(f => f.name.includes('BookOutdoors'));
    if (!boFund) {
        console.log('BookOutdoors Fund NOT found in funds list');
        return;
    }

    console.log(`Fund: ${boFund.name} (ID: ${boFund.id})`);
    console.log(` Committed: ${boFund.committed_capital}`);

    const fundTransactions = transactions?.filter((t: any) => t.fund_id === boFund.id) || [];
    console.log(` Matched Transactions: ${fundTransactions.length}`);

    const deployed = fundTransactions.reduce((sum: number, t: any) => sum + Number(t.amount_invested), 0);
    console.log(` Calculated Deployed: ${deployed}`);
}

checkDashboardLogic();
