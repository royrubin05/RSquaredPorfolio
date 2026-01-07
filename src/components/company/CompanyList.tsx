"use client";

import { ArrowUpRight, Link as LinkIcon, MoreHorizontal, Filter, Plus, Pencil, FileText } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CompanyCreationModal, CompanyData } from "../dashboard/CompanyCreationModal";

// Mock Data with Fund Associations
const INITIAL_COMPANIES = [
    { id: '1', name: "Nimble Types", status: "Active", industry: "AI / Legal", stage: "Series B", invested: 3700000, ownership: "12.5%", funds: ["Fund I", "Fund II"], country: "USA", oneLiner: "Legal AI automation platform.", category: "AI" },
    { id: '2', name: "Blue Ocean", status: "Active", industry: "Robotics", stage: "Series A", invested: 1500000, ownership: "8.2%", funds: ["Fund I"], country: "Denmark", oneLiner: "Autonomous underwater drones.", category: "Infra" },
    { id: '3', name: "Vertex AI", status: "Active", industry: "Infrastructure", stage: "Seed", invested: 1200000, ownership: "15.0%", funds: ["Fund II"], country: "Israel", oneLiner: "Next-gen GPU orchestration.", category: "AI" },
    { id: '4', name: "Darktrace", status: "Exit", industry: "Cybersecurity", stage: "IPO", invested: 5000000, ownership: "0.0%", funds: ["Fund I"], country: "UK", oneLiner: "AI-powered cyber defense.", category: "SaaS" },
];

// Countries List
const FUNDS = ["All Funds", "Fund I", "Fund II", "Fund III"];

// Warrants Aggregation Type
interface PendingWarrant {
    companyId: string;
    companyName: string;
    round: string;
    coverage: string;
    coverageType: 'money' | 'percentage';
    expirationDate: string;
}

export function CompanyList() {
    const router = useRouter();
    const [selectedFund, setSelectedFund] = useState("All Funds");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [pendingWarrants, setPendingWarrants] = useState<PendingWarrant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from LocalStorage on Mount
    useEffect(() => {
        const stored = localStorage.getItem('companies');
        let loadedCompanies = INITIAL_COMPANIES;

        if (stored) {
            let parsed = JSON.parse(stored);
            // Data Healing: Fix missing IDs
            let needsUpdate = false;
            parsed = parsed.map((c: any) => {
                if (!c.id) {
                    needsUpdate = true;
                    return { ...c, id: Math.random().toString(36).substr(2, 9) };
                }
                return c;
            });

            if (needsUpdate) {
                console.log("Healed missing company IDs");
                localStorage.setItem('companies', JSON.stringify(parsed));
            }
            setCompanies(parsed);
            loadedCompanies = parsed;
        } else {
            setCompanies(INITIAL_COMPANIES);
            localStorage.setItem('companies', JSON.stringify(INITIAL_COMPANIES));
        }

        // --- Aggregation Logic: Scan for Warrants ---
        const aggregatedWarrants: PendingWarrant[] = [];

        loadedCompanies.forEach((company: any) => {
            // Normalized key to match CompanyDetail logic (e.g. "Nimble Types" -> "nimble_types")
            // Note: Currently purely client-side prototyping logic.
            const statsKey = `company_rounds_${company.name.toLowerCase().replace(/ /g, '_')}`;
            const storedRounds = localStorage.getItem(statsKey);

            if (storedRounds) {
                try {
                    const rounds = JSON.parse(storedRounds);
                    if (Array.isArray(rounds)) {
                        rounds.forEach((r: any) => {
                            if (r.hasWarrants && r.warrantTerms) {
                                aggregatedWarrants.push({
                                    companyId: company.id,
                                    companyName: company.name,
                                    round: r.round,
                                    coverage: r.warrantTerms.coverage,
                                    coverageType: r.warrantTerms.coverageType || 'percentage',
                                    expirationDate: r.warrantTerms.expirationDate
                                });
                            }
                        });
                    }
                } catch (e) {
                    // ignore invalid data
                }
            }
        });

        // Sort by expiration date (soonest first)
        aggregatedWarrants.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
        setPendingWarrants(aggregatedWarrants);

        setIsLoading(false);
    }, []);

    const filteredCompanies = selectedFund === "All Funds"
        ? companies
        : companies.filter(c => c.funds?.includes(selectedFund));

    const handleCreateNew = () => {
        setSelectedCompany(null);
        setIsCreateModalOpen(true);
    };

    const handleEditCompany = (e: React.MouseEvent, company: any) => {
        e.stopPropagation();
        setSelectedCompany({
            id: company.id,
            name: company.name,
            website: company.website,
            affinityLink: company.affinityLink || company.affinity_link, // Remap (support both for now)
            category: company.category || company.industry, // Fallback
            country: company.country,
            oneLiner: company.oneLiner || company.one_liner,
            formationDate: company.formationDate || company.formation_date,
            jurisdiction: company.jurisdiction,
            description: company.description,
            documents: [] // Todo handle docs
        });
        setIsCreateModalOpen(true);
    };

    const handleSaveCompany = (data: CompanyData) => {
        let updatedCompanies = [...companies];

        if (data.id) {
            // Update Existing
            updatedCompanies = updatedCompanies.map(c => c.id === data.id ? {
                ...c,
                ...data,
                // Ensure UI fields are preserved/mapped
                industry: data.category, // Map category to industry for table display compatibility
                // Keep existing fields if not overwritten
            } : c);
        } else {
            // Create New
            const newCompany = {
                id: Math.random().toString(36).substr(2, 9), // Simple ID
                ...data,
                status: 'Active',
                funds: [], // Default to no funds or maybe 'Fund I'
                invested: 0,
                ownership: "0%",
                industry: data.category, // Map for table
            };
            updatedCompanies = [newCompany, ...updatedCompanies];
        }

        setCompanies(updatedCompanies);
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        setIsCreateModalOpen(false);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading portfolio...</div>;
    }

    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <CompanyCreationModal
                checkIfOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialData={selectedCompany}
                onSave={handleSaveCompany}
            />
            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Portfolio Companies</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your active assets and investments.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>New Company</span>
                        </button>
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <select
                                value={selectedFund}
                                onChange={(e) => setSelectedFund(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                            >

                                {FUNDS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- GLOBAL WARRANTS DASHBOARD --- */}
                {pendingWarrants.length > 0 && (
                    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-amber-100 rounded-md text-amber-700">
                                <FileText size={16} />
                            </div>
                            <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Action Required: Warrants Watchlist</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingWarrants.map((w, idx) => (
                                <Link
                                    key={idx}
                                    href={`/companies/${w.companyId}`}
                                    className="block p-3 bg-white border border-amber-100 rounded-md hover:border-amber-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1">
                                                {w.companyName}
                                                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{w.round}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-medium text-amber-600">Expires</div>
                                            <div className="text-sm font-mono font-bold text-gray-900">{new Date(w.expirationDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Coverage</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {w.coverageType === 'money' ? '$' : ''}
                                            {new Intl.NumberFormat('en-US').format(parseFloat(w.coverage))}
                                            {w.coverageType === 'percentage' ? '%' : ''}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Company Table */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-border text-left">
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Company</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Industry</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Country</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Stage</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Invested</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Own %</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                                        No companies found. Add your first portfolio company to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company, index) => (
                                    <tr
                                        key={`${company.id}-${index}`}
                                        onClick={() => router.push(`/companies/${company.id}`)}
                                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-muted-foreground font-bold border border-gray-200">
                                                    {company.name?.charAt(0) || '?'}
                                                </div>
                                                {company.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${company.status === 'Active' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                                                {company.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{company.category}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{company.country}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{company.stage || '-'}</td>
                                        <td className="px-6 py-4 text-right font-mono text-foreground font-medium">
                                            {/* TODO: Aggregate investments proper */}
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(company.invested_amount || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">{company.ownership_percentage || '0'}%</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => handleEditCompany(e, company)}
                                                className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                                                title="Edit Company Details"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <Link
                                                href={`/companies/${company.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                                            >
                                                <ArrowUpRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
