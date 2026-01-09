
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Checking for Duplicate TRANSACTIONS (Logic v3) ---');

    // 1. Find Round
    const { data: allRoundsGlobal, error: roundError } = await supabase
        .from('financing_rounds')
        .select('id, round_label');

    if (roundError) return console.error(roundError);

    const targetRound = allRoundsGlobal.find(r => r.id.startsWith('3c57'));

    if (!targetRound) {
        console.error("Could not find round starting with 3c57");
        return;
    }

    console.log(`Target Round Found: ${targetRound.id}`);

    // 2. Fetch Transactions for this round
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id, fund_id, amount_invested, created_at')
        .eq('round_id', targetRound.id)
        .order('created_at', { ascending: true }); // Oldest first

    if (!transactions || transactions.length === 0) {
        console.log("No transactions found for this round.");
        return;
    }

    console.log(`Found ${transactions.length} transactions for round ${targetRound.id}:`);
    transactions.forEach(t => console.log(` - TxID: ${t.id}, Fund: ${t.fund_id}, Amount: ${t.amount_invested}, Created: ${t.created_at}`));

    // 3. Detect Duplicates (Same Fund, Same Amount)
    const seen = new Set<string>();
    const duplicates = [];

    for (const t of transactions) {
        const key = `${t.fund_id}-${t.amount_invested}`;
        if (seen.has(key)) {
            duplicates.push(t);
        } else {
            seen.add(key);
        }
    }

    if (duplicates.length === 0) {
        console.log("No exact duplicates found.");
    } else {
        console.log(`Found ${duplicates.length} duplicate transactions to delete.`);
        for (const t of duplicates) {
            console.log(`Deleting Tx ${t.id} (${t.created_at})...`);
            const { error } = await supabase.from('transactions').delete().eq('id', t.id);
            if (error) console.error("Error deleting:", error);
            else console.log("Deleted.");
        }
    }
}

main().catch(console.error);
