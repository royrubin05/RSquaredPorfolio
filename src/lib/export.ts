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

    // 1. Fetch All Data
    const { data: funds } = await supabase.from('funds').select('*').order('name');
    const { data: companies } = await supabase.from('companies').select('*').order('name');
    const { data: rounds } = await supabase.from('financing_rounds').select('*').order('created_at');
    const { data: transactions } = await supabase.from('transactions').select(`
        *,
        fund:funds(name),
        round:financing_rounds(
            round_label,
            close_date,
            company:companies(name, sector, status)
        )
    `).order('date');

    // 2. Generate Individual CSVs
    const fundsCSV = toCSV(funds || [], ['id', 'name', 'vintage', 'committed_capital', 'investable_amount', 'currency']);
    const companiesCSV = toCSV(companies || [], ['id', 'name', 'sector', 'status', 'headquarters', 'website']);
    const roundsCSV = toCSV(rounds || [], ['id', 'company_id', 'round_label', 'close_date', 'post_money_valuation', 'round_size']);

    // 3. Generate Master Ledger (Optimized for Excel Pivot)
    // Flatten transactions into a single "Ledger" view
    const masterLedger = transactions?.map((tx: any) => {
        const companyName = tx.round?.company?.name || 'Unknown';
        const companySector = tx.round?.company?.sector || '';
        const companyStatus = tx.round?.company?.status || '';
        const roundLabel = tx.round?.round_label || '';
        const fundName = tx.fund?.name || 'Unknown';

        return {
            Date: tx.date || tx.round?.close_date,
            Fund: fundName,
            Company: companyName,
            Sector: companySector,
            Status: companyStatus,
            Round: roundLabel,
            Transaction_Type: tx.type, // 'Investment' or 'Exit'
            Security_Type: tx.security_type,
            Equity_Type: tx.equity_type,
            Amount_Invested: tx.amount_invested,
            Shares: tx.shares_purchased,
            Ownership_Percent: tx.ownership_percentage,
            Price_Per_Share: tx.price_per_share, // Might need to fetch from round if not on tx, but often tx has it or derived
            // Add Round metrics for context if needed, but keep it clean for summing
        };
    }) || [];

    const masterCSV = toCSV(masterLedger, [
        'Date', 'Fund', 'Company', 'Sector', 'Status', 'Round',
        'Transaction_Type', 'Security_Type', 'Equity_Type',
        'Amount_Invested', 'Shares', 'Ownership_Percent'
    ]);

    // 4. Create ZIP
    const zip = new JSZip();
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `backup_${dateStr}`;
    const folder = zip.folder(folderName);

    if (folder) {
        folder.file('funds.csv', fundsCSV);
        folder.file('companies.csv', companiesCSV);
        folder.file('rounds.csv', roundsCSV);
        folder.file('MASTER_LEDGER.csv', masterCSV);
        folder.file('README.txt', `Exported on ${new Date().toISOString()}\n\nMASTER_LEDGER.csv is optimized for Excel Pivot Tables.`);
    }

    // Generate Base64
    const content = await zip.generateAsync({ type: 'base64' });
    return content;
}
