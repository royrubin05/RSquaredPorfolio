
import { createClient } from "./supabase/server";

export type PortfolioKPIs = {
    totalAum: number;
    capitalDeployed: number;
    activeCompanies: number;
};

export type DeploymentMetric = {
    name: string;
    deployed: number;
    total: number;
    vintage?: string;
    isSpv?: boolean;
};

export type PortfolioCompany = {
    id: string;
    name: string;
    sector: string;
    stage?: string; // Derived from latest round
    invested: number;
    ownership: number;
    fundNames: string[];
    country?: string;
    status: string;
};

export async function getPortfolioOverview() {
    const supabase = await createClient();

    // 1. KPIs: Total AUM (Committed Capital of all funds)
    const { data: funds } = await supabase.from('funds').select('*');
    const totalAum = funds?.reduce((sum, f) => sum + Number(f.committed_capital), 0) || 0;

    // 2. KPIs: Capital Deployed (Sum of all Investment Transactions)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount_invested, fund_id, funds(name, vintage, committed_capital), round_id, financing_rounds!inner(company_id)');

    const capitalDeployed = transactions?.reduce((sum, t) => sum + Number(t.amount_invested), 0) || 0;

    // Count unique rounds participated in
    const uniqueRounds = new Set(transactions?.map(t => t.round_id));
    const roundsCount = uniqueRounds.size;

    // 3. KPI: Active Companies
    const { count: activeCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

    // 4. Deployment Bars
    // Aggregate transactions by Fund
    const deploymentMap = new Map<string, number>();
    const companyInvestedMap = new Map<string, number>();
    const companyOwnershipMap = new Map<string, number>();

    transactions?.forEach(t => {
        // Deployment Map (Funds)
        // Supabase sometimes returns relations as arrays even for 1:1 if not explicitly typed
        const fund = Array.isArray(t.funds) ? t.funds[0] : t.funds;
        const fundName = fund?.name || 'Unknown';
        const current = deploymentMap.get(fundName) || 0;
        deploymentMap.set(fundName, current + Number(t.amount_invested));

        // Company Map (Invested & Ownership)
        // Extract Company ID from nested relation
        const rounds = Array.isArray(t.financing_rounds) ? t.financing_rounds[0] : t.financing_rounds;
        const companyId = rounds?.company_id;

        if (companyId) {
            const currentInvested = companyInvestedMap.get(companyId) || 0;
            companyInvestedMap.set(companyId, currentInvested + Number(t.amount_invested));

            // Sum ownership? Usually we take MAX ownership from latest round, or SUM if multiple rounds? 
            // Simplified: Sum of all transaction ownerships (assuming they are incremental or different classes)
            // Ideally we'd cap at 100% or be smarter, but for now Sum is standard for "Access"
            const currentOwnership = companyOwnershipMap.get(companyId) || 0;
            // CAST T TO ANY TO AVOID TS ERROR IF PROPERTY MISSING IN INFERRED TYPE
            companyOwnershipMap.set(companyId, currentOwnership + (Number((t as any).ownership_percentage) || 0));
        }
    });

    const deployments: DeploymentMetric[] = funds?.map(f => ({
        name: f.name,
        deployed: deploymentMap.get(f.name) || 0,
        total: Number(f.committed_capital),
        vintage: f.vintage || undefined
    })) || [];

    // 5. Recent/Top Portfolio Companies (Joined Data)
    // We need: Company Name, Sector, Invested Amount, Ownership
    // Logic: Fetch Companies -> Rounds -> Transactions
    const { data: rawCompanies } = await supabase
        .from('companies')
        .select(`
            id, name, sector, status, headquarters,
            financing_rounds (
                round_label,
                transactions (
                    amount_invested,
                    ownership_percentage,
                    funds (name)
                )
            )
        `)
        .order('created_at', { ascending: false });

    const portfolio: PortfolioCompany[] = rawCompanies?.map(c => {
        let totalInvested = 0;
        let totalOwnership = 0;
        const fundsSet = new Set<string>();
        let latestStage = '-';

        c.financing_rounds?.forEach((r: any) => {
            // Pick latest round label as stage (simplified)
            latestStage = r.round_label;

            // Extract fund names for display
            r.transactions?.forEach((t: any) => {
                if (t.funds?.name) fundsSet.add(t.funds.name);
            });
        });

        // Use aggregated values from the flat transaction list (Source of Truth)
        totalInvested = companyInvestedMap.get(c.id) || 0;
        // Optional: Use aggregated ownership or stick to current loop?
        // Let's use aggregated ownership to capture "hidden" transactions too
        // But the deep loop captures fund names... can we keep both?
        // Let's use the Map for numbers, and Loop for Strings (Fund Names)
        totalOwnership = companyOwnershipMap.get(c.id) || 0;

        return {
            id: c.id,
            name: c.name,
            sector: c.sector || 'Uncategorized',
            stage: latestStage,
            invested: totalInvested,
            ownership: totalOwnership,
            country: c.headquarters || '',
            status: c.status,
            fundNames: Array.from(fundsSet)
        };
    }) || [];

    return {
        kpis: {
            totalAum,
            capitalDeployed,

            activeCompanies: activeCompanies || 0,
            roundsCount
        },
        deployments,
        portfolio
    };
}

// ... existing code ...

export async function getCompanyDetails(id: string) {
    try {
        const supabase = await createClient();

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (companyError || !company) {
            console.error('Error fetching company details:', JSON.stringify(companyError, null, 2));
            return null;
        }

        const { data: rounds, error: roundsError } = await supabase
            .from('financing_rounds')
            .select(`
                *,
                round_syndicate (
                    investor:investors(name, type)
                )
            `)
            .eq('company_id', id)
            .order('close_date', { ascending: false });

        if (roundsError) {
            console.error('Error fetching rounds:', roundsError);
        }

        // Fetch transactions for this company's rounds
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select(`
                *,
                funds(id, name)
            `)
            .in('round_id', rounds?.map(r => r.id) || []);

        if (txError) {
            console.error('Error fetching transactions:', txError);
        }

        // Fetch documents
        const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .eq('company_id', id);

        // Map to UI Round shape
        const mappedRounds = rounds?.map(r => {
            const roundTx = transactions?.filter(t => t.round_id === r.id);
            const participated = roundTx && roundTx.length > 0;

            const allocations = roundTx?.map(t => {
                // Normalize 'funds' relation which can be array or object
                const fundRel = Array.isArray(t.funds) ? t.funds[0] : t.funds;

                return {
                    id: t.id,
                    fundId: fundRel?.id || t.fund_id,
                    fundName: fundRel?.name || 'Unknown Fund',
                    amount: t.amount_invested?.toString() || "0",
                    shares: t.shares_purchased?.toString() || "0",
                    ownership: t.ownership_percentage?.toString() || "0",
                    equityType: t.equity_type
                };
            }) || [];

            // Check for Warrants in this round's transactions
            const warrantTx = roundTx?.find(t => t.security_type === 'Warrant');
            const hasWarrants = !!warrantTx;

            // Determine structure based on transactions or existence of SAFE terms
            const isSafe = roundTx?.some(t => t.security_type === 'SAFE') || !!r.valuation_cap || !!r.safe_discount || r.round_label.toUpperCase().includes('SAFE');

            return {
                id: r.id,
                structure: isSafe ? 'SAFE' : 'Equity',
                round: r.round_label,
                date: new Date(r.close_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                rawDate: r.close_date, // Pass YYYY-MM-DD for editing
                valuation: r.post_money_valuation?.toString() || "-",
                companyId: r.company_id, // Ensure we have this for later if needed
                valuationCap: r.valuation_cap?.toString(),
                discount: r.safe_discount?.toString(),
                pps: r.price_per_share?.toString() || "-",
                capitalRaised: r.round_size?.toString() || "-",
                lead: r.round_syndicate?.[0]?.investor?.name || "-",
                participated,
                rSquaredInvestedAmount: roundTx?.reduce((sum, t) => sum + Number(t.amount_invested), 0) || 0,
                allocations,
                originalSafeTerms: r.original_safe_terms,
                hasWarrants,
                warrantTerms: hasWarrants ? {
                    coverage: warrantTx?.warrant_coverage_percentage?.toString() || "0",
                    coverageType: 'percentage',
                    expirationDate: warrantTx?.warrant_expiration_date || ""
                } : undefined,
                documents: [] as { id?: string; name: string; type: string; size: string }[]
            };
        }) || [];

        // Attach documents
        mappedRounds.forEach(r => {
            const roundDocs = documents?.filter(d => d.round_id === r.id) || [];
            r.documents = roundDocs.map(d => ({
                id: d.id,
                name: d.name,
                type: d.file_type || 'DOC',
                size: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(0)} KB` : ' - '
            }));
        });

        return {
            ...company,
            rounds: mappedRounds,
            documents: documents?.map(d => ({
                id: d.id,
                name: d.name,
                type: d.file_type || 'DOC',
                size: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(0)} KB` : ' - ',
                date: new Date(d.created_at).toLocaleDateString()
            })) || []
        };
    } catch (err) {
        console.error('Exception fetching company details:', err);
        return null; // Return null so the page shows Not Found / Empty instead of 500
    }
}

export async function getCompaniesList() {
    try {
        const { portfolio } = await getPortfolioOverview();
        return portfolio;
    } catch (err) {
        console.error('Exception fetching companies list:', err);
        return [];
    }
}

