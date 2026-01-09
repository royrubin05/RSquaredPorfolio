
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Cleaning Up & Inspecting ---');

    // 1. Delete Ghost Round
    const ghostId = '79087121-27d0-4f86-aa4c-7fc795244da9';
    console.log(`Deleting Ghost Round: ${ghostId}`);
    const { error: delErr } = await supabase.from('financing_rounds').delete().eq('id', ghostId);
    if (delErr) console.error("Error deleting round:", delErr);
    else console.log("Ghost Round Deleted.");

    // 2. Inspect Fund '0756e6cb-3fa2-409d-9f2c-0419755141fa'
    const fundId = '0756e6cb-3fa2-409d-9f2c-0419755141fa'; // From previous script output
    const { data: fund, error: fErr } = await supabase
        .from('funds')
        .select('*')
        .eq('id', fundId)
        .single();

    if (fErr) {
        console.error("Error fetching fund:", fErr);
    } else if (fund) {
        console.log(`\nFund Details:`);
        console.log(` - Name: ${fund.name}`);
        console.log(` - Committed Capital: ${fund.committed_capital}`);
        console.log(` - ID: ${fund.id}`);
    }

    // 3. Verify Deployed for this Fund
    const { data: txs } = await supabase.from('transactions').select('amount_invested').eq('fund_id', fundId);
    const totalDeployed = txs?.reduce((sum, t) => sum + Number(t.amount_invested), 0) || 0;
    console.log(` - Total Deployed (Calculated): $${totalDeployed.toLocaleString()}`);

}

main().catch(console.error);
