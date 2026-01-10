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

// Generic Array to CSV
function toCSV<T>(data: T[], headers: (keyof T | string)[]): string {
    if (!data || data.length === 0) return '';

    // Header Row
    const headerRow = headers.map(h => escapeCSV(h)).join(',');

    // Data Rows
    const rows = data.map(row => {
        return headers.map(header => {
            // @ts-ignore
            return escapeCSV(row[header] ?? '');
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
}

export async function generateBackup() {
    const supabase = await createClient();

    // 1. Fetch All Data with Relations for Readable Names
    const { data: funds } = await supabase.from('funds').select('*').order('name');
    const { data: companies } = await supabase.from('companies').select('*').order('name');

    // Fetch Rounds with Company Name
    const { data: rounds } = await supabase.from('financing_rounds')
        .select(`
            *,
            company:companies(name, sector, status)
        `)
        .order('close_date', { ascending: false });

    // Fetch Transactions with deep relations
    const { data: transactions } = await supabase.from('transactions')
        .select(`
            *,
            fund:funds(name),
            round:financing_rounds(
                id,
                round_label,
                close_date,
                company:companies(name, sector, status)
            )
        `)
        .order('date');

    // 2. Generate Individual CSVs (Cleaned - No IDs)
    const fundsCleaned = funds?.map(f => ({
        Name: f.name,
        Vintage: f.vintage,
        Committed_Capital: f.committed_capital,
        Invested_Amount: f.investable_amount,
        Currency: f.currency
    })) || [];
    const fundsCSV = toCSV(fundsCleaned, ['Name', 'Vintage', 'Committed_Capital', 'Invested_Amount', 'Currency']);

    const companiesCleaned = companies?.map(c => ({
        Name: c.name,
        Sector: c.sector,
        Status: c.status,
        Headquarters: c.headquarters,
        Website: c.website,
        Description: c.description
    })) || [];
    const companiesCSV = toCSV(companiesCleaned, ['Name', 'Sector', 'Status', 'Headquarters', 'Website', 'Description']);

    const roundsCleaned = rounds?.map(r => ({
        Company: r.company?.name || 'Unknown',
        Round_Label: r.round_label,
        Date: r.close_date,
        Post_Money_Valuation: r.post_money_valuation,
        Round_Size: r.round_size,
        Share_Price: r.share_price
    })) || [];
    const roundsCSV = toCSV(roundsCleaned, ['Company', 'Round_Label', 'Date', 'Post_Money_Valuation', 'Round_Size', 'Share_Price']);

    // 3. Generate Master Ledger (All Rounds + Transaction Details)
    // Goal: List every round. If we invested, show the investment details. If not, show "Not Invested".

    const masterLedger: any[] = [];

    // Group transactions by Round ID for easy lookup
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

        if (roundTransactions && roundTransactions.length > 0) {
            // We have activity in this round (Investment or Exit)
            roundTransactions.forEach(tx => {
                masterLedger.push({
                    Date: tx.date || round.close_date,
                    Company: companyName,
                    Round: round.round_label,
                    Participation: 'R-Squared Invested', // Explicit Status
                    Transaction_Type: tx.type, // Investment, Exit, Convert, etc.
                    Fund: tx.fund?.name || 'Unknown',
                    Amount_Invested: tx.amount_invested || 0,
                    Shares: tx.shares_purchased || 0,
                    Ownership_Percent: tx.ownership_percentage || 0,
                    Implied_Valuation: round.post_money_valuation,
                    Sector: sector,
                    Company_Status: status,
                    Security_Type: tx.security_type,
                    Comments: tx.notes || ''
                });
            });
        } else {
            // No transactions - This is a "Tracked" or "Passed" round
            masterLedger.push({
                Date: round.close_date,
                Company: companyName,
                Round: round.round_label,
                Participation: 'Not Invested', // Explicit Status
                Transaction_Type: 'Round Logged',
                Fund: '—',
                Amount_Invested: 0,
                Shares: 0,
                Ownership_Percent: 0,
                Implied_Valuation: round.post_money_valuation,
                Sector: sector,
                Company_Status: status,
                Security_Type: '—',
                Comments: 'Round details recorded but no capital deployed.'
            });
        }
    });

    const masterCSV = toCSV(masterLedger, [
        'Date', 'Company', 'Round', 'Participation', 'Transaction_Type',
        'Fund', 'Amount_Invested', 'Shares', 'Ownership_Percent',
        'Implied_Valuation', 'Sector', 'Company_Status', 'Security_Type', 'Comments'
    ]);

    // 4. Create ZIP
    const zip = new JSZip();
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `vc_portfolio_backup_${dateStr}`;
    const folder = zip.folder(folderName);

    if (folder) {
        folder.file('Funds.csv', fundsCSV);
        folder.file('Companies.csv', companiesCSV);
        folder.file('Rounds.csv', roundsCSV); // Now with Company Names, not IDs
        folder.file('MASTER_LEDGER.csv', masterCSV);
        folder.file('README.txt', `Portfolio Export - ${dateStr}\n\nCONTENTS:\n- MASTER_LEDGER.csv: Comprehensive view of all rounds, including those without investment.\n- Rounds.csv: Log of all financing rounds.\n- Companies.csv: Directory of portfolio companies.\n- Funds.csv: Overview of investment vehicles.`);
    }

    // Generate Base64
    const content = await zip.generateAsync({ type: 'base64' });
    return content;
}
