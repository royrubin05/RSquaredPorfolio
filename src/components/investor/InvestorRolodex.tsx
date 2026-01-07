"use client";

import { Search, Mail, ExternalLink, Users, Plus, X, Globe, MapPin } from "lucide-react";
import { useState } from "react";

import { MOCK_INVESTORS } from "../../lib/constants";

// Mock Data
const INITIAL_INVESTORS = MOCK_INVESTORS;

export function InvestorRolodex() {
    const [investors, setInvestors] = useState(INITIAL_INVESTORS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredInvestors = investors.filter(inv =>
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddInvestor = (newInvestor: any) => {
        setInvestors([...investors, { ...newInvestor, id: Date.now(), coInvestments: 0 }]);
        setIsAddModalOpen(false);
    };

    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <AddInvestorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddInvestor}
            />

            <div className="w-full mx-auto">
                {/* Page Header */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Co-Investors</h1>
                        <p className="text-sm text-muted-foreground mt-1">Co-investors and syndicate partners.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Add Investor</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search investors..."
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
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Investor</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Type</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Co-Investments</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Contact</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
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
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${inv.type === 'VC' ? 'bg-blue-50 border-blue-100 text-blue-700' : inv.type === 'Angel' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                            {inv.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users size={14} />
                                            <span>{inv.coInvestments} deals</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail size={14} />
                                            <a href={`mailto:${inv.contact}`} className="hover:text-primary hover:underline transition-colors">{inv.contact}</a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {inv.website && (
                                            <a
                                                href={`https://${inv.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-xs font-medium"
                                            >
                                                Website <ExternalLink size={12} />
                                            </a>
                                        )}
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

function AddInvestorModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
    const [formData, setFormData] = useState({ name: '', type: 'VC', website: '', contact: '' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-foreground">Add New Investor</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Firm / Investor Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Lightspeed Venture Partners"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Type</label>
                            <select
                                className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="VC">Venture Capital</option>
                                <option value="Angel">Angel Investor</option>
                                <option value="CVC">Corporate VC</option>
                                <option value="PE">Private Equity</option>
                                <option value="Family Office">Family Office</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Website</label>
                            <div className="relative">
                                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="example.com"
                                    className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Primary Contact Email</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="partners@firm.com"
                                className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                    <button
                        onClick={() => {
                            onSave(formData);
                            setFormData({ name: '', type: 'VC', website: '', contact: '' });
                        }}
                        disabled={!formData.name}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Plus size={16} />
                        <span>Add Investor</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
