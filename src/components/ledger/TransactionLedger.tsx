import { Filter, Download } from "lucide-react";

export function TransactionLedger() {
    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">General Ledger</h1>
                        <p className="text-sm text-muted-foreground mt-1">Comprehensive record of all investment transactions.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                            <Filter size={16} />
                            <span>Filter</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-border text-left">
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Date</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Fund</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Company</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Type</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Shares</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">FMV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            <TransactionRow
                                date="2024-10-24"
                                fund="Fund II"
                                company="Nimble Types"
                                type="Follow-on"
                                amount="$2,500,000"
                                shares="350,000"
                                fmv="$2,500,000"
                            />
                            <TransactionRow
                                date="2024-09-28"
                                fund="Fund II"
                                company="Vertex AI"
                                type="Initial Investment"
                                amount="$1,200,000"
                                shares="1,000,000"
                                fmv="$1,500,000"
                            />
                            <TransactionRow
                                date="2024-06-15"
                                fund="Fund I"
                                company="Blue Ocean"
                                type="Warrant Exercise"
                                amount="$125,000"
                                shares="50,000"
                                fmv="$250,000"
                            />
                            <TransactionRow
                                date="2024-01-10"
                                fund="Fund I"
                                company="Darktrace"
                                type="Exit"
                                amount="($5,000,000)"
                                shares="-500,000"
                                fmv="-"
                                highlight
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TransactionRow({ date, fund, company, type, amount, shares, fmv, highlight }: { date: string; fund: string; company: string; type: string; amount: string; shares: string; fmv: string; highlight?: boolean }) {
    return (
        <tr className={`hover:bg-gray-50/50 transition-colors ${highlight ? 'bg-green-50/30' : ''}`}>
            <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{date}</td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {fund}
                </span>
            </td>
            <td className="px-6 py-4 font-medium text-foreground">{company}</td>
            <td className="px-6 py-4 text-muted-foreground">{type}</td>
            <td className="px-6 py-4 text-right font-mono text-foreground">{amount}</td>
            <td className="px-6 py-4 text-right font-mono text-muted-foreground">{shares}</td>
            <td className="px-6 py-4 text-right font-mono text-foreground">{fmv}</td>
        </tr>
    )
}
