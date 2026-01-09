"use client";

import { X, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

export interface FundData {
    id?: string;
    name: string;
    vintage?: string;
    committed_capital: string | number; // AUM
    investable_amount: string | number;
    formation_date: string;
    investment_period_start: string;
    investment_period_end: string;
    currency: string;
}

interface FundModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FundData | null;
    onSave: (data: FundData) => void;
}

export function FundModal({ isOpen, onClose, initialData, onSave }: FundModalProps) {
    // Form State
    const [name, setName] = useState("");
    const [aum, setAum] = useState("");
    const [investable, setInvestable] = useState("");
    const [formationDate, setFormationDate] = useState("");
    const [invPeriodStart, setInvPeriodStart] = useState("");
    const [invPeriodEnd, setInvPeriodEnd] = useState("");
    const [currency, setCurrency] = useState("USD");

    // Helper: Format number with commas
    const formatCurrencyInput = (value: string | number) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);

        // Remove non-numeric chars (except decimal point if needed, but usually AUM is integer)
        const raw = stringValue.replace(/[^0-9]/g, '');
        if (!raw) return '';
        return new Intl.NumberFormat('en-US').format(BigInt(raw));
    };

    const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(formatCurrencyInput(e.target.value));
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                // Format initial values
                setAum(initialData.committed_capital ? formatCurrencyInput(initialData.committed_capital) : "");
                setInvestable(initialData.investable_amount ? formatCurrencyInput(initialData.investable_amount) : "");
                setFormationDate(initialData.formation_date || "");
                setInvPeriodStart(initialData.investment_period_start || "");
                setInvPeriodEnd(initialData.investment_period_end || "");
                setCurrency(initialData.currency || "USD");
            } else {
                // Reset for new fund
                setName("");
                setAum("");
                setInvestable("");
                setFormationDate("");
                setInvPeriodStart("");
                setInvPeriodEnd("");
                setCurrency("USD");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name) {
            alert("Fund Name is required.");
            return;
        }

        // Derive Vintage from Formation Date
        let derivedVintage = "";
        if (formationDate) {
            derivedVintage = new Date(formationDate).getFullYear().toString();
        }

        // Sanitize numbers (remove commas)
        const cleanAum = aum.replace(/,/g, '');
        const cleanInvestable = investable.replace(/,/g, '');

        onSave({
            id: initialData?.id,
            name,
            vintage: derivedVintage,
            committed_capital: cleanAum,
            investable_amount: cleanInvestable,
            formation_date: formationDate,
            investment_period_start: invPeriodStart,
            investment_period_end: invPeriodEnd,
            currency
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {initialData ? 'Edit Fund' : 'Create New Fund'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Set up fund details, capital, and investment period.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Fund Name</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. R-Squared Fund II"
                                value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Capital */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">AUM / Committed Capital</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="10,000,000"
                                    value={aum} onChange={handleCurrencyChange(setAum)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Investable Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="8,000,000"
                                    value={investable} onChange={handleCurrencyChange(setInvestable)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Typically less than AUM (net of fees/reserves).</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Formation Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="date"
                                value={formationDate} onChange={(e) => setFormationDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Used to derive Vintage Year.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Investment Period</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Start</span>
                                <input
                                    type="date"
                                    value={invPeriodStart} onChange={(e) => setInvPeriodStart(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">End</span>
                                <input
                                    type="date"
                                    value={invPeriodEnd} onChange={(e) => setInvPeriodEnd(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-border bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {initialData ? 'Save Changes' : 'Create Fund'}
                    </button>
                </div>
            </div>
        </div>
    );
}
