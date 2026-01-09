
import { Calculator } from "lucide-react";

export default function CalculationsPage() {
    return (
        <div className="flex-1 w-full p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
                    <Calculator className="text-primary" size={28} />
                    System Calculations
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                    Transparency report on how key financial metrics are derived in this system.
                    <br />
                    <em>Logic centralized in <code>src/lib/calculations.ts</code></em>.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Implied Value */}
                <section className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        1. Implied Value (Unrealized)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Determines the current hypothetical value of holdings based on the latest priced round.
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono text-sm space-y-2">
                        <div className="font-bold text-slate-700">Formula:</div>
                        <div className="pl-4 border-l-2 border-slate-300">
                            IF (Shares &gt; 0 AND Latest_PPS &gt; 0) {'{'}
                            <br />
                            &nbsp;&nbsp; Value = Total_Shares * Latest_PPS
                            <br />
                            {'}'} ELSE {'{'}
                            <br />
                            &nbsp;&nbsp; Value = Cost_Basis (1.0x MOIC)
                            <br />
                            {'}'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-amber-50/50 rounded border border-amber-100">
                            <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">SAFE Agreements</h4>
                            <p className="text-xs text-amber-900/80">
                                Since SAFEs do not have a fixed share count until conversion, their Implied Value defaults to the <strong>Cost Basis</strong> (Invested Amount) to prevent showing $0.00.
                            </p>
                        </div>
                        <div className="p-3 bg-green-50/50 rounded border border-green-100">
                            <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Priced Equity</h4>
                            <p className="text-xs text-green-900/80">
                                Once converted to shares, scale by the <strong>Price Per Share (PPS)</strong> of the most recent financing round (Series A, B, etc.).
                            </p>
                        </div>
                    </div>
                </section>

                {/* Capital Deployed */}
                <section className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        2. Capital Deployed
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Total nominal USD amount invested into companies.
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono text-sm">
                        SUM(Transaction.amount_invested)
                    </div>
                </section>

                {/* AUM */}
                <section className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        3. Total AUM (Assets Under Management)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Defined as the sum of committed capital across all Funds and SPVs.
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono text-sm">
                        SUM(Fund.committed_capital)
                    </div>
                    <div className="text-xs text-muted-foreground">
                        * Does not currently include unrealized gains (TVPI) in the top-level AUM figure.
                    </div>
                </section>
            </div>
        </div>
    );
}
