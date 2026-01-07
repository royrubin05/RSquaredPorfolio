"use client";

import { Search, Plus, X, Tag } from "lucide-react";
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
        (inv.deals && inv.deals.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const handleAddInvestor = (newInvestor: any) => {
        setInvestors([...investors, { ...newInvestor, id: Date.now() }]);
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
                                                inv.deals.map((deal, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {deal}
                                                    </span>
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

function AddInvestorModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
    const [name, setName] = useState('');
    const [dealsStr, setDealsStr] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        const deals = dealsStr.split(',').map(s => s.trim()).filter(Boolean);
        onSave({ name, deals });
        setName('');
        setDealsStr('');
    };

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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Deals (Comma separated)</label>
                        <div className="relative">
                            <Tag size={14} className="absolute left-3 top-3 text-muted-foreground" />
                            <textarea
                                placeholder="e.g. Stripe, Airbnb, Uber"
                                className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                                value={dealsStr}
                                onChange={(e) => setDealsStr(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={!name}
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
