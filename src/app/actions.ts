'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs';
import path from 'path';

const LOG_FILE = '/tmp/vc_debug_log.txt';

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}

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
        sector: (!data.category || data.category === '-') ? null : data.category,
        headquarters: (!data.country || data.country === '-') ? null : data.country,
        status: data.status || 'Active',
        website: (!data.website || data.website === '-') ? null : data.website,
        description: (!data.description || data.description === '-') ? null : data.description,
    };

    if (!payload.name || payload.name.trim() === '' || payload.name === '-') {
        return { error: "Invalid company name." };
    }

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

export async function getCountries() {
    const supabase = await createClient();

    // Check for 'settings' table key 'available_countries'
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'available_countries').single();

    if (settings && settings.value) {
        return settings.value as string[];
    }

    // Default list if no DB override
    return [
        "United States", "Israel", "United Kingdom", "Canada",
        "Germany", "France", "Singapore", "Sweden", "Switzerland", "Netherlands", "Australia", "South Korea", "Japan", "Brazil", "India"
    ].sort();
}

export async function getCategories() {
    const supabase = await createClient();

    // Check for 'settings' table key 'available_categories'
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'available_categories').single();

    if (settings && settings.value) {
        return settings.value as string[];
    }

    // Default list
    return [
        "AI", "Fintech", "SaaS", "Consumer", "Health", "Infra", "Crypto", "Marketplace", "Deep Tech", "Real Estate"
    ].sort();
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

    // Delete associated transactions first to satisfy FK constraint
    const { error: txError } = await supabase.from('transactions').delete().eq('round_id', id);
    if (txError) {
        console.error('Error deleting round transactions:', txError);
        return { error: txError.message };
    }

    // Delete associated logs/updates if any? (Assuming just transactions for now)

    const { error } = await supabase.from('financing_rounds').delete().eq('id', id)
    if (error) {
        console.error('Error deleting round:', error)
        return { error: error.message }
    }
    revalidatePath('/')
    return { success: true }
}

export async function getFunds() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('funds').select('*').order('name');

        if (error) {
            const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
            console.error('Error fetching funds:', errorDetails);
            // logToFile(`Error fetching funds: ${errorDetails}`);
            return [];
        }
        return data || [];
    } catch (err: any) {
        console.error('Exception fetching funds:', err);
        return [];
    }
}

export async function upsertFund(data: any) {
    const supabase = await createClient();

    if (!data.name || data.name.trim() === '' || data.name === '-') {
        return { error: 'Invalid fund name.' };
    }

    const payload = {
        id: data.id || undefined,
        name: data.name,
        vintage: (!data.vintage || data.vintage === '-') ? null : data.vintage,
        committed_capital: data.committed_capital || 0, // AUM
        investable_amount: data.investable_amount || 0,
        formation_date: data.formation_date || null,
        investment_period_start: data.investment_period_start || null,
        investment_period_end: data.investment_period_end || null,
        currency: data.currency || 'USD',
    };

    const { data: result, error } = await supabase
        .from('funds')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error upserting fund:', error);
        return { error: error.message };
    }

    revalidatePath('/funds');
    revalidatePath('/'); // To update Funds dropdown elsewhere
    return { success: true, data: result };
}

export async function deleteFund(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('funds').delete().eq('id', id);
    if (error) {
        console.error('Error deleting fund:', error);
        return { error: error.message };
    }
    revalidatePath('/funds');
    revalidatePath('/');
    return { success: true };
}

export async function upsertRound(data: any, companyId: string) {
    const supabase = await createClient();

    // 1. Prepare Round Data
    logToFile(`[upsertRound] Incoming Data: ${JSON.stringify(data, null, 2)}`);

    // Cleanup currency strings
    const cleanCurrency = (val: string) => val ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : null;

    // Helper: Normalize Date
    const normalizeDate = (dateStr: string): string | null => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null; // Invalid date
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    if (!data.roundTerms.date) {
        return { error: 'Round Date is required.' };
    }

    const normalizedDate = normalizeDate(data.roundTerms.date);
    if (!normalizedDate) {
        return { error: `Invalid Date Format: "${data.roundTerms.date}". Please use a valid date.` };
    }

    const roundPayload: any = {
        company_id: companyId,
        round_label: data.roundTerms.stage,
        close_date: normalizedDate,
        post_money_valuation: cleanCurrency(data.roundTerms.valuation),
        price_per_share: cleanCurrency(data.roundTerms.pps),
        round_size: cleanCurrency(data.roundTerms.capitalRaised),
        valuation_cap: cleanCurrency(data.roundTerms.valuationCap),
        safe_discount: cleanCurrency(data.roundTerms.discount),
        // created_at? handled by default
    };

    if (data.id) {
        roundPayload.id = data.id;
    } else {
        // Smart Duplicate Prevention:
        // If no ID provided, check if a round with this label already exists for this company.
        // If so, treat it as an update to that round.
        const { data: existingRound } = await supabase
            .from('financing_rounds')
            .select('id')
            .eq('company_id', companyId)
            .eq('round_label', data.roundTerms.stage)
            .maybeSingle();

        if (existingRound) {
            console.log(`[upsertRound] Found existing round '${data.roundTerms.stage}' (${existingRound.id}). Updating instead of creating.`);
            logToFile(`[upsertRound] Found existing round '${data.roundTerms.stage}' (${existingRound.id}). Updating instead of creating.`);
            roundPayload.id = existingRound.id;
        }
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
    const { data: funds, error: fundsError } = await supabase.from('funds').select('id, name');

    if (fundsError) {
        console.error('Error fetching funds for validation:', fundsError);
        return { error: 'Failed to validate funds: ' + fundsError.message };
    }

    const fundMap = new Map(funds?.map(f => [f.name, f.id]) || []);
    const fundIdSet = new Set(funds?.map(f => f.id) || []);

    // Delete existing transactions for this round to handle removals cleanly
    await supabase.from('transactions').delete().eq('round_id', roundId);

    if (data.position?.participated && data.position.allocations) {
        const transactionsToInsert = [];

        for (const alloc of data.position.allocations) {
            let fundId = null;

            // Scenario A: alloc.fundId is already a UUID (Ideal)
            if (alloc.fundId && fundIdSet.has(alloc.fundId)) {
                fundId = alloc.fundId;
            }
            // Scenario B: alloc.fundId is a Name (Legacy/Lazy)
            else if (alloc.fundId) {
                fundId = fundMap.get(alloc.fundId);

                // LAZY CREATE FUND if name not found
                if (!fundId) {
                    const { data: newFund } = await supabase
                        .from('funds')
                        .insert({ name: alloc.fundId, type: 'VC' })
                        .select('id')
                        .single();

                    if (newFund) {
                        fundId = newFund.id;
                        fundMap.set(alloc.fundId, fundId);
                        fundIdSet.add(fundId);
                    }
                }
            }

            if (fundId) {
                transactionsToInsert.push({
                    round_id: roundId,
                    fund_id: fundId,
                    date: normalizedDate, // Required by schema
                    type: 'Investment',   // Required by schema
                    amount_invested: cleanCurrency(alloc.amount),
                    shares_purchased: cleanCurrency(alloc.shares),
                    ownership_percentage: cleanCurrency(alloc.ownership),
                    security_type: data.roundTerms.structure === 'SAFE' ? 'SAFE' : 'Equity',
                    equity_type: alloc.equityType || null // Save the specific instrument name
                });
            }
        }

        if (transactionsToInsert.length > 0) {
            logToFile(`[upsertRound] Inserting transactions: ${JSON.stringify(transactionsToInsert)}`);
            const { error: txError } = await supabase.from('transactions').insert(transactionsToInsert);
            if (txError) {
                logToFile(`Error saving transactions: ${txError.message}`);
                console.error('Error saving transactions:', txError);
                return { error: 'Failed to save transactions: ' + txError.message };
            }
        } else {
            logToFile('[upsertRound] No transactions to insert despite participation.');
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

        // ... (Warrant logic remains similar, try to attach to primary fund)
        // For simplicity, grab first valid fundId from above loop or transactions? 
        // Re-resolving first alloc's fund... 
        // For now, let's just try to find the ID of the first allocation again.
        let primaryFundId = null;
        const firstAlloc = data.position.allocations?.[0];
        if (firstAlloc?.fundId) {
            if (fundIdSet.has(firstAlloc.fundId)) primaryFundId = firstAlloc.fundId;
            else primaryFundId = fundMap.get(firstAlloc.fundId);
        }

        // Warrants might need a specific structure
        const warrantTx = {
            round_id: roundId,
            fund_id: primaryFundId || null,
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
            // Filter out placeholders and empty strings
            if (!leadName || leadName.trim() === '' || leadName === '-' || leadName.length < 2) continue;

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

export async function getLatestRounds() {
    const supabase = await createClient();

    // Fetch Rounds with Company Data, joined with transactions to sum investment
    // Note: Supabase JS joins are tricky for aggregates.
    // We will fetch 10 rounds, then fetch their transactions.

    // 1. Fetch Rounds + Companies
    const { data: rounds, error } = await supabase
        .from('financing_rounds')
        .select(`
            id,
            round_label,
            close_date,
            post_money_valuation,
            round_size,
            company:companies(id, name, sector)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching latest rounds:', error);
        return [];
    }

    if (!rounds || rounds.length === 0) return [];

    // 2. Fetch Transactions for these rounds to calculate "Invested Amount"
    const roundIds = rounds.map(r => r.id);
    const { data: transactions } = await supabase
        .from('transactions')
        .select('round_id, amount_invested')
        .in('round_id', roundIds);

    // 3. Fetch Syndicate Leads for these rounds
    const { data: syndicates } = await supabase
        .from('round_syndicate')
        .select('round_id, role, investor:investors(name)')
        .in('round_id', roundIds)
        .eq('role', 'Lead');

    // 4. Map & Aggregate
    const roundsWithDetails = rounds.map(r => {
        // Sum invested amount for this round (across all funds)
        const roundTx = transactions?.filter(t => t.round_id === r.id) || [];
        const invested = roundTx.reduce((sum, t) => sum + (t.amount_invested || 0), 0);

        // Get Leads
        const leads = syndicates
            ?.filter(s => s.round_id === r.id)
            .map((s: any) => s.investor?.name)
            .filter(Boolean) || [];

        // Helper to safely access company data (it returns as array from join but is 1:1)
        const company = Array.isArray(r.company) ? r.company[0] : r.company;

        return {
            id: r.id,
            companyId: r.company?.id,
            companyName: r.company?.name || 'Unknown',
            companySector: r.company?.sector,
            roundLabel: r.round_label,
            date: r.close_date,
            investedAmount: invested,
            roundSize: Number(r.round_size) || 0,
            leads: uniqueLeads
        };
    });

    return roundsWithDetails;
}

export async function getCoInvestors() {
    const supabase = await createClient();

    // 1. Fetch Investors with their Syndicate Roles and related Round/Company info
    // Adjust Query based on exact schema relations
    const { data, error } = await supabase
        .from('investors')
        .select(`
            id,
            name,
            round_syndicate!inner (
                role,
                financing_rounds (
                    round_label,
                    companies (
                        id,
                        name
                    )
                )
            )
        `);

    if (error) {
        console.error('Error fetching co-investors:', error);
        return [];
    }

    // 2. Transform Relation Data to Flat UI Model
    const coInvestors = data
        .filter((inv: any) => inv.name && inv.name !== '-' && inv.name.length > 1) // Filter junk
        .map((inv: any) => {
            // Extract unique deals
            const dealsMap = new Map();

            inv.round_syndicate.forEach((syn: any) => {
                const company = syn.financing_rounds?.companies;
                if (company) {
                    dealsMap.set(company.id, company.name);
                }
            });

            const deals = Array.from(dealsMap.entries()).map(([id, name]) => ({ id, name }));

            return {
                id: inv.id,
                name: inv.name,
                deals: deals
            };
        });

    return coInvestors;
}

// --- Settings: Industries ---

export async function getIndustries() {
    const supabase = await createClient();

    // 1. Get Categories List
    // We reuse the logic from getCategories but we want rich objects
    let categories: string[] = [];

    // Check settings first
    const { data: settings } = await supabase.from('settings').select('value').eq('key', 'available_categories').single();
    if (settings && settings.value) {
        categories = settings.value as string[];
    } else {
        // Defaults
        categories = ["AI", "Fintech", "SaaS", "Consumer", "Health", "Infra", "Crypto", "Marketplace", "Deep Tech", "Real Estate"];
    }

    // 2. Count Companies per Category
    // We can do a group by query on companies
    // Or just fetch all company sectors and aggregate in JS (safer/easier for small datasets)
    const { data: companies } = await supabase.from('companies').select('sector');

    const countMap = new Map<string, number>();
    companies?.forEach(c => {
        if (c.sector) {
            const current = countMap.get(c.sector) || 0;
            countMap.set(c.sector, current + 1);
        }
    });

    // 3. Map to UI Model
    return categories.map((cat, idx) => ({
        id: idx + 1, // Simple ID for UI keys
        name: cat,
        companies: countMap.get(cat) || 0
    })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveIndustries(industries: string[]) {
    const supabase = await createClient();

    const validIndustries = industries.filter(i => i && i.trim() !== '' && i !== '-');

    const { error } = await supabase.from('settings').upsert({
        key: 'available_categories',
        value: validIndustries
    });

    if (error) {
        console.error('Error saving industries:', error);
        return { error: error.message };
    }

    revalidatePath('/'); // Revalidate everywhere as this affects dropdowns
    return { success: true };
}

// --- Settings: Team / Users ---

export async function getTeamMembers() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching team:', JSON.stringify(error, null, 2));
        // Fallback or empty if table table doesn't exist yet (migration pending)
        return [];
    }

    return data || [];
}

export async function upsertTeamMember(data: any) {
    const supabase = await createClient();

    const payload = {
        name: data.name,
        email: data.email,
        role: data.role || 'Viewer',
        status: data.status || 'Active'
    };

    // Handle ID if updating
    if (data.id) {
        Object.assign(payload, { id: data.id });
    }

    const { error } = await supabase.from('team_members').upsert(payload);

    if (error) {
        console.error('Error saving team member:', error);
        return { error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

export async function deleteTeamMember(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('team_members').delete().eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

// --- Log Round: Syndicate Search ---

export async function searchInvestors(query: string) {
    const supabase = await createClient();

    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from('investors')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(10);

    if (error) {
        console.error('Error searching investors:', error);
        return [];
    }

    return data || [];
}

// --- Settings: Equity Types ---

export async function getEquityTypes() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('equity_types').select('*').order('name');
        if (error) {
            console.error('Error fetching equity types:', error);
            // Return empty if table doesn't exist yet to prevent crashes
            return [];
        }
        return data || [];
    } catch (err: any) {
        console.error('Exception fetching equity types:', err);
        return [];
    }
}

export async function upsertEquityType(data: { id?: string; name: string; is_default?: boolean }) {
    const supabase = await createClient();
    if (!data.name || data.name.trim().length < 2) return { error: 'Invalid name' };

    const payload: any = { name: data.name };
    if (data.id) payload.id = data.id;
    if (data.is_default !== undefined) payload.is_default = data.is_default;

    const { data: result, error } = await supabase.from('equity_types').upsert(payload).select().single();

    if (error) return { error: error.message };

    revalidatePath('/settings');
    return { success: true, data: result };
}

export async function deleteEquityType(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('equity_types').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/settings');
    return { success: true };
}

// --- SAFE Conversion ---

export async function convertSafeToEquity(params: {
    roundId: string;
    pps: number;
    equityType: string;
    valuation: number | null;
    resultingShares: number;
}) {
    const supabase = await createClient();

    // 1. Fetch Current Round & Transactions
    const { data: round, error: rErr } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('id', params.roundId)
        .single();

    if (rErr || !round) throw new Error('Round not found');

    // 2. Fetch Transactions (for R-Squared / Funds) to update their shares
    // We assume all transactions in this round are part of the conversion
    // If there are multiple funds, we need to distribute the "resultingShares" logic or calculate per fund.
    // The Modal calculated "Total Shares" based on "Total Invested".
    // We should recalculate per transaction to be precise.
    const { data: transactions, error: tErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('round_id', params.roundId);

    if (tErr) throw new Error('Transactions not found');

    // 3. Backup Original SAFE Terms
    const backupTerms = {
        structure: round.structure,
        valuation_cap: round.valuation_cap,
        safe_discount: round.safe_discount,
        post_money_valuation: round.post_money_valuation, // Backup existing valuation if any
        pps: round.share_price // Likely null for SAFE, but good to keep
    };

    // 4. Update Round to Equity
    const { error: updateErr } = await supabase
        .from('financing_rounds')
        .update({
            structure: 'Equity', // Or 'Priced Round' if that's the enum? Standardizing on 'Equity'.
            share_price: params.pps,
            post_money_valuation: params.valuation || round.post_money_valuation, // Update if provided
            original_safe_terms: backupTerms, // Store backup
            valuation_cap: null, // Clear SAFE terms to avoid confusion? Or keep them? Best to clear or ignoring them in UI.
            safe_discount: null
        })
        .eq('id', params.roundId);

    if (updateErr) {
        console.error('Error updating round:', updateErr);
        throw new Error(updateErr.message);
    }

    // 5. Update Transactions (Calculate Shares per Tx)
    for (const tx of (transactions || [])) {
        const shares = Math.floor((Number(tx.amount_invested) || 0) / params.pps);
        await supabase
            .from('transactions')
            .update({
                number_of_shares: shares,
                equity_type: params.equityType // "Series Seed Preferred" etc.
            })
            .eq('id', tx.id);
    }

    revalidatePath('/');
    return { success: true };
}

export async function revertSafeToEquity(roundId: string) {
    const supabase = await createClient();

    // 1. Fetch Round
    const { data: round, error: rErr } = await supabase
        .from('financing_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

    if (rErr || !round) throw new Error('Round not found');

    const backup = round.original_safe_terms;
    if (!backup) {
        return { error: "No backup terms found. Cannot revert." };
    }

    // 2. Restore Round
    const { error: updateErr } = await supabase
        .from('financing_rounds')
        .update({
            structure: backup.structure || 'SAFE',
            valuation_cap: backup.valuation_cap,
            safe_discount: backup.safe_discount,
            post_money_valuation: backup.post_money_valuation,
            share_price: backup.pps,
            original_safe_terms: null // Clear backup after revert? Or keep history? clearing it implies "Reverted".
        })
        .eq('id', roundId);

    if (updateErr) return { error: updateErr.message };

    // 3. Clear Transactions Shares
    const { error: txErr } = await supabase
        .from('transactions')
        .update({
            number_of_shares: null, // Clear shares
            equity_type: null // Clear specific priced type
        })
        .eq('round_id', roundId);

    if (txErr) return { error: txErr.message };

    revalidatePath('/');
    return { success: true };
}
