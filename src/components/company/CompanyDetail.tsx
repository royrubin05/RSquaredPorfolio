"use client";

import { Calendar, DollarSign, Users, Plus, TrendingUp, FileText, X, StickyNote, Trash2 } from "lucide-react";
import { deleteRound, upsertRound } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogRoundModal } from "../dashboard/LogRoundModal";
import { NotesManager, Note } from "../shared/NotesManager";


interface Allocation {
    id: string;
    fundId: string;
    amount: string;
    shares: string;
    ownership: string;
}

interface Round {
    id: string;
    round: string;
    date: string;
    valuation: string;
    pps: string;
    capitalRaised?: string;
    lead: string;
    isLead?: boolean;
    participated?: boolean;
    rSquaredInvestedAmount?: number; // Raw number for calculation
    allocations?: Allocation[];
    hasWarrants?: boolean;
    warrantTerms?: {
        coverage: string;
        coverageType?: 'money' | 'percentage';
        expirationDate: string;
    };
    documents: { id?: string; name: string; type: string; size: string }[];
}

const INITIAL_ROUNDS: Round[] = [
    {
        id: "series-b",
        round: "Series B",
        date: "Oct 2024",
        valuation: "$120M",
        pps: "$2.00",
        capitalRaised: "$15M",
        lead: "Insight Partners",
        documents: [
            { name: "Series B Term Sheet", type: "PDF", size: "1.2 MB" },
            { name: "Amended COI", type: "PDF", size: "2.1 MB" },
            { name: "Fully Diluted Cap Table", type: "XLSX", size: "450 KB" }
        ]
    },
    {
        id: "series-a",
        round: "Series A",
        date: "Feb 2023",
        valuation: "$45M",
        pps: "$0.85",
        capitalRaised: "$8M",
        lead: "Index Ventures",
        participated: true,
        rSquaredInvestedAmount: 1200000, // $1.2M
        allocations: [
            { id: "alloc-a-1", fundId: "Fund I", amount: "1,200,000", shares: "1,411,764", ownership: "2.6" }
        ],
        documents: [
            { name: "Series A Term Sheet", type: "PDF", size: "150 KB" },
            { name: "Pro Forma Cap Table", type: "XLSX", size: "320 KB" }
        ]
    },
    {
        id: "seed",
        round: "Seed",
        date: "Jan 2022",
        valuation: "$12M",
        pps: "$0.25",
        capitalRaised: "$2.5M",
        lead: "R² Capital",
        isLead: true,
        participated: true,
        rSquaredInvestedAmount: 2500000, // $2.5M
        allocations: [
            { id: "alloc-seed-1", fundId: "Fund I", amount: "2,500,000", shares: "10,000,000", ownership: "20.8" }
        ],
        documents: [
            { name: "Seed Term Sheet", type: "PDF", size: "120 KB" },
            { name: "SAFE Agreement", type: "PDF", size: "85 KB" }
        ]
    }
];

// Helper to map Round to LogRoundModal initialData structure
// Note: This is a best-effort mapping since Round is flatter than LogRoundModal state
const mapRoundToModalData = (round: Round) => {
    // Helper to strip non-numeric characters for simple fields if needed, 
    // but handleCurrencyChange handles commas. We mostly want to strip '$' and maybe 'M' if we can expands it, 
    // but for now let's just strip the '$' so it doesn't duplicate in the input.
    // However, '15M' needs to remain '15M' if the field expects it?
    // Wait, handleCurrencyChange regex `replace(/,/g, '')` then checks `!isNaN(Number(rawValue))`.
    // So '15M' is invalid. The modal expects pure numbers.
    // If the data is "$15M", we can't easily edit it without parsing "M".
    // For now, I will just strip '$' so at least the visual double-$ is fixed. 
    // If it contains "M", user might need to re-enter or we need better parsing.
    // I'll strip '$' and ',' to be safe for initialization.
    const stripCurrency = (val?: string) => val ? val.replace(/[$,]/g, '') : '';

    return {
        id: round.id,
        roundTerms: {
            date: round.date,
            stage: round.round,
            valuation: stripCurrency(round.valuation), // Strip $ to avoid double $ in input
            pps: stripCurrency(round.pps),
            capitalRaised: stripCurrency(round.capitalRaised),
            // Ensure documents have IDs to fix key warning
            documents: (round.documents || []).map(d => ({
                ...d,
                id: d.id || Math.random().toString(36).substr(2, 9)
            }))
        },
        syndicate: {
            leads: round.lead ? [round.lead] : []
        },
        position: {
            participated: round.participated ?? false,
            allocations: round.allocations || [],
            hasWarrants: round.hasWarrants || false,
            warrantCoverage: round.warrantTerms?.coverage || "",
            warrantCoverageType: round.warrantTerms?.coverageType || 'percentage',
            warrantExpiration: round.warrantTerms?.expirationDate || ""
        }
    };
};

// ... imports

interface CompanyDetailProps {
    initialData: any; // Typed as any for now to match flexible return, specifically { ...company, rounds: Round[] }
}

export function CompanyDetail({ initialData }: CompanyDetailProps) {
    const router = useRouter();
    const [isLogRoundOpen, setIsLogRoundOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const [editingRoundData, setEditingRoundData] = useState<any>(null);

    // Initialize with Server Data
    const [rounds, setRounds] = useState<Round[]>(initialData?.rounds || []);
    const [notes, setNotes] = useState<Note[]>([]);

    // Sync state with server data on refresh
    useEffect(() => {
        if (initialData?.rounds) {
            setRounds(initialData.rounds);
        }
    }, [initialData]);

    // Derived Metrics
    const totalRaised = rounds.reduce((sum, r) => {
        let val = r.capitalRaised?.replace(/[$,]/g, '') || '0';
        let multiplier = 1;
        if (val.includes('M')) {
            multiplier = 1000000;
            val = val.replace('M', '');
        } else if (val.includes('K')) {
            multiplier = 1000;
            val = val.replace('K', '');
        }
        return sum + (parseFloat(val) * multiplier);
    }, 0);

    const totalRSquaredInvested = rounds.reduce((sum, r) => sum + (r.rSquaredInvestedAmount || 0), 0);
    const currentValuation = (() => {
        const valStr = rounds[0]?.valuation;
        if (!valStr) return "-";

        // Remove currency symbols and commas if present
        const valNum = parseFloat(valStr.replace(/[^0-9.-]+/g, ""));
        if (isNaN(valNum)) return valStr;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: "compact",
            maximumFractionDigits: 1
        }).format(valNum);
    })();
    const companyName = initialData?.name || "Unknown Company";
    const companySector = initialData?.sector || "-";
    const companyStage = rounds[0]?.round || "-"; // Derived from latest round

    // ... FundHoldings calculation (same as before) ...
    // Calculate Latest PPS for Implied Value
    const latestPpsRaw = rounds[0]?.pps;
    const latestPps = latestPpsRaw ? parseFloat(latestPpsRaw.replace(/[^0-9.-]+/g, "")) : 0;

    const fundHoldings = rounds.reduce((acc, round) => {
        if (!round.participated || !round.allocations) return acc;
        round.allocations.forEach(alloc => {
            const fundId = alloc.fundId || "Unknown Fund";
            if (!acc[fundId]) {
                acc[fundId] = { fundId, instruments: [], totalShares: 0, totalCost: 0, impliedValue: 0 };
            }
            const sharesMs = parseFloat(alloc.shares?.replace(/,/g, '') || '0');
            const costMs = parseFloat(alloc.amount?.replace(/[$,]/g, '') || '0');

            const validShares = isNaN(sharesMs) ? 0 : sharesMs;
            const validCost = isNaN(costMs) ? 0 : costMs;

            acc[fundId].totalShares += validShares;
            acc[fundId].totalCost += validCost;

            // Implied Value = Total Shares * Latest Round PPS
            // Note: This updates incrementally, but works because we multiply totalShares at the end, 
            // OR we update it here iteratively? No, iteratively is wrong if PPS differs per round.
            // We must set impliedValue based on FINAL totalShares.
            // So we just accumulate Shares here.

            const instrumentLabel = round.round.includes('SAFE') ? `SAFE (${round.round})` : `Preferred Equity (${round.round})`;
            if (!acc[fundId].instruments.includes(instrumentLabel)) {
                acc[fundId].instruments.push(instrumentLabel);
            }
        });
        return acc;
    }, {} as Record<string, { fundId: string, instruments: string[], totalShares: number, totalCost: number, impliedValue: number }>);

    // Apply Implied Value Calculation using Latest PPS
    Object.values(fundHoldings).forEach(holding => {
        holding.impliedValue = holding.totalShares * (isNaN(latestPps) ? 0 : latestPps);
    });
    // ...



    // ... (rest of handlers)

    // Save Handlers
    // Save Handlers
    const handleSaveRound = async (data: any) => {
        // Optimistic update or just wait for server?
        // Let's wait for server for robust data consistency.

        if (!initialData?.id) {
            alert("Error: Company ID missing.");
            return;
        }

        const result = await upsertRound(data, initialData.id);

        if (result.error) {
            alert(result.error);
            return;
        }

        router.refresh();
        setEditingRoundData(null);
        setIsLogRoundOpen(false);
    };

    const handleDeleteRound = async (e: React.MouseEvent, roundId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this round?")) return;

        const result = await deleteRound(roundId);
        if (result.error) {
            alert("Error deleting round: " + result.error);
        } else {
            setRounds(prev => prev.filter(r => r.id !== roundId));
            router.refresh();
        }
    };

    const handleOpenNewRound = () => {
        setEditingRoundData(null); // Ensure clean state for new round
        setIsLogRoundOpen(true);
    };

    const handleRowClick = (round: Round) => {
        const modalData = mapRoundToModalData(round);
        setEditingRoundData(modalData);
        setIsLogRoundOpen(true);
    };

    const handleNotesChange = (newNotes: Note[]) => {
        setNotes(newNotes);

    };

    return (
        <div className="flex-1 w-full p-6 md:p-8 flex flex-col gap-8">
            {isLogRoundOpen && (
                <LogRoundModal
                    checkIfOpen={isLogRoundOpen}
                    onClose={() => {
                        setIsLogRoundOpen(false);
                        setEditingRoundData(null);
                    }}
                    companyName={companyName}
                    onSave={handleSaveRound}
                    initialData={editingRoundData}
                />
            )}
            {/* Documents Modal */}
            {isDocsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-[600px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-foreground">Company Documents</h3>
                            <button onClick={() => setIsDocsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-8">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">General Resources</h4>
                                <ul className="space-y-2">
                                    <DocItem name="Investor Deck (Oct 2024)" type="PDF" size="12 MB" />
                                    <DocItem name="Company One-Pager" type="PDF" size="1.2 MB" />
                                    <DocItem name="Brand Assets" type="ZIP" size="45 MB" />
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financing Documents</h4>
                                <div className="space-y-4">
                                    {rounds.map((round) => (
                                        <div key={round.id}>
                                            <div className="text-xs font-medium text-foreground mb-1">{round.round} ({round.date})</div>
                                            <ul className="space-y-2 border-l-2 border-border pl-3">
                                                {round.documents.map((doc, idx) => (
                                                    <DocItem key={idx} name={doc.name} type={doc.type} size={doc.size} />
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => alert("Document upload integration coming in next sprint.")}
                                className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                            >
                                <Plus size={14} /> Upload New Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {isNotesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-[600px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-foreground">Company Notes</h3>
                            <button onClick={() => setIsNotesModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <NotesManager notes={notes} onNotesChange={handleNotesChange} />
                        </div>
                    </div>
                </div>
            )}



            <div className="w-full mx-auto space-y-8">
                {/* Company Header */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{companyName}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{companySector} • {companyStage}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsNotesModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <StickyNote size={16} className="text-muted-foreground" />
                                <span>Notes</span>
                            </button>
                            <button
                                onClick={() => setIsDocsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <FileText size={16} className="text-muted-foreground" />
                                <span>Documents</span>
                            </button>
                            <button
                                onClick={handleOpenNewRound}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                <span>Log Round</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-16 border-t border-border pt-6">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Total Raised</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">
                                ${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalRaised)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Current Valuation</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">{currentValuation}</div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">R-Squared Invested (across all vehicles)</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">
                                ${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalRSquaredInvested)}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Warrants Alert Card */}
            {rounds.some(r => r.hasWarrants) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-full text-amber-700 mt-0.5">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-amber-900">Active Warrants</h3>
                            <div className="mt-1 space-y-1">
                                {rounds.filter(r => r.hasWarrants).map(r => (
                                    <div key={r.id} className="text-sm text-amber-800 flex items-center gap-2">
                                        <span className="font-medium">{r.round}:</span>
                                        <span>
                                            {r.warrantTerms?.coverageType === 'money' ? '$' : ''}
                                            {new Intl.NumberFormat('en-US').format(parseFloat(r.warrantTerms?.coverage || '0'))}
                                            {r.warrantTerms?.coverageType === 'percentage' ? '%' : ''} coverage
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">Next Expiration</div>
                        <div className="text-sm font-mono font-bold text-amber-900 mt-0.5">
                            {new Date(rounds.filter(r => r.hasWarrants && r.warrantTerms?.expirationDate).sort((a, b) => new Date(a.warrantTerms!.expirationDate).getTime() - new Date(b.warrantTerms!.expirationDate).getTime())[0]?.warrantTerms?.expirationDate || "").toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* Cap Table - Full Width */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">Holdings by Fund</h3>
                        <span className="text-xs text-muted-foreground">Equity & SAFE Exposure</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-6 py-3 font-medium text-muted-foreground w-[15%]">Fund</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-left w-[25%]">Instrument</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Shares / Principal</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Cost Basis</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Implied Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {Object.values(fundHoldings).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No active holdings recorded.
                                    </td>
                                </tr>
                            ) : (
                                Object.values(fundHoldings).map((holding) => (
                                    <tr key={holding.fundId}>
                                        <td className="px-6 py-4 text-foreground font-medium align-top">{holding.fundId}</td>
                                        <td className="px-6 py-4 align-top space-y-1">
                                            {holding.instruments.map((inst, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${inst.includes('SAFE') ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                                                    {inst}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground align-top space-y-1">
                                            <div>{holding.totalShares.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                            <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(holding.totalCost)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                            <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(holding.impliedValue)}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {Object.values(fundHoldings).length > 0 && (
                                <tr className="bg-gray-50/50 font-medium">
                                    <td colSpan={3} className="px-6 py-4 text-foreground text-right uppercase text-xs tracking-wider">Total Net Funding</td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                                            Object.values(fundHoldings).reduce((sum, h) => sum + h.totalCost, 0)
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                                            Object.values(fundHoldings).reduce((sum, h) => sum + h.impliedValue, 0)
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Financing History - Full Width */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                        <h3 className="text-sm font-medium text-foreground">Financing History</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {rounds.map((round) => (
                            <div key={round.id} onClick={() => handleRowClick(round)}>
                                <RoundEventRow
                                    round={round.round}
                                    date={round.date}
                                    valuation={round.valuation}
                                    amountRaised={round.capitalRaised}
                                    pps={round.pps}
                                    participated={round.participated}
                                    onDelete={(e) => handleDeleteRound(e, round.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocItem({ name, type, size }: { name: string; type: string; size: string }) {
    return (
        <li className="flex items-center justify-between group cursor-pointer p-1.5 rounded hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
                <FileText size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-foreground group-hover:underline decoration-border underline-offset-2">{name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 px-1 rounded">{type}</span>
                <span>{size}</span>
            </div>
        </li>
    )
}

function RoundEventRow({ round, date, valuation, amountRaised, pps, participated, onDelete }: { round: string; date: string; valuation: string; amountRaised?: string; pps: string; participated?: boolean, onDelete?: (e: React.MouseEvent) => void }) {
    const formatCurrency = (val: string, type: 'compact' | 'standard' = 'standard') => {
        if (!val || val === '-') return '-';
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        if (isNaN(num)) return val;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: type === 'compact' ? 'compact' : 'standard',
            maximumFractionDigits: type === 'compact' ? 1 : 4
        }).format(num);
    };

    return (
        <div className={`px-6 py-4 flex items-center justify-between transition-colors cursor-pointer group ${participated ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-gray-50/50'}`}>
            <div className="flex items-center gap-6">
                <div className="w-32">
                    <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{round}</div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Raised</div>
                    <div className="font-mono text-sm text-foreground">{amountRaised ? formatCurrency(amountRaised, 'compact') : '-'}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Valuation</div>
                    <div className="font-mono text-sm text-foreground">{formatCurrency(valuation, 'compact')}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">PPS</div>
                    <div className="font-mono text-sm text-foreground">{formatCurrency(pps, 'standard')}</div>
                </div>

                {/* Participation Badge - Artistic */}
                <div className="w-40 flex items-center">
                    {participated && (
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-emerald-400/20 uppercase tracking-wide whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                            R-Squared Invested
                        </span>
                    )}
                </div>

            </div>

            {/* Right side spacer or future actions */}
            <div className="flex items-center gap-4">
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        title="Delete Round"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div >
    )
}

