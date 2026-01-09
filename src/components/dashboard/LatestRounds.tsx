"use client";

import Link from "next/link";
import { ArrowRight, Calendar, DollarSign, Users, Activity } from "lucide-react";


interface LatestRoundsProps {
    rounds: {
        id: string;
        companyId: string;
        companyName: string;
        companySector?: string;
        roundLabel: string;
        date: string;
        investedAmount: number;
        leads: string[];
    }[];
}

export function LatestRounds({ rounds }: LatestRoundsProps) {
    if (!rounds || rounds.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full items-center justify-center p-8 text-center">
                <p className="text-muted-foreground text-sm">No recent investment activity found.</p>
                <div className="mt-2 text-xs text-muted-foreground">Log a new round to see updates here.</div>
            </div>
        );
    }


    return (
        <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-gray-50/80 to-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                        <Activity size={16} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Latest Round Updates</h3>
                </div>
            </div>

            <div className="divide-y divide-gray-100/80">
                {rounds.map((round) => (
                    <div key={round.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors group relative border-l-2 border-transparent hover:border-primary">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3.5">
                                {/* Auto-Avatar - More vibrant */}
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                                    {round.companyName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <Link
                                        href={`/companies/${round.companyId}`}
                                        className="text-sm font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        {round.companyName}
                                        <ArrowRight size={13} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                    </Link>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                            {round.roundLabel}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span>{new Date(round.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-bold text-emerald-600 font-mono tracking-tight">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(round.investedAmount)}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/70 mt-0.5">Invested</div>
                            </div>
                        </div>

                        {/* Bottom Row: Leads or Metadata */}
                        {(round.leads.length > 0) && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Users size={12} className="text-blue-400" />
                                    <span className="font-medium">Lead:</span>
                                    <span className="text-foreground font-medium truncate max-w-[200px]">{round.leads.join(", ")}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
