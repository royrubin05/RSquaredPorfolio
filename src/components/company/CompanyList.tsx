"use client";

import { ArrowUpRight, Link as LinkIcon, MoreHorizontal, Filter, Plus, Pencil } from "lucide-react";
import Link from 'next/link';
import { useState } from "react";
import { CompanyCreationModal } from "../dashboard/CompanyCreationModal";

// Mock Data with Fund Associations
const COMPANIES = [
    { id: '1', name: "Nimble Types", status: "Active", industry: "AI / Legal", stage: "Series B", invested: 3700000, ownership: "12.5%", funds: ["Fund I", "Fund II"], country: "USA", oneLiner: "Legal AI automation platform.", category: "AI" },
    { id: '2', name: "Blue Ocean", status: "Active", industry: "Robotics", stage: "Series A", invested: 1500000, ownership: "8.2%", funds: ["Fund I"], country: "Denmark", oneLiner: "Autonomous underwater drones.", category: "Infra" },
    { id: '3', name: "Vertex AI", status: "Active", industry: "Infrastructure", stage: "Seed", invested: 1200000, ownership: "15.0%", funds: ["Fund II"], country: "Israel", oneLiner: "Next-gen GPU orchestration.", category: "AI" },
    { id: '4', name: "Darktrace", status: "Exit", industry: "Cybersecurity", stage: "IPO", invested: 5000000, ownership: "0.0%", funds: ["Fund I"], country: "UK", oneLiner: "AI-powered cyber defense.", category: "SaaS" },
];

const FUNDS = ["All Funds", "Fund I", "Fund II", "Fund III"];

export function CompanyList() {
    const [selectedFund, setSelectedFund] = useState("All Funds");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null); // Simplified type for mock

    const filteredCompanies = selectedFund === "All Funds"
        ? COMPANIES
        : COMPANIES.filter(c => c.funds.includes(selectedFund));

    const handleCreateNew = () => {
        setSelectedCompany(null);
        setIsCreateModalOpen(true);
    };

    const handleEditCompany = (company: any) => {
        // Map mock data to modal format if needed, simplistic matching here
        setSelectedCompany({
            id: company.id,
            name: company.name,
            category: company.category || "AI", // Default for mock
            country: company.country === "USA" ? "US" : company.country === "Israel" ? "IL" : company.country,
            oneLiner: company.oneLiner || "",
            // Other fields blank for mock
            documents: []
        });
        setIsCreateModalOpen(true);
    };

    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <CompanyCreationModal
                checkIfOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialData={selectedCompany}
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
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/companies/${company.id}`} className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-muted-foreground font-bold border border-gray-200">
                                                {company.name.charAt(0)}
                                            </div>
                                            {company.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${company.status === 'Active' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{company.industry}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{company.country}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{company.stage}</td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(company.invested)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{company.ownership}</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEditCompany(company)}
                                            className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                                            title="Edit Company Details"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <Link href={`/companies/${company.id}`} className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100">
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
