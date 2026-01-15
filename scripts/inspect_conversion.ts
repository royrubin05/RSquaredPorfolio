import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect(companyId: string) {
    console.log(`Inspecting Company: ${companyId}`);

    // 1. Get Rounds
    const { data: rounds, error: rErr } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('company_id', companyId)
        .order('close_date');

    if (rErr) console.error(rErr);
    console.log("Rounds:", JSON.stringify(rounds, null, 2));

    // 2. Get Transactions
    const { data: txs, error: tErr } = await supabase
        .from('transactions')
        .select('*')
        .in('round_id', rounds?.map(r => r.id) || []);

    if (tErr) console.error(tErr);
    console.log("Transactions:", JSON.stringify(txs, null, 2));
}

inspect('d92908f6-69bb-481c-adb9-bca0d71d7c3d');
