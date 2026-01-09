
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOwnershipData() {
    console.log('Checking Ownership Data...');

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            amount_invested,
            ownership_percentage,
            security_type,
            round_id,
            financing_rounds!inner (
                company_id,
                round_label,
                companies (name)
            )
        `);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const companyOwnershipMap = new Map<string, number>();
    const companyNameMap = new Map<string, string>();

    transactions?.forEach((t: any) => {
        const companyId = t.financing_rounds?.company_id;
        const companyName = t.financing_rounds?.companies?.name;

        if (companyId) {
            companyNameMap.set(companyId, companyName);
            const current = companyOwnershipMap.get(companyId) || 0;
            // Log if we see a non-zero ownership
            if (Number(t.ownership_percentage) > 0) {
                console.log(`Found Equity! ${companyName}: ${t.ownership_percentage}% (Round: ${t.financing_rounds.round_label})`);
            }
            companyOwnershipMap.set(companyId, current + (Number(t.ownership_percentage) || 0));
        }
    });

    console.log('\n--- Aggregated Results ---');
    for (const [id, total] of companyOwnershipMap.entries()) {
        const name = companyNameMap.get(id);
        console.log(`${name}: Total Ownership = ${total}%`);
        if (total === 0) {
            console.log(`  -> WARNING: Shows as SAFE currently.`);
        }
    }
}

checkOwnershipData();
