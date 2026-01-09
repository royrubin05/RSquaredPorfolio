"use client";

import { TrendingUp, DollarSign, Activity, Activity as ActivityIcon } from "lucide-react";
import { LatestRounds } from "./LatestRounds";
import { formatCompact } from "@/lib/calculations";
import { useState } from "react";

export type DashboardProps = {
    kpis: {
        totalAum: number;
        capitalDeployed: number;
        activeCompanies: number;
        roundsCount?: number;
    };
    deployments: {
        name: string;
        deployed: number;
        total: number;
        vintage?: string;
        isSpv?: boolean;
    }[];
    latestRounds: any[]; // Updated Prop
};

export function MasterDashboard({ kpis, deployments, latestRounds }: DashboardProps) {
    // Helper to format currency
    const fmt = formatCompact;

    return (
        <div className="flex-1 w-full p-6 md:p-8 space-y-8">
            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">Portfolio overview and fund deployment status.</p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard
                        label="Total AUM"
                        value={fmt(kpis.totalAum)}
                        subtext="Committed Capital"
                        icon={<DollarSign size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Capital Deployed"
                        value={fmt(kpis.capitalDeployed)}
                        subtext={`Across ${kpis.roundsCount || '-'} rounds`}
                        icon={<TrendingUp size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Active Companies"
                        value={kpis.activeCompanies.toString()}
                        subtext="Across all vehicles"
                        icon={<ActivityIcon size={18} className="text-primary" />}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Capital Deployed & Fund Performance */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                        {/* Capital Deployed Chart */}
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6">
                            <h3 className="text-base font-medium text-foreground mb-1">Capital Deployed</h3>
                            <p className="text-xs text-muted-foreground mb-6">Breakdown by investment vehicle.</p>

                            <div className="space-y-6">
                                {deployments.map((d, i) => (
                                    <DeploymentBar
                                        key={i}
                                        name={d.name}
                                        deployed={d.deployed} // Pass raw nominal values
                                        total={d.total}
                                        vintage={d.vintage}
                                        isSpv={d.name.includes("SPV")} // Auto-detect SPV for now if flag missing or rely on name
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Latest Round Updates */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <LatestRounds rounds={latestRounds || []} />
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function KpiCard({ label, value, subtext, icon }: { label: string; value: string; subtext: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border/60 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start z-10">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-primary/80 transition-colors">{label}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
                </div>
                {icon && (
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                )}
            </div>

            <div className="z-10 mt-auto">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    {subtext}
                </p>
            </div>
        </div>
    );
}

function DeploymentBar({ name, deployed, total, vintage, isSpv }: { name: string; deployed: number; total: number; vintage?: string; isSpv?: boolean }) {
    const percent = Math.min((deployed / total) * 100, 100);
    const isHighUtilization = percent > 85;

    // Helper for compact currency
    const fmt = formatCompact;

    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{name}</span>
                    {isSpv && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 font-medium">SPV</span>}
                    {vintage && <span className="text-xs text-muted-foreground">({vintage})</span>}
                </div>
                <div className="text-right">
                    <span className="font-mono font-medium text-foreground">{fmt(deployed)}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="font-mono text-muted-foreground">{fmt(total)}</span>
                </div>
            </div>

            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100 relative">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isSpv ? 'bg-amber-500' : 'bg-primary'
                        }`}
                    style={{ width: `${percent}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
            </div>

            <div className="flex justify-between text-xs">
                <span className={`font-medium ${isHighUtilization ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {percent.toFixed(1)}% Deployed
                </span>
                <span className="text-muted-foreground">
                    {fmt(total - deployed)} Remaining
                </span>
            </div>
        </div>
    );
}
