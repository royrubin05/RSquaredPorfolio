
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Ghost Round Hunter ---');

    // 1. Fetch Key Companies for Context
    const { data: companies } = await supabase.from('companies').select('id, name');
    const compMap = new Map(companies?.map(c => [c.id, c.name]));

    // 2. Fetch All Rounds
    const { data: rounds, error: rErr } = await supabase
        .from('financing_rounds')
        .select('id, company_id, round_label, close_date');

    if (rErr || !rounds) {
        console.error("Error rounds:", rErr);
        return;
    }

    // 3. Fetch All Transactions
    const { data: transactions, error: tErr } = await supabase
        .from('transactions')
        .select('id, round_id, amount_invested, fund_id');

    if (tErr || !transactions) {
        console.error("Error transactions:", tErr);
        return;
    }

    console.log(`Total Rounds: ${rounds.length}`);
    console.log(`Total Transactions: ${transactions.length}`);

    // 4. Analyze
    const roundInvested = new Map<string, number>();
    transactions.forEach(t => {
        const cur = roundInvested.get(t.round_id) || 0;
        roundInvested.set(t.round_id, cur + (t.amount_invested || 0));
    });

    console.log('\n--- Rounds with $0 Investment (Ghost Candidates) ---');
    const ghosts = rounds.filter(r => (roundInvested.get(r.id) || 0) === 0);

    ghosts.forEach(g => {
        const compName = compMap.get(g.company_id) || 'Unknown Company';
        console.log(`[GHOST] ${compName} - ${g.round_label} (${g.close_date}) ID: ${g.id}`);
    });

    if (ghosts.length === 0) console.log("No ghost rounds found.");

    // 5. BookOutdoors Audit
    console.log('\n--- BookOutdoors Audit ---');
    const boId = Array.from(compMap.entries()).find(([id, name]) => name.toLowerCase().includes('book'))?.[0];

    if (!boId) {
        console.log("BookOutdoors company not found.");
    } else {
        const boRounds = rounds.filter(r => r.company_id === boId);
        let totalInv = 0;
        boRounds.forEach(r => {
            const inv = roundInvested.get(r.id) || 0;
            totalInv += inv;
            console.log(` > Round: ${r.round_label} (${r.close_date}) - Invested: $${inv.toLocaleString()}`);
            // List txs
            const rTxs = transactions.filter(t => t.round_id === r.id);
            rTxs.forEach(t => console.log(`   - Tx: $${t.amount_invested?.toLocaleString()} (Fund: ${t.fund_id})`));
        });
        console.log(` = TOTAL BookOutdoors Investment: $${totalInv.toLocaleString()}`);
    }
}

main().catch(console.error);
