"use client";

import { TrendingUp, DollarSign, Activity, ChevronRight, PieChart as PieChartIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type DashboardProps = {
    kpis: {
        totalAum: number;
        capitalDeployed: number;
        activeCompanies: number;
    };
    deployments: {
        name: string;
        deployed: number;
        total: number;
        vintage?: string;
        isSpv?: boolean;
    }[];
    portfolio: {
        id: string;
        name: string;
        sector: string;
        invested: number;
        ownership: number;
        fundNames: string[];
    }[];
};

export function MasterDashboard({ kpis, deployments, portfolio }: DashboardProps) {
    // Helper to format currency
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1, notation: "compact", compactDisplay: "short" }).format(n);

    // Group portfolio by Fund for display
    const fundsMap = new Map<string, typeof portfolio>();
    portfolio.forEach(c => {
        // A company can be in multiple funds, visual dupe is acceptable for "By Fund" list
        c.fundNames.forEach(fName => {
            const list = fundsMap.get(fName) || [];
            list.push(c);
            fundsMap.set(fName, list);
        });
        if (c.fundNames.length === 0) {
            const list = fundsMap.get('Unassigned') || [];
            list.push(c);
            fundsMap.set('Unassigned', list);
        }
    });

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
                        subtext="Across Active Funds"
                        icon={<DollarSign size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Capital Deployed"
                        value={fmt(kpis.capitalDeployed)}
                        subtext={`${((kpis.capitalDeployed / kpis.totalAum) * 100).toFixed(1)}% of Committed Capital`}
                        icon={<TrendingUp size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Active Companies"
                        value={kpis.activeCompanies.toString()}
                        subtext="Across all vehicles"
                        icon={<Activity size={18} className="text-primary" />}
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
                                        deployed={d.deployed / 1000000} // props in nominal, component expects M? Let's fix component below actually.
                                        total={d.total / 1000000}
                                        vintage={d.vintage}
                                        isSpv={d.name.includes("SPV")} // Auto-detect SPV for now if flag missing or rely on name
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Portfolio by Fund List */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="px-6 py-5 border-b border-border bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-base font-medium text-foreground">Portfolio Companies</h3>
                                <Link href="/companies" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                    View All <ArrowRight size={12} />
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {Array.from(fundsMap.entries()).map(([fundName, companies]) => (
                                    <FundGroup key={fundName} title={fundName}>
                                        {companies.map((c, idx) => (
                                            <CompanyRow
                                                key={`${c.id}-${idx}`}
                                                id={c.id}
                                                name={c.name}
                                                sector={c.sector}
                                                invested={fmt(c.invested)}
                                                ownership={`${c.ownership.toFixed(1)}%`}
                                            />
                                        ))}
                                    </FundGroup>
                                ))}
                                {fundsMap.size === 0 && (
                                    <div className="p-6 text-center text-sm text-muted-foreground">No active investments found.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function KpiCard({ label, value, subtext, icon }: { label: string; value: string; subtext: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</h3>
                {icon && <div className="opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>}
            </div>
            <div>
                <div className="text-3xl font-bold text-foreground tracking-tight font-mono">{value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            </div>
        </div>
    );
}

function DeploymentBar({ name, deployed, total, vintage, isSpv }: { name: string; deployed: number; total: number; vintage?: string; isSpv?: boolean }) {
    const percentage = Math.min(100, (deployed / total) * 100);

    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-end text-sm">
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${isSpv ? 'text-purple-600' : 'text-foreground'}`}>{name}</span>
                    {vintage && <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{vintage}</span>}
                </div>
                <div className="text-muted-foreground font-mono text-xs">
                    <span className="text-foreground font-medium">${deployed.toFixed(1)}M</span> / ${total.toFixed(1)}M
                </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90 ${isSpv ? 'bg-purple-500' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}



function FundGroup({ title, vintage, isSpv, children }: { title: string; vintage?: string; isSpv?: boolean; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${isSpv ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isSpv ? <Activity size={14} /> : <PieChartIcon size={14} />}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    {vintage && <span className="text-xs text-muted-foreground font-normal">({vintage})</span>}
                </div>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOpen && (
                <div className="bg-gray-50/30">
                    {children}
                </div>
            )}
        </div>
    );
}

function CompanyRow({ id, name, sector, invested, ownership }: { id: string; name: string; sector: string; invested: string; ownership: string }) {
    return (
        <Link href={`/companies/${id}`} className="flex items-center justify-between px-6 py-3 hover:bg-white border-b border-gray-50 last:border-0 group transition-all">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{name}</h4>
                    <p className="text-xs text-muted-foreground">{sector}</p>
                </div>
            </div>

            <div className="flex items-center gap-8 text-right">
                <div>
                    <div className="text-xs font-medium text-foreground">{invested}</div>
                    <div className="text-[10px] text-muted-foreground">Invested</div>
                </div>
                <div className="w-16">
                    <div className="text-xs font-medium text-foreground">{ownership}</div>
                    <div className="text-[10px] text-muted-foreground">Own.</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
            </div>
        </Link>
    );
}
