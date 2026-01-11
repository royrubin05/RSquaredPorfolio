
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Calculator, AlertCircle, RefreshCw } from 'lucide-react';

interface SAFEConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    round: any;
    onConvert: (data: any) => Promise<void>;
    equityTypes?: { id?: string; name: string }[];
}

export function SAFEConversionModal({ isOpen, onClose, round, onConvert, equityTypes = [] }: SAFEConversionModalProps) {
    const [pps, setPps] = useState('');
    const [shares, setShares] = useState('');
    const [ownership, setOwnership] = useState('');
    const [equityType, setEquityType] = useState('Preferred Equity');

    const [isConverting, setIsConverting] = useState(false);

    // Initial Investment Amount (Sum of all transactions for this round)
    const investedAmount = round.transactions?.reduce((sum: number, t: any) => sum + (Number(t.amount_invested) || 0), 0) || 0;

    useEffect(() => {
        if (isOpen) {
            setPps('');
            setShares('');
            setOwnership('');
            setEquityType(equityTypes.length > 0 ? equityTypes[0].name : 'Preferred Equity');
        }
    }, [isOpen, equityTypes]);

    const handlePpsChange = (val: string) => {
        setPps(val);
        const p = parseFloat(val);
        if (p > 0 && investedAmount > 0) {
            // Recalculate shares
            setShares(Math.floor(investedAmount / p).toString());
        }
    };

    const handleSharesChange = (val: string) => {
        setShares(val);
        const s = parseFloat(val);
        if (s > 0 && investedAmount > 0) {
            // Recalculate PPS (Invested / Shares)
            // Use high precision for PPS
            setPps((investedAmount / s).toFixed(6)); // 6 decimals for precision
        }
    };

    const handleConvert = async () => {
        const ppsNum = parseFloat(pps);
        const sharesNum = parseFloat(shares);

        if (!ppsNum || isNaN(ppsNum)) {
            alert("Please enter a valid Price Per Share.");
            return;
        }

        setIsConverting(true);
        try {
            await onConvert({
                roundId: round.id,
                pps: ppsNum,
                equityType,
                valuation: null, // Removed field as requested/implied simplification
                resultingShares: sharesNum || 0,
                ownership: parseFloat(ownership) || 0
            });
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to convert round.");
        } finally {
            setIsConverting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden border border-border">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-sm text-blue-600">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Convert SAFE to Equity</h3>
                            <p className="text-xs text-blue-600 font-medium mt-0.5">{round.round_label} • {round.close_date}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>
                            This will convert the round structure to <span className="font-bold">Equity</span>.
                            The original SAFE terms (Cap/Discount) will be archived.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Inputs: PPS & Shares & Ownership */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Price Per Share <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={pps}
                                        onChange={e => handlePpsChange(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Total Shares</label>
                                <input
                                    type="number"
                                    value={shares}
                                    onChange={e => handleSharesChange(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Ownership %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={ownership}
                                        onChange={e => setOwnership(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Equity Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Equity Class</label>
                            <select
                                value={equityType}
                                onChange={e => setEquityType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                            >
                                {equityTypes.length > 0 ? (
                                    equityTypes.map(t => (
                                        <option key={t.id || t.name} value={t.name}>{t.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Preferred Equity">Preferred Equity</option>
                                        <option value="Common Equity">Common Equity</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConvert}
                        disabled={isConverting || !shares}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all
                            ${(isConverting || !shares) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95'}
                        `}
                    >
                        {isConverting ? 'Converting...' : 'Confirm'}
                        {!isConverting && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
