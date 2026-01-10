"use client";

import { ArrowUpRight, Link as LinkIcon, MoreHorizontal, Filter, Plus, Pencil, FileText, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CompanyCreationModal, CompanyData } from "../dashboard/CompanyCreationModal";
import { upsertCompany, deleteCompany, getCompanyStatuses } from "@/app/actions";



// Countries List
// const FUNDS = ["All Funds", "Fund I", "Fund II", "Fund III"]; // Removed Hardcoded

// Warrants Aggregation Type
interface PendingWarrant {
    companyId: string;
    companyName: string;
    round: string;
    coverage: string;
    coverageType: 'money' | 'percentage';
    expirationDate: string;
}

export interface PortfolioCompany {
    id: string;
    name: string;
    sector: string;
    stage?: string;
    invested: number;
    ownership: number;
    fundNames: string[];
    country?: string;
    status: string;
}

export function CompanyList({ initialCompanies = [], initialFunds = [] }: { initialCompanies?: PortfolioCompany[], initialFunds?: { id: string, name: string }[] }) {
    const router = useRouter();
    const [selectedFund, setSelectedFund] = useState("All Funds");
    const [funds, setFunds] = useState<{ id: string, name: string }[]>(initialFunds || []);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [pendingWarrants, setPendingWarrants] = useState<PendingWarrant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Status Settings
    const [statuses, setStatuses] = useState<string[]>(['Active', 'Watchlist', 'Exit', 'Shutdown']);

    // Load from Props on Mount (Server Data Priority)
    useEffect(() => {
        // Fetch Statuses
        getCompanyStatuses().then(setStatuses);

        if (initialCompanies.length > 0) {
            // Map Server Data to UI Shape
            const mapped = initialCompanies.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                category: c.sector,
                stage: c.stage,
                invested: c.invested, // already number
                ownership: c.ownership, // Map to UI expectation
                funds: c.fundNames,
                country: c.country,
                oneLiner: "", // Not yet in DB schema fully utilized
            }));
            setCompanies(mapped);
        } else {
            // DB is empty. Do not fallback to local storage or mocks to avoid broken links (404s).
            setCompanies([]);
        }
        setIsLoading(false);

        // --- Aggregation Logic: Scan for Warrants (Client-side only) ---
        // ... (existing logic) ...
    }, [initialCompanies]);

    const [searchQuery, setSearchQuery] = useState("");

    const filteredCompanies = companies.filter(c => {
        const matchesFund = selectedFund === "All Funds" || c.funds?.includes(selectedFund);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            c.name?.toLowerCase().includes(searchLower) ||
            c.category?.toLowerCase().includes(searchLower);

        return matchesFund && matchesSearch;
    });

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
            documents: [], // Todo handle docs
            status: company.status || 'Active'
        });
        setIsCreateModalOpen(true);
    };

    const handleSaveCompany = async (data: CompanyData) => {
        setIsLoading(true);
        const result = await upsertCompany(data);
        if (result.error) {
            alert(`Error saving company: ${result.error}`);
        } else {
            // Success - Next.js Server Action revalidates, we just need to refresh the view to see updated InitialProps
            router.refresh();
            setIsCreateModalOpen(false);
            // Optionally update local list optimistically?
            // For now, rely on refresh.
        }
        setIsLoading(false);
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

    const openDeleteModal = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCompanyToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!companyToDelete) return;

        setIsLoading(true);
        const result = await deleteCompany(companyToDelete);
        if (result.error) {
            alert(`Error deleting company: ${result.error}`);
        } else {
            router.refresh();
        }
        setDeleteModalOpen(false);
        setCompanyToDelete(null);
        setIsLoading(false);
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
                availableStatuses={statuses}
            />

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-6 w-[400px] flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Company</h3>
                                <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete Company
                            </button>
                        </div>
                    </div>
                </div>
            )}


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

                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-muted-foreground z-10" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-l-md hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 border-r-0"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedFund}
                                onChange={(e) => setSelectedFund(e.target.value)}
                                className="pl-4 pr-10 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-r-md hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer border-l-0"
                            >
                                <option value="All Funds">All Funds</option>
                                {funds.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
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
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(company.invested || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                            {Number(company.ownership) > 0
                                                ? `${Number(company.ownership)}%`
                                                : (company.invested > 0 ? 'SAFE' : '—')}
                                        </td>
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
                                            <button
                                                onClick={(e) => openDeleteModal(e, company.id)}
                                                className="text-muted-foreground hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"
                                                title="Delete Company"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
