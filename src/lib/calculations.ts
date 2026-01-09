
/**
 * Centralized Financial Calculations and Formatters
 * 
 * Purpose: Ensure consistency across Dashboard, Company List, and Detail pages.
 * Single source of truth for:
 * - Implied Value Logic (SAFE fallbacks)
 * - Currency Formatting
 * - Investment Aggregation
 */

// --- Types ---
interface MinimalTransaction {
    amount_invested: number | string | null;
    shares_purchased?: number | string | null; // Database column
    number_of_shares?: number | string | null; // Legacy/Alias often used in UI
}

interface MinimalRound {
    price_per_share: number | string | null;
    round_label?: string;
    close_date?: string;
}

// --- Formatters ---

/**
 * consistently formats currency to USD
 * @param amount Number to format
 * @param options Intl.NumberFormatOptions
 */
export function formatCurrency(amount: number | string | null | undefined, options: Intl.NumberFormatOptions = {}): string {
    const num = Number(amount);
    if (isNaN(num) || num === 0) return options.compactDisplay === 'short' ? '$0' : '$0.00'; // Or '-' depending on preference, but usually consistent $0 is better for math results

    const defaultOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        ...options
    };

    return new Intl.NumberFormat('en-US', defaultOptions).format(num);
}

/**
 * Compact currency formatter (e.g. $1.5M)
 */
export function formatCompact(amount: number | string | null | undefined): string {
    return formatCurrency(amount, { notation: 'compact', maximumFractionDigits: 1 });
}

// --- Calculations ---

/**
 * Calculates Implied Value of a holding.
 * 
 * Rule:
 * 1. If Shares > 0 and PPS is valid (>0), Implied Value = Shares * PPS.
 * 2. If Shares == 0 (e.g. SAFE) or PPS is invalid, Implied Value = Cost Basis (1x).
 * 
 * @param shares Total shares held
 * @param costBasis Total invested amount (cost basis)
 * @param latestPps Price Per Share from latest round
 */
export function calculateImpliedValue(shares: number, costBasis: number, latestPps: number): number {
    const validPps = !isNaN(latestPps) && latestPps > 0;
    const validShares = !isNaN(shares) && shares > 0;

    if (validShares && validPps) {
        return shares * latestPps;
    }

    // Fallback for SAFEs or unpriced rounds
    return costBasis;
}

/**
 * Calculates Total Invested Amount from a list of transactions.
 * Safely handles strings and nulls.
 */
export function calculateTotalInvested(transactions: MinimalTransaction[] | undefined | null): number {
    if (!transactions) return 0;
    return transactions.reduce((sum, t) => {
        const val = Number(t.amount_invested) || 0;
        return sum + val;
    }, 0);
}

/**
 * Safely parses a number that might be a string with currency symbols
 * e.g. "$1,200.00" -> 1200
 */
export function safeParseBytes(val: any): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
}
