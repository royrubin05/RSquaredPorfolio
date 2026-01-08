"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Investor {
    id: string;
    name: string;
    deals: { id: string; name: string; }[];
}

export function InvestorRolodex({ initialInvestors = [] }: { initialInvestors?: Investor[] }) {
    const [investors] = useState<Investor[]>(initialInvestors);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredInvestors = investors.filter(inv =>
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.deals && inv.deals.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <div className="flex-1 w-full p-6 md:p-8">

            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Co-Investors</h1>
                        <p className="text-sm text-muted-foreground mt-1">Co-investors and syndicate partners.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search investors or deals..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Investor Table */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-border text-left">
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider w-1/3">Investor</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Deals Together</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            {filteredInvestors.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-muted-foreground font-bold border border-gray-200">
                                                {inv.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-foreground">{inv.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {inv.deals && inv.deals.length > 0 ? (
                                                inv.deals.map((deal: any, idx: number) => (
                                                    <Link key={idx} href={`/companies/${deal.id}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-colors">
                                                        {deal.name}
                                                    </Link>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">No common deals recorded</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredInvestors.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No investors found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


