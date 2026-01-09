"use client";

import { useState } from "react";
import { Plus, Briefcase, Edit, Trash2, Layers, Check, AlertCircle, X } from "lucide-react";
import { FundModal, FundData } from "./FundModal";
import { upsertFund, deleteFund } from "@/app/actions";

interface FundsListProps {
    funds: any[]; // Extended Fund Data
}

export function FundsList({ funds: initialFunds }: FundsListProps) {
    const [funds, setFunds] = useState(initialFunds);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFund, setSelectedFund] = useState<FundData | null>(null);

    // Safe Currency Formatter
    const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode || 'USD',
                notation: 'compact'
            }).format(amount);
        } catch (e) {
            // Fallback for invalid currency codes
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
            }).format(amount);
        }
    };

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fundToDelete, setFundToDelete] = useState<string | null>(null);

    // Status Modals
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Handlers
    const handleCreate = () => {
        setSelectedFund(null);
        setIsModalOpen(true);
    };

    const handleEdit = (fund: any) => {
        setSelectedFund(fund);
        setIsModalOpen(true);
    };

    // Delete Flow
    const initiateDelete = (id: string) => {
        setFundToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!fundToDelete) return;

        const res = await deleteFund(fundToDelete);
        if (res.success) {
            setFunds(prev => prev.filter(f => f.id !== fundToDelete));
            setDeleteModalOpen(false);
            setFundToDelete(null);
        } else {
            setDeleteModalOpen(false);
            setErrorMessage(res.error || "Failed to delete fund.");
            setShowErrorModal(true);
        }
    };

    // Save Flow
    const handleSave = async (data: FundData) => {
        const res = await upsertFund(data);

        // Close the form modal first
        setIsModalOpen(false);

        if (res.success && res.data) {
            setFunds(prev => {
                const exists = prev.find(f => f.id === res.data.id);
                if (exists) {
                    return prev.map(f => f.id === res.data.id ? { ...f, ...res.data } : f);
                } else {
                    return [...prev, res.data];
                }
            });
            // Show Success
            setShowSuccessModal(true);
        } else {
            // Show Error
            setErrorMessage(res.error || "Failed to save fund.");
            setShowErrorModal(true);
            // Re-open modal? Ideally yes, but for now let's just show error.
            // If we want to preserve state we would need to not close modal on error, 
            // but upsertFund is async, so we'd need to handle that inside the modal or pass a promise.
            // For simplicity, we close and show error. User can re-open.
        }
    };

    // Card Component
    const FundCard = ({ fund }: { fund: any }) => {
        // Calculations
        const committed = parseFloat(fund.committed_capital || 0);
        const investable = parseFloat(fund.investable_amount || 0);
        const deployed = parseFloat(fund.deployed_capital || 0);
        const toDeploy = investable - deployed;
        const companyCount = fund.portfolio_count || 0;

        const deployedPct = investable > 0 ? (deployed / investable) * 100 : 0;

        return (
            <div className="group bg-white rounded-xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md overflow-hidden relative">
                {/* Header */}
                <div className="p-5 border-b border-border bg-gray-50/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-foreground">{fund.name}</h3>
                            {fund.vintage && (
                                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-medium">
                                    {fund.vintage}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                            <span>Formed: {fund.formation_date ? new Date(fund.formation_date).toLocaleDateString() : '-'}</span>
                            <span>•</span>
                            <span>{fund.currency}</span>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(fund)} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-white">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => initiateDelete(fund.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-white">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="p-5 grid grid-cols-2 gap-y-6 gap-x-4">
                    {/* AUM */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AUM</p>
                        <p className="text-lg font-semibold mt-0.5">
                            {formatCurrency(committed, fund.currency)}
                        </p>
                    </div>

                    {/* Companies */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Portfolio</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Briefcase size={16} className="text-primary" />
                            <span className="text-lg font-semibold">{companyCount}</span>
                            <span className="text-sm text-muted-foreground">Cos</span>
                        </div>
                    </div>

                    {/* Investable */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Investable</p>
                        <p className="text-lg font-semibold mt-0.5">
                            {formatCurrency(investable, fund.currency)}
                        </p>
                    </div>

                    {/* Deployed */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deployed</p>
                        <p className="text-lg font-semibold mt-0.5 flex items-center gap-2">
                            {formatCurrency(deployed, fund.currency)}
                            <span className="text-xs font-normal text-muted-foreground">({deployedPct.toFixed(0)}%)</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-5 pb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">To Deploy</span>
                        <span className="font-medium">{formatCurrency(toDeploy, fund.currency)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary/80"
                            style={{ width: `${Math.min(deployedPct, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header + Actions */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Funds</h1>
                    <p className="text-muted-foreground">Manage your investment vehicles and capital deployment.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>Create New Fund</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map(fund => (
                    <FundCard key={fund.id} fund={fund} />
                ))}
            </div>

            {/* Empty State */}
            {funds.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
                    <div className="bg-gray-50 p-3 rounded-full inline-block mb-3">
                        <Layers className="text-muted-foreground" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No funds found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Get started by creating your first fund to track specific pools of capital.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="mt-4 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Create Fund
                    </button>
                </div>
            )}

            <FundModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedFund}
                onSave={handleSave}
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
                                <h3 className="text-lg font-semibold text-foreground">Delete Fund</h3>
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
                                Delete Fund
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-8 w-[360px] text-center transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Fund Saved Successfully</h3>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                            The fund details have been updated in your portfolio.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-6 w-[400px] flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Action Failed</h3>
                                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
