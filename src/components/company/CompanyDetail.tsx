"use client";

import { Calendar, DollarSign, Users, Plus, TrendingUp, FileText, X, StickyNote } from "lucide-react";
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

export function CompanyDetail() {
    const [isLogRoundOpen, setIsLogRoundOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const [editingRoundData, setEditingRoundData] = useState<any>(null); // For LogRoundModal initialData

    // State for Rounds and Notes
    const [rounds, setRounds] = useState<Round[]>(INITIAL_ROUNDS);
    const [notes, setNotes] = useState<Note[]>([]);

    // Derived Metrics
    const totalRaised = rounds.reduce((sum, r) => {
        // Parse "15M", "$15,000", etc. Simplified parser for now.
        // Assuming mock data has 'M' suffix or plain numbers.
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

    // Dynamic Holdings by Fund Calculation
    const fundHoldings = rounds.reduce((acc, round) => {
        if (!round.participated || !round.allocations) return acc;

        round.allocations.forEach(alloc => {
            const fundId = alloc.fundId || "Unknown Fund";
            if (!acc[fundId]) {
                acc[fundId] = {
                    fundId,
                    instruments: [],
                    totalShares: 0,
                    totalCost: 0,
                    impliedValue: 0 // Placeholder logic for now, could be same as cost or updated by latest PPS
                };
            }

            // Clean number parsing
            const sharesMs = parseFloat(alloc.shares?.replace(/,/g, '') || '0');
            const costMs = parseFloat(alloc.amount?.replace(/[$,]/g, '') || '0');

            acc[fundId].totalShares += isNaN(sharesMs) ? 0 : sharesMs;
            acc[fundId].totalCost += isNaN(costMs) ? 0 : costMs;

            // Instrument Label logic
            const instrumentLabel = round.round.includes('SAFE') ? `SAFE (${round.round})` : `Preferred Equity (${round.round})`;
            if (!acc[fundId].instruments.includes(instrumentLabel)) {
                acc[fundId].instruments.push(instrumentLabel);
            }
        });
        return acc;
    }, {} as Record<string, { fundId: string, instruments: string[], totalShares: number, totalCost: number, impliedValue: number }>);

    const holdingsList = Object.values(fundHoldings);

    // Latest Valuation (Assuming first in array is latest or we pick max)
    // Actually INITIAL_ROUNDS are ordered max to min date usually.
    // Let's take the first round's valuation.
    const currentValuation = rounds[0]?.valuation || "-";

    // Load from LocalStorage
    useEffect(() => {
        const savedRounds = localStorage.getItem("company_rounds_nimble_types");
        if (savedRounds) setRounds(JSON.parse(savedRounds));

        const savedNotes = localStorage.getItem("company_notes_nimble_types");
        if (savedNotes) setNotes(JSON.parse(savedNotes));
    }, []);

    // Save Handlers
    // Save Handlers
    const handleSaveRound = (data: any) => {
        // If data has an ID, it's an update
        const isUpdate = !!editingRoundData;

        // Calculate R-Squared Investment amount from allocations if participated
        let rSquaredInvested = 0;
        if (data.position?.participated && data.position.allocations) {
            rSquaredInvested = data.position.allocations.reduce((sum: number, alloc: any) => {
                const amount = parseFloat(alloc.amount?.replace(/[$,]/g, '') || '0');
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
        }

        const roundToSave: Round = {
            id: isUpdate ? editingRoundData.id : Math.random().toString(36).substr(2, 9),
            round: data.roundTerms.stage || "New Round",
            date: data.roundTerms.date || new Date().toLocaleDateString(),
            valuation: data.roundTerms.valuation || "-",
            pps: data.roundTerms.pps || "-",
            capitalRaised: data.roundTerms.capitalRaised || "-",
            lead: data.syndicate.leads[0] || "Unknown",
            documents: data.roundTerms.documents || [],
            participated: data.position?.participated,
            rSquaredInvestedAmount: rSquaredInvested,
            allocations: data.position?.allocations || [],
            hasWarrants: data.position?.hasWarrants,
            warrantTerms: data.position?.hasWarrants ? {
                coverage: data.position.warrantCoverage,
                coverageType: data.position.warrantCoverageType,
                expirationDate: data.position.warrantExpiration
            } : undefined
        };

        let updatedRounds;
        if (isUpdate) {
            updatedRounds = rounds.map(r => r.id === roundToSave.id ? roundToSave : r);
        } else {
            updatedRounds = [roundToSave, ...rounds];
        }

        setRounds(updatedRounds);
        localStorage.setItem("company_rounds_nimble_types", JSON.stringify(updatedRounds));

        // Reset and close
        setEditingRoundData(null);
        setIsLogRoundOpen(false);
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
        localStorage.setItem("company_notes_nimble_types", JSON.stringify(newNotes));
    };

    return (
        <div className="flex-1 w-full p-6 md:p-8">
            {isLogRoundOpen && (
                <LogRoundModal
                    checkIfOpen={isLogRoundOpen}
                    onClose={() => {
                        setIsLogRoundOpen(false);
                        setEditingRoundData(null);
                    }}
                    companyName="Nimble Types"
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
                            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Nimble Types</h1>
                            <p className="text-sm text-muted-foreground mt-1">Generative AI for Legal Tech • Series B</p>
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
                <div className="my-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start justify-between shadow-sm">
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
                            <tr>
                                <td className="px-6 py-4 text-foreground font-medium align-top">Fund I</td>
                                <td className="px-6 py-4 align-top space-y-1">
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Preferred Equity (Ser A)</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> SAFE (Pre-Seed)</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-muted-foreground align-top space-y-1">
                                    <div>1,250,000</div>
                                    <div>$100k (Cap $8M)</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                    <div>$400,000</div>
                                    <div>$100,000</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                    <div>$2,500,000</div>
                                    <div>$450,000</div>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-foreground font-medium align-top">Fund II</td>
                                <td className="px-6 py-4 align-top space-y-1">
                                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Preferred Equity (Ser B)</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-muted-foreground align-top space-y-1">
                                    <div>4,500,000</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                    <div>$3,200,000</div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                    <div>$9,000,000</div>
                                </td>
                            </tr>
                            <tr className="bg-gray-50/50 font-medium">
                                <td colSpan={3} className="px-6 py-4 text-foreground text-right uppercase text-xs tracking-wider">Total Net Funding</td>
                                <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">$3,700,000</td>
                                <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">$11,950,000</td>
                            </tr>
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

function RoundEventRow({ round, date, valuation, amountRaised, pps, participated }: { round: string; date: string; valuation: string; amountRaised?: string; pps: string; participated?: boolean }) {
    return (
        <div className={`px-6 py-4 flex items-center justify-between transition-colors cursor-pointer group ${participated ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-gray-50/50'}`}>
            <div className="flex items-center gap-6">
                <div className="w-32">
                    <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{round}</div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Raised</div>
                    <div className="font-mono text-sm text-foreground">{amountRaised || '-'}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Valuation</div>
                    <div className="font-mono text-sm text-foreground">{valuation}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">PPS</div>
                    <div className="font-mono text-sm text-foreground">{pps}</div>
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
            </div>
        </div >
    )
}

