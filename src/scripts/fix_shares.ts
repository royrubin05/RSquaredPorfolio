
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

async function backfillShares() {
    console.log('Starting Share Count Backfill...');

    // 1. Find transactions with missing shares but with invested amount
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select(`
            id,
            amount_invested,
            shares_purchased,
            equity_type,
            round_id
        `)
        .is('shares_purchased', null)
        .gt('amount_invested', 0);

    if (txError) {
        console.error('Error fetching transactions:', txError);
        return;
    }

    console.log(`Found ${transactions?.length || 0} transactions with missing shares.`);

    if (!transactions || transactions.length === 0) return;

    // 2. Process each
    for (const tx of transactions) {
        // Fetch round PPS
        const { data: round } = await supabase
            .from('financing_rounds')
            .select('price_per_share, round_label')
            .eq('id', tx.round_id)
            .single();

        if (round && round.price_per_share && round.price_per_share > 0) {
            const calculatedShares = Math.floor(tx.amount_invested / round.price_per_share);
            console.log(`Fixing Tx ${tx.id} (${round.round_label}): Invested $${tx.amount_invested} / PPS $${round.price_per_share} = ${calculatedShares} Shares`);

            const { error: updateError } = await supabase
                .from('transactions')
                .update({ shares_purchased: calculatedShares })
                .eq('id', tx.id);

            if (updateError) console.error('Failed to update:', updateError);
        } else {
            console.log(`Skipping Tx ${tx.id}: Round has no valid PPS.`);
        }
    }
}

backfillShares();
