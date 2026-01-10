import { createClient } from '@/lib/supabase/server';
import JSZip from 'jszip';

// Helper to escape CSV fields
function escapeCSV(field: any): string {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// Generic Array to CSV with Dynamic Headers
function toCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    // 1. Collect ALL unique keys from all rows to ensure coverage
    const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));

    // 2. Header Row
    const headerRow = headers.map(h => escapeCSV(h)).join(',');

    // 3. Data Rows
    const rows = data.map(row => {
        return headers.map(header => {
            return escapeCSV(row[header] ?? '');
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
}

/**
 * Maps raw DB rows to a "Pretty" format.
 * CRITICAL: Automatically includes any unmapped fields as "Raw_Field_Name" to ensure
 * data completeness even if the schema changes and we forget to update the map.
 */
function mapDataWithSafetyNet(data: any[], prettyMap: Record<string, string>, relationsToSkip: string[] = []) {
    if (!data) return [];

    return data.map(raw => {
        const result: any = {};
        const mappedRawKeys = new Set<string>();

        // 1. Apply Pretty Mapping
        for (const [dbKey, prettyName] of Object.entries(prettyMap)) {
            result[prettyName] = raw[dbKey];
            mappedRawKeys.add(dbKey);
        }

        // 2. Safety Net: Catch all other scalar fields
        Object.keys(raw).forEach(key => {
            // Skip already mapped keys
            if (mappedRawKeys.has(key)) return;

            // Skip known relations (objects/arrays) that we don't want in the flat list
            // (Unless they are simple JSONB fields we want to keep?)
            // We'll check if it's in the 'relationsToSkip' list OR if it's typically a relation (object/array)
            if (relationsToSkip.includes(key)) return;

            const value = raw[key];
            const isRelation = typeof value === 'object' && value !== null && !Array.isArray(value);
            // Note: Date objects are objects, but we might want them. Supabase returns strings for dates usually.
            // If it's a real relation, usually it's excluded from select('*') unless explicit.
            // But we fetched specific relations.

            // Simple heuristic: If it's not in relationsToSkip, dump it.
            // We prepend "DB_" to indicate it's a raw unmapped field, or just keep the name.
            // Let's keep the name to match user request "extract all info".
            result[key] = value;
        });

        return result;
    });
}

export async function generateBackup() {
    const supabase = await createClient();

    // 1. Fetch All Data with Relations
    const { data: funds } = await supabase.from('funds').select('*').order('name');
    const { data: companies } = await supabase.from('companies').select('*').order('name');

    // Fetch Rounds with Company Name & deep select to get all round fields + relation
    const { data: rounds } = await supabase.from('financing_rounds')
        .select(`*, company:companies(name, sector, status)`)
        .order('close_date', { ascending: false });

    // Fetch Transactions with deep relations
    const { data: transactions } = await supabase.from('transactions')
        .select(`
            *,
            fund:funds(name),
            round:financing_rounds(
                *,
                company:companies(name, sector, status)
            )
        `)
        .order('date');

    // 2. Define Pretty Maps (The "Golden Path")
    // If we rename a DB column, this map might break, but the Safety Net will catch the new name.

    const fundMap = {
        name: 'Name',
        vintage: 'Vintage',
        committed_capital: 'Committed_Capital',
        investable_amount: 'Invested_Amount',
        currency: 'Currency',
        formation_date: 'Formation_Date',
        investment_period_start: 'Investment_Period_Start',
        investment_period_end: 'Investment_Period_End',
        created_at: 'Created_At',
        id: 'System_ID'
    };

    const companyMap = {
        name: 'Name',
        legal_name: 'Legal_Name',
        status: 'Status',
        sector: 'Sector',
        description: 'Description',
        website: 'Website',
        founded_year: 'Founded_Year',
        headquarters: 'Headquarters',
        drive_folder_id: 'Drive_Folder_ID',
        created_at: 'Created_At',
        id: 'System_ID'
    };

    const roundMap = {
        round_label: 'Round_Label',
        close_date: 'Close_Date',
        post_money_valuation: 'Post_Money_Valuation',
        pre_money_valuation: 'Pre_Money_Valuation',
        round_size: 'Round_Size',
        share_price: 'Share_Price',
        shares_issued: 'Shares_Issued',
        valuation_cap: 'Valuation_Cap',
        safe_discount: 'Safe_Discount',
        drive_folder_id: 'Drive_Folder_ID',
        created_at: 'Created_At',
        id: 'System_ID',
        company_id: 'Company_ID_Ref'
    };

    // 3. Generate Individual CSVs using Safety Net
    // We pass 'company' as a relation to skip for rounds, because we manually extract company name below
    // Actually, mapDataWithSafetyNet is generic. Let's pre-process "Company Name" for rounds so it's not "Unknown".

    const fundsCleaned = mapDataWithSafetyNet(funds || [], fundMap);

    const companiesCleaned = mapDataWithSafetyNet(companies || [], companyMap);

    const roundsPreProcessed = rounds?.map(r => ({
        ...r,
        Company: r.company?.name || 'Unknown' // Add computed field
    })) || [];

    // We remove 'company' object from outputs
    const roundsCleaned = mapDataWithSafetyNet(roundsPreProcessed,
        { ...roundMap, Company: 'Company_Name' },
        ['company'] // Skip the nested company object
    );


    // 4. Generate Master Ledger (All Rounds + Transaction Details)
    const masterLedger: any[] = [];
    const txByRound = new Map<string, any[]>();
    transactions?.forEach(tx => {
        if (!tx.round_id) return;
        const current = txByRound.get(tx.round_id) || [];
        current.push(tx);
        txByRound.set(tx.round_id, current);
    });

    rounds?.forEach(round => {
        const roundTransactions = txByRound.get(round.id);
        const companyName = round.company?.name || 'Unknown';
        const sector = round.company?.sector || '';
        const status = round.company?.status || '';

        // Flatten Round Data using the Map to ensure we get all fields + Safety Net
        // We can reuse the logic: map this single round object
        const [flatRound] = mapDataWithSafetyNet([round], roundMap, ['company']);

        // Prefix keys to avoid collision with Transaction keys? 
        // Or just trust the naming. Let's explicitly grab Key Metrics for readability priority
        // then spread the rest.

        const coreContext = {
            Date: round.close_date,
            Company: companyName,
            Round: round.round_label,
            Sector: sector,
            Company_Status: status,
        };

        if (roundTransactions && roundTransactions.length > 0) {
            roundTransactions.forEach(tx => {
                // Map Transaction Fields
                // We define a map for transactions too
                const txMap = {
                    type: 'Transaction_Type',
                    fund_id: 'Fund_ID_Ref', // We'll swap this for name
                    amount_invested: 'Amount_Invested',
                    shares_purchased: 'Shares',
                    ownership_percentage: 'Ownership_Percent',
                    security_type: 'Security_Type',
                    equity_type: 'Equity_Type',
                    warrant_coverage_percentage: 'Warrant_Coverage',
                    warrant_expiration_date: 'Warrant_Expiration',
                    notes: 'Comments',
                    date: 'Transaction_Date'
                };

                // Safety net for transaction fields
                const [flatTx] = mapDataWithSafetyNet([tx], txMap, ['fund', 'round']);

                masterLedger.push({
                    ...coreContext,
                    Participation: 'R-Squared Invested',
                    Fund: tx.fund?.name || 'Unknown',
                    ...flatRound, // Includes all round details (Pre/Post/Cap etc)
                    ...flatTx,    // Includes all transaction details
                    // Overwrite specific collisions if needed, but names seem distinct enough
                });
            });
        } else {
            masterLedger.push({
                ...coreContext,
                Participation: 'Not Invested',
                Transaction_Type: 'Round Logged',
                Fund: '—',
                ...flatRound,
                // Zero out core financial metrics
                Amount_Invested: 0,
                Shares: 0,
                Ownership_Percent: 0,
            });
        }
    });

    const fundsCSV = toCSV(fundsCleaned);
    const companiesCSV = toCSV(companiesCleaned);
    const roundsCSV = toCSV(roundsCleaned);
    const masterCSV = toCSV(masterLedger);

    // 5. Create ZIP
    const zip = new JSZip();
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `vc_portfolio_backup_${dateStr}`;
    const folder = zip.folder(folderName);

    if (folder) {
        folder.file('Funds.csv', fundsCSV);
        folder.file('Companies.csv', companiesCSV);
        folder.file('Rounds.csv', roundsCSV);
        folder.file('MASTER_LEDGER.csv', masterCSV);
        folder.file('README.txt', `Portfolio Export - ${dateStr}\n\nCONTENTS:\n- MASTER_LEDGER.csv: Detailed ledger. Automatically includes all database fields.\n- Rounds.csv: Full round logs.\n- Companies.csv: Company directory.\n- Funds.csv: Fund configurations.`);
    }

    const content = await zip.generateAsync({ type: 'base64' });
    return content;
}
