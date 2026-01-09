
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanyRounds() {
    const companyId = 'a69ed292-1900-4d1e-8a80-d141c0b5c305';
    console.log(`Checking rounds for Company: ${companyId}`);

    // 1. Fetch Rounds
    const { data: rounds, error } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('company_id', companyId);

    if (error) {
        console.error('Error fetching rounds:', error);
        return;
    }

    console.log(`Found ${rounds?.length || 0} rounds:`);
    rounds?.forEach(r => {
        console.log(`- ID: ${r.id}`);
        console.log(`  Label: ${r.round_label}`);
        console.log(`  Date: ${r.close_date}`);
        console.log(`  Created At: ${r.created_at}`);
    });

    // 2. Fetch Transactions for this company (via rounds)
    if (rounds && rounds.length > 0) {
        const roundIds = rounds.map(r => r.id);
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .in('round_id', roundIds);

        console.log(`Found ${transactions?.length || 0} transactions:`);
        transactions?.forEach(t => {
            console.log(`- Tx ID: ${t.id}`);
            console.log(`  Round ID: ${t.round_id}`);
            console.log(`  Amount: ${t.amount_invested}`);
            console.log(`  Shares: ${t.shares_purchased}`);
        });
    }
}

checkCompanyRounds();
