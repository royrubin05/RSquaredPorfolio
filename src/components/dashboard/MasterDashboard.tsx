"use client";

import { Plus, ArrowUpRight, TrendingUp, DollarSign, Activity } from "lucide-react";

export function MasterDashboard() {
    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">Portfolio overview and recent activity.</p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard
                        label="Total AUM"
                        value="$150.0M"
                        subtext="Across 3 Active Funds"
                        icon={<DollarSign size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Capital Deployed"
                        value="$82.5M"
                        subtext="55% of Committed Capital"
                        icon={<TrendingUp size={18} className="text-primary" />}
                    />
                    <KpiCard
                        label="Active Portfolio"
                        value="24"
                        subtext="Portfolio Companies"
                        icon={<Activity size={18} className="text-primary" />}
                    />
                </div>

                {/* Layout: Main Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity - Takes up 2/3 */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
                                <a href="/ledger" className="text-xs text-primary font-medium hover:underline">View All</a>
                            </div>
                            <div className="p-0">
                                <ActivityItem
                                    title="Series B Investment"
                                    company="Nimble Types"
                                    date="Oct 24, 2024"
                                    amount="$2.5M"
                                    fund="Fund II"
                                />
                                <ActivityItem
                                    title="Follow-on Round"
                                    company="Blue Ocean Robotics"
                                    date="Oct 12, 2024"
                                    amount="$500K"
                                    fund="Fund I"
                                />
                                <ActivityItem
                                    title="Seed Investment"
                                    company="Vertex AI"
                                    date="Sep 28, 2024"
                                    amount="$1.2M"
                                    fund="Fund II"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Side - Takes up 1/3 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Fund Performance</h3>
                            <div className="space-y-4">
                                <FundRow name="Fund I" irr="22.5%" multiple="2.1x" />
                                <FundRow name="Fund II" irr="18.2%" multiple="1.4x" />
                                <FundRow name="Fund III" irr="N/A" multiple="1.0x" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

function ActivityItem({ title, company, date, amount, fund }: { title: string; company: string; date: string; amount: string; fund: string }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
                    <ArrowUpRight size={18} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{company}</span>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">{fund}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{title} • {date}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-bold text-foreground font-mono">{amount}</div>
                <div className="text-xs text-muted-foreground">Invested</div>
            </div>
        </div>
    )
}

function FundRow({ name, irr, multiple }: { name: string; irr: string; multiple: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed border-border last:border-0">
            <div className="text-sm font-medium text-foreground">{name}</div>
            <div className="text-xs font-mono text-muted-foreground">
                <span className="mr-3">IRR: {irr}</span>
                <span>MOIC: {multiple}</span>
            </div>
        </div>
    )
}
