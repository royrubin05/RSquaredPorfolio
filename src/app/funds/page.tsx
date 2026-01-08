
import { FundsList } from "@/components/funds/FundsList";
import { getFunds } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function FundsPage() {
    // We need more than just funds, we need aggregated metrics.
    // Fetch funds
    const fundsRaw = await getFunds();

    // Fetch aggregated metrics manually for now since getFunds is simple select
    const supabase = await createClient();

    // 1. Deployed Capital (Sum of transactions cost basis)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('fund_id, amount_invested, company_id, type');

    // 2. Map metrics to funds
    const funds = fundsRaw.map((fund: any) => {
        const fundTx = transactions?.filter(t => t.fund_id === fund.id) || [];

        // Deployed Capital: Sum of 'amount_invested' for Investments. 
        // (subtract Exits? Usually deployed is gross deployed, but let's stick to simple sum of investments for now)
        const deployed_capital = fundTx
            .filter(t => t.type === 'Investment')
            .reduce((sum, t) => sum + (Number(t.amount_invested) || 0), 0);

        // Portfolio Count: Unique companies invested in
        const uniqueCompanies = new Set(fundTx.map(t => t.company_id));
        const portfolio_count = uniqueCompanies.size;

        return {
            ...fund,
            deployed_capital,
            portfolio_count
        };
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <FundsList funds={funds} />
        </div>
    );
}
