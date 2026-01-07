

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
    try {
        const companyId = "53314297-e6cc-4433-81ba-0076fc70428f"; // Acme Corp
        console.log(`Checking details for Acme Corp (${companyId})...`);

        // 1. Get Rounds
        const { data: rounds, error: rError } = await supabase
            .from('financing_rounds')
            .select('id, round_label, close_date')
            .eq('company_id', companyId);

        if (rError) throw rError;
        console.log('Rounds:', JSON.stringify(rounds, null, 2));

        if (!rounds || rounds.length === 0) {
            console.log('No rounds found.');
            return;
        }

        // 2. Get Transactions
        const { data: txs, error: tError } = await supabase
            .from('transactions')
            .select('id, amount_invested, fund_id, round_id, funds(name)')
            .in('round_id', rounds.map(r => r.id));

        if (tError) throw tError;
        console.log('Transactions:', JSON.stringify(txs, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
