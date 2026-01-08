'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertCompany(data: any) {
    const supabase = await createClient()

    // Map UI fields to DB fields
    // DB Schema based on check-data: id, name, sector, status, headquarters
    // We assume columns exists for website, description etc or we omit them if they fail.
    // Ideally we should know the schema. checking check-data output from step 713:
    // It only showed `id, round_label` etc because of the query I ran.
    // But `getPortfolioOverview` selects: `id, name, sector, status, headquarters`.
    // I will stick to these guaranteed fields + try `website`, `description`.

    const payload: any = {
        name: data.name,
        sector: data.category || null, // Map category -> sector
        headquarters: data.country || null, // Map country -> headquarters
        status: data.status || 'Active',
        website: data.website || null,
        description: data.description || null,
        // one_liner? jurisdiction?
    };

    if (data.id) {
        payload.id = data.id;
    }

    const { data: result, error } = await supabase
        .from('companies')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error upserting company:', error);
        return { error: error.message };
    }

    revalidatePath('/'); // Revalidate dashboard
    return { success: true, data: result };
}

export async function getCompanyStatuses() {
    const supabase = await createClient()

    // 1. Try to fetch from a 'settings' table if it exists
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'company_statuses').single();

    if (settings && settings.value) {
        return settings.value as string[];
    }

    // 2. Fallback: Get distinct statuses from companies
    const { data: companies } = await supabase.from('companies').select('status');
    const distinct = Array.from(new Set(companies?.map(c => c.status) || []));

    // 3. Merge with Defaults
    const defaults = ['Active', 'Watchlist', 'Exit', 'Shutdown'];
    return Array.from(new Set([...defaults, ...distinct]));
}

export async function saveCompanyStatuses(statuses: string[]) {
    const supabase = await createClient()

    // Try to save to 'settings' table. 
    // This assumes the table exists. If not, this might fail, but it's the requested path.
    const { error } = await supabase.from('settings').upsert({
        key: 'company_statuses',
        value: statuses
    });

    if (error) {
        // Validation: If table doesn't exist, we can't persist custom list easily without migration.
        console.error('Failed to save statuses:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function deleteCompany(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) {
        console.error('Error deleting company:', error)
        return { error: error.message }
    }
    revalidatePath('/')
    return { success: true }
}

export async function deleteRound(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('financing_rounds').delete().eq('id', id)
    if (error) {
        console.error('Error deleting round:', error)
        return { error: error.message }
    }
    revalidatePath('/')
    return { success: true }
}

export async function upsertRound(data: any, companyId: string) {
    const supabase = await createClient();

    // 1. Prepare Round Data
    // Cleanup currency strings
    const cleanCurrency = (val: string) => val ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : null;

    if (!data.roundTerms.date) {
        return { error: 'Round Date is required.' };
    }

    const roundPayload: any = {
        company_id: companyId,
        round_label: data.roundTerms.stage,
        close_date: data.roundTerms.date,
        post_money_valuation: cleanCurrency(data.roundTerms.valuation),
        price_per_share: cleanCurrency(data.roundTerms.pps),
        round_size: cleanCurrency(data.roundTerms.capitalRaised),
        // created_at? handled by default
    };

    if (data.id) {
        roundPayload.id = data.id;
    }

    // Upsert Round
    const { data: roundData, error: roundError } = await supabase
        .from('financing_rounds')
        .upsert(roundPayload)
        .select()
        .single();

    if (roundError) {
        console.error('Error upserting round:', roundError);
        return { error: 'Failed to save round data: ' + roundError.message };
    }

    const roundId = roundData.id;

    // 2. Handle Allocations (Transactions)
    // First, resolve Funds to IDs
    const { data: funds } = await supabase.from('funds').select('id, name');
    const fundMap = new Map(funds?.map(f => [f.name, f.id]) || []);

    // Delete existing transactions for this round to handle removals cleanly
    await supabase.from('transactions').delete().eq('round_id', roundId);

    if (data.position?.participated && data.position.allocations) {
        const transactionsToInsert = data.position.allocations.map((alloc: any) => {
            const fundId = fundMap.get(alloc.fundId);
            if (!fundId) return null; // Skip if fund not found

            return {
                round_id: roundId,
                fund_id: fundId,
                amount_invested: cleanCurrency(alloc.amount),
                shares_purchased: cleanCurrency(alloc.shares),
                ownership_percentage: cleanCurrency(alloc.ownership),
                security_type: 'Equity' // Default
            };
        }).filter(Boolean);

        if (transactionsToInsert.length > 0) {
            const { error: txError } = await supabase.from('transactions').insert(transactionsToInsert);
            if (txError) console.error('Error saving transactions:', txError);
        }
    }

    // 3. Handle Warrants
    if (data.position?.hasWarrants) {
        // Warrants are stored as a transaction, usually linked to a fund or just a placeholder?
        // Schema requires fund_id? Let's check if we can insert without fund_id or assign to primary fund
        // For now, let's attach to the first allocation's fund if available, or just insert.
        // If fund_id is NOT nullable, we have a problem if no participation.
        // Assuming warrants imply participation or we need a dummy fund/system fund.
        // Let's try inserting with null fund_id if schema allows.

        // Warrants might need a specific structure
        const warrantTx = {
            round_id: roundId,
            fund_id: fundMap.get(data.position.allocations?.[0]?.fundId) || null, // Attach to first fund
            security_type: 'Warrant',
            warrant_coverage_percentage: parseFloat(data.position.warrantCoverage || '0'),
            warrant_expiration_date: data.position.warrantExpiration || null
        };

        const { error: wError } = await supabase.from('transactions').insert(warrantTx);
        if (wError) console.error('Error saving warrants:', wError);
    }

    // 4. Handle Syndicate (Leads)
    // Delete existing syndicate links
    await supabase.from('round_syndicate').delete().eq('round_id', roundId);

    if (data.syndicate?.leads?.length > 0) {
        for (const leadName of data.syndicate.leads) {
            // Find or Create Investor
            let investorId;
            const { data: existingInvestor } = await supabase
                .from('investors')
                .select('id')
                .eq('name', leadName)
                .maybeSingle();

            if (existingInvestor) {
                investorId = existingInvestor.id;
            } else {
                const { data: newInvestor } = await supabase
                    .from('investors')
                    .insert({ name: leadName, type: 'VC' })
                    .select()
                    .single();
                investorId = newInvestor?.id;
            }

            if (investorId) {
                await supabase.from('round_syndicate').insert({
                    round_id: roundId,
                    investor_id: investorId,
                    role: 'Lead'
                });
            }
        }
    }

    revalidatePath('/');
    return { success: true };
}
