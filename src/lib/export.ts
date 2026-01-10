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

    // 2. Generate Individual CSVs (Comprehensive - All Schema Fields)
    // Funds: id, name, vintage, committed_capital, investable_amount, currency, formation_date, periods, created_at
    const fundsCleaned = funds?.map(f => ({
        Name: f.name,
        Vintage: f.vintage,
        Committed_Capital: f.committed_capital,
        Invested_Amount: f.investable_amount,
        Currency: f.currency,
        Formation_Date: f.formation_date,
        Investment_Period_Start: f.investment_period_start,
        Investment_Period_End: f.investment_period_end,
        Created_At: f.created_at,
        System_ID: f.id // Included for completeness (at end)
    })) || [];
    const fundsCSV = toCSV(fundsCleaned, [
        'Name', 'Vintage', 'Committed_Capital', 'Invested_Amount', 'Currency',
        'Formation_Date', 'Investment_Period_Start', 'Investment_Period_End', 'Created_At', 'System_ID'
    ]);

    // Companies: id, name, legal_name, status, sector, description, website, founded_year, headquarters, drive_folder_id, created_at
    const companiesCleaned = companies?.map(c => ({
        Name: c.name,
        Legal_Name: c.legal_name,
        Status: c.status,
        Sector: c.sector,
        Description: c.description,
        Website: c.website,
        Founded_Year: c.founded_year,
        Headquarters: c.headquarters,
        Drive_Folder_ID: c.drive_folder_id,
        Created_At: c.created_at,
        System_ID: c.id
    })) || [];
    const companiesCSV = toCSV(companiesCleaned, [
        'Name', 'Legal_Name', 'Status', 'Sector', 'Description', 'Website',
        'Founded_Year', 'Headquarters', 'Drive_Folder_ID', 'Created_At', 'System_ID'
    ]);

    // Rounds: id, company_id, round_label, close_date, pre/post money, share_price, round_size, shares_issued, cap, discount, drive_folder...
    const roundsCleaned = rounds?.map(r => ({
        Company: r.company?.name || 'Unknown',
        Round_Label: r.round_label,
        Close_Date: r.close_date,
        Post_Money_Valuation: r.post_money_valuation,
        Pre_Money_Valuation: r.pre_money_valuation, // Added
        Round_Size: r.round_size,
        Share_Price: r.share_price,
        Shares_Issued: r.shares_issued, // Added
        Valuation_Cap: r.valuation_cap, // Added
        Safe_Discount: r.safe_discount, // Added
        Drive_Folder_ID: r.drive_folder_id, // Added
        Created_At: r.created_at,
        System_ID: r.id
    })) || [];
    const roundsCSV = toCSV(roundsCleaned, [
        'Company', 'Round_Label', 'Close_Date', 'Post_Money_Valuation', 'Pre_Money_Valuation',
        'Round_Size', 'Share_Price', 'Shares_Issued', 'Valuation_Cap', 'Safe_Discount',
        'Drive_Folder_ID', 'Created_At', 'System_ID'
    ]);

    // 3. Generate Master Ledger (All Rounds + Transaction Details)
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

        // Common Round Data fields for the ledger
        const roundData = {
            Round_Close_Date: round.close_date,
            Company: companyName,
            Round: round.round_label,
            Implied_Valuation: round.post_money_valuation,
            Pre_Money: round.pre_money_valuation,
            Round_Size: round.round_size,
            Share_Price: round.share_price,
            Valuation_Cap: round.valuation_cap,
            Safe_Discount: round.safe_discount,
            Sector: sector,
            Company_Status: status,
        };

        if (roundTransactions && roundTransactions.length > 0) {
            // We have activity in this round (Investment or Exit)
            roundTransactions.forEach(tx => {
                masterLedger.push({
                    Date: tx.date || round.close_date,
                    ...roundData,
                    Participation: 'R-Squared Invested',
                    Transaction_Type: tx.type, // Investment, Exit
                    Fund: tx.fund?.name || 'Unknown',
                    Amount_Invested: tx.amount_invested || 0,
                    Shares: tx.shares_purchased || 0,
                    Ownership_Percent: tx.ownership_percentage || 0,
                    Security_Type: tx.security_type,
                    Equity_Type: tx.equity_type,
                    Warrant_Coverage: tx.warrant_coverage_percentage, // Added
                    Warrant_Expiration: tx.warrant_expiration_date, // Added
                    Comments: tx.notes || '' // Check if notes exists in schema, otherwise might be null
                });
            });
        } else {
            // No transactions - This is a "Tracked" or "Passed" round
            masterLedger.push({
                Date: round.close_date,
                ...roundData,
                Participation: 'Not Invested',
                Transaction_Type: 'Round Logged',
                Fund: '—',
                Amount_Invested: 0,
                Shares: 0,
                Ownership_Percent: 0,
                Security_Type: '—',
                Equity_Type: '—',
                Warrant_Coverage: '',
                Warrant_Expiration: '',
                Comments: 'Round recorded without investment'
            });
        }
    });

    const masterCSV = toCSV(masterLedger, [
        'Date', 'Company', 'Round', 'Participation', 'Transaction_Type',
        'Fund', 'Amount_Invested', 'Shares', 'Ownership_Percent',
        'Implied_Valuation', 'Pre_Money', 'Round_Size', 'Share_Price',
        'Valuation_Cap', 'Safe_Discount', 'Sector', 'Company_Status',
        'Security_Type', 'Equity_Type', 'Warrant_Coverage', 'Warrant_Expiration', 'Comments'
    ]);

    // 4. Create ZIP
    const zip = new JSZip();
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `vc_portfolio_backup_${dateStr}`;
    const folder = zip.folder(folderName);

    if (folder) {
        folder.file('Funds.csv', fundsCSV);
        folder.file('Companies.csv', companiesCSV);
        folder.file('Rounds.csv', roundsCSV);
        folder.file('MASTER_LEDGER.csv', masterCSV);
        folder.file('README.txt', `Portfolio Export - ${dateStr}\n\nCONTENTS:\n- MASTER_LEDGER.csv: Detailed ledger of all rounds and investments.\n- Rounds.csv: Full round logs.\n- Companies.csv: Company directory.\n- Funds.csv: Fund configurations.`);
    }

    // Generate Base64
    const content = await zip.generateAsync({ type: 'base64' });
    return content;
}
