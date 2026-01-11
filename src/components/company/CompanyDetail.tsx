"use client";

import { Calendar, DollarSign, Users, Plus, TrendingUp, FileText, X, StickyNote, Trash2, RefreshCw, Pencil } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogRoundModal } from "../dashboard/LogRoundModal";
import { SAFEConversionModal } from "../dashboard/SAFEConversionModal";
import { NotesManager, Note } from "../shared/NotesManager";
import { deleteRound, upsertRound, getFunds, convertSafeToEquity, revertSafeToEquity, getEquityTypes, upsertCompany } from "@/app/actions";
import { calculateImpliedValue, formatCurrency, formatCompact, safeParseBytes, calculateMOIC } from "@/lib/calculations";
import { CompanyCreationModal, CompanyData } from "../dashboard/CompanyCreationModal";



interface Allocation {
    id: string;
    fundId: string;
    fundName?: string;
    amount: string;
    shares: string;
    ownership: string;
    equityType?: string;
}

interface Round {
    id: string;
    round: string;
    structure?: 'SAFE' | 'Equity';
    date: string;
    rawDate?: string;
    valuation: string;
    pps: string;
    capitalRaised?: string;
    lead: string;
    isLead?: boolean;
    participated?: boolean;
    rSquaredInvestedAmount?: number; // Raw number for calculation
    allocations?: Allocation[];
    hasWarrants?: boolean;
    // SAFE Terms
    valuationCap?: string;

    discount?: string;
    originalSafeTerms?: any;
    // ...
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
    // Helper: Parse currency strings with suffixes (M, K, B) into full numbers
    // This ensures that "120M" becomes "120000000" for editing, avoiding the data corruption issue
    const parseCurrencyString = (val?: string) => {
        if (!val) return '';

        let multiplier = 1;
        let cleanVal = val.replace(/[$,]/g, ''); // Strip standard symbols

        if (cleanVal.toUpperCase().includes('M')) {
            multiplier = 1000000;
            cleanVal = cleanVal.replace(/M/i, '');
        } else if (cleanVal.toUpperCase().includes('K')) {
            multiplier = 1000;
            cleanVal = cleanVal.replace(/K/i, '');
        } else if (cleanVal.toUpperCase().includes('B')) {
            multiplier = 1000000000;
            cleanVal = cleanVal.replace(/B/i, '');
        }

        const num = parseFloat(cleanVal);
        if (isNaN(num)) return '';

        return (num * multiplier).toString();
    };

    return {
        id: round.id,
        roundTerms: {
            date: round.rawDate || round.date,
            structure: round.structure || 'Equity',
            stage: round.round,
            capitalRaised: parseCurrencyString(round.capitalRaised),
            valuation: parseCurrencyString(round.valuation),
            pps: parseCurrencyString(round.pps),
            valuationCap: parseCurrencyString(round.valuationCap),
            discount: round.discount || "", // Discount is usually % string or number, keep as is
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
    funds?: { id: string; name: string }[];
}

export function CompanyDetail({ initialData, funds = [] }: CompanyDetailProps) {
    const router = useRouter();
    const [isLogRoundOpen, setIsLogRoundOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const [editingRoundData, setEditingRoundData] = useState<any>(null);

    // Initialize with Server Data
    const [rounds, setRounds] = useState<Round[]>(initialData?.rounds || []);
    const [notes, setNotes] = useState<Note[]>([]);
    const [availableFunds, setAvailableFunds] = useState<{ id: string, name: string }[]>(funds);
    const [availableEquityTypes, setAvailableEquityTypes] = useState<{ id?: string, name: string }[]>([]);

    // SAFE Conversion State
    const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
    const [conversionRound, setConversionRound] = useState<Round | null>(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSaveCompany = async (data: CompanyData) => {
        const result = await upsertCompany(data);
        if (result.success) {
            setIsEditModalOpen(false);
            router.refresh();
            return true;
        } else {
            alert(result.error || "Failed to save company changes.");
            return false;
        }
    };

    useEffect(() => {
        if (initialData?.rounds) {
            setRounds(initialData.rounds);
        }
    }, [initialData]);

    useEffect(() => {
        getFunds().then(funds => setAvailableFunds(funds));
        getEquityTypes().then(types => setAvailableEquityTypes(types));
    }, []);

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

    const totalRSquaredInvested = rounds.reduce((sum, r) => {
        // Calculate from allocations if available (more accurate/dynamic)
        if (r.allocations && r.allocations.length > 0) {
            const allocSum = r.allocations.reduce((aSum, alloc) => {
                const val = parseFloat(alloc.amount?.replace(/[^0-9.-]+/g, "") || "0");
                return aSum + (isNaN(val) ? 0 : val);
            }, 0);
            return sum + allocSum;
        }
        // Fallback to legacy field
        return sum + (r.rSquaredInvestedAmount || 0);
    }, 0);
    const currentValuation = (() => {
        const latestRound = rounds[0];
        const valStr = latestRound?.valuation;
        const isSafe = latestRound?.structure === 'SAFE' || latestRound?.round.toLowerCase().includes('safe');

        if (!valStr || valStr === '-' || valStr === '0') {
            return isSafe ? "SAFE" : "-";
        }

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

    // Group by Fund AND Instrument Type (Common vs Preferred)
    const fundHoldings: Record<string, {
        fundName: string;
        equityType: string;
        totalShares: number;
        totalCost: number;
        ownership: number;
        instruments: string[];
        impliedValue?: number; // Added for calculation
    }> = {};

    initialData.rounds.forEach((round: any) => { // Assuming initialData.rounds is available
        // Find Allocations
        const allocs = initialData.transactions?.filter((t: any) => t.round_id === round.id) || [];

        allocs.forEach((alloc: any) => {
            const fundId = alloc.funds?.id;
            const fundName = alloc.funds?.name;

            // Determine Equity Type / Key
            // We want to group by Fund AND Round to show the split
            // Use Round Label for the main grouping subtitle
            const roundLabel = round.round || 'Unknown Round';

            // Unique Key combines Fund + Round to ensure separate rows per investment
            const uniqueKey = `${fundId}-${round.id}`;

            if (!fundHoldings[uniqueKey]) {
                fundHoldings[uniqueKey] = {
                    fundName,
                    equityType: roundLabel, // Group Subtitle (e.g. "Series A")
                    totalShares: 0,
                    totalCost: 0,
                    ownership: 0,
                    instruments: []
                };
            }

            // Parse
            const validShares = safeParseBytes(alloc.shares_purchased);
            const validCost = safeParseBytes(alloc.amount_invested);

            fundHoldings[uniqueKey].totalShares += validShares;
            fundHoldings[uniqueKey].totalCost += validCost;

            // Instrument label: Use exact DB value (equity_type) if available
            // fallback to constructed name: "Series A Preferred" or "SAFE"
            // FIX: Access 'equity_type' (snake_case) from raw transaction object, not camelCase
            const dbInstrument = alloc.equity_type;
            const fallbackInstrument = round.structure === 'SAFE' ? 'SAFE' : `${round.round} Preferred`;

            const instrumentLabel = dbInstrument || fallbackInstrument;

            if (!fundHoldings[uniqueKey].instruments.includes(instrumentLabel)) {
                fundHoldings[uniqueKey].instruments.push(instrumentLabel);
            }

            // Accumulate ownership
            // ownership_percentage is number/string in Transaction
            const allocOwnership = parseFloat(alloc.ownership_percentage?.toString() || alloc.ownership || '0');
            if (!isNaN(allocOwnership)) {
                fundHoldings[uniqueKey].ownership += allocOwnership;
            }
        });
    });

    // Convert Map to Array
    const holdingsList = Object.values(fundHoldings).sort((a, b) => a.fundName.localeCompare(b.fundName));

    // Apply Implied Value Calculation using Latest PPS
    // Apply Implied Value Calculation using Latest PPS
    Object.values(fundHoldings).forEach(holding => {
        holding.impliedValue = calculateImpliedValue(holding.totalShares, holding.totalCost, latestPps);
    });

    console.log('[CompanyDetail] Rounds:', rounds);
    console.log('[CompanyDetail] Latest PPS:', latestPps);
    console.log('[CompanyDetail] Fund Holdings:', fundHoldings);
    // ...



    // ... (rest of handlers)

    // Save Handlers
    // Save Handlers
    const handleSaveRound = async (data: any) => {
        if (!initialData?.id) {
            alert("Error: Company ID missing.");
            return false;
        }

        const result = await upsertRound(data, initialData.id);

        if (result.error) {
            alert(result.error);
            return false;
        }

        router.refresh();
        setEditingRoundData(null);
        setIsLogRoundOpen(false);
        return true;
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

    const handleOpenConversion = (e: React.MouseEvent, round: Round) => {
        e.stopPropagation();
        setConversionRound(round);
        setIsConversionModalOpen(true);
    };

} else {
    alert("Conversion failed: " + result.error);
}
    };

const handleRevert = async (e: React.MouseEvent, roundId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to revert this round to SAFE? This will clear all share data.")) return;

    const result = await revertSafeToEquity(roundId);
    if (result.success) {
        router.refresh();
    } else {
        alert("Revert failed: " + result.error);
    }
};

return (
    <div className="flex-1 w-full p-6 md:p-8 flex flex-col gap-8">
        {isLogRoundOpen && (
            <LogRoundModal
                key={editingRoundData?.id || 'new-round'}
                isOpen={isLogRoundOpen}
                onClose={() => {
                    setIsLogRoundOpen(false);
                    setEditingRoundData(null);
                }}
                companyName={companyName}
                onSave={handleSaveRound}
                initialData={editingRoundData || undefined}
                funds={availableFunds}
            />
        )}

        {isConversionModalOpen && conversionRound && (
            <SAFEConversionModal
                isOpen={isConversionModalOpen}
                onClose={() => {
                    setIsConversionModalOpen(false);
                    setConversionRound(null);
                }}

                round={conversionRound}
                onConvert={handleConvertConfirm}
                equityTypes={availableEquityTypes}
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
                    <div className="p-6 overflow-y-auto space-y-4">
                        {(!initialData.documents || initialData.documents.length === 0) ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No documents found for this company.
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {initialData.documents.map((doc: any, idx: number) => (
                                    <DocItem key={idx} name={doc.name} type={doc.type} size={doc.size} url={doc.url} />
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Upload button removed as per user request - use Edit Company to manage docs */}
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



        {/* Edit Company Modal */}
        <CompanyCreationModal
            checkIfOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialData={initialData as any}
            onSave={handleSaveCompany}
        />

        <div className="w-full mx-auto space-y-8">
            {/* Company Header */}
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{companyName}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {companySector && companySector !== '-' ? companySector : ''}
                            {companySector && companySector !== '-' && companyStage && companyStage !== '-' ? ' • ' : ''}
                            {companyStage !== '-' ? companyStage : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-white/50 rounded-full transition-colors"
                            title="Edit Company"
                        >
                            <Pencil size={20} />
                        </button>
                        <button
                            onClick={() => setIsNotesModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <StickyNote size={16} className="text-muted-foreground" />
                            <span className="hidden sm:inline">Notes</span>
                        </button>
                        <button
                            onClick={() => setIsDocsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <FileText size={16} className="text-muted-foreground" />
                            <span className="hidden sm:inline">Documents</span>
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

                <div className="flex gap-12 border-t border-border pt-6 overflow-x-auto pb-2">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Total Raised</div>
                        <div className="text-2xl font-bold text-foreground font-mono mt-1">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(totalRaised)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Total Shares</div>
                        <div className="text-2xl font-bold text-foreground font-mono mt-1">
                            {new Intl.NumberFormat('en-US').format(
                                Object.values(fundHoldings).reduce((sum, h) => sum + h.totalShares, 0)
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Total Ownership</div>
                        <div className="text-2xl font-bold text-foreground font-mono mt-1">
                            {Object.values(fundHoldings).reduce((sum, h) => sum + h.ownership, 0).toFixed(2)}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Invested (Cost Basis)</div>
                        <div className="text-2xl font-bold text-foreground font-mono mt-1">
                            ${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalRSquaredInvested)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Implied Value</div>
                        <div className="text-2xl font-bold text-foreground font-mono mt-1">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(
                                Object.values(fundHoldings).reduce((sum, h) => sum + (h.impliedValue || 0), 0)
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">MOIC</div>
                        <div className="text-2xl font-bold font-mono mt-1 text-emerald-600">
                            {calculateMOIC(
                                totalRSquaredInvested,
                                Object.values(fundHoldings).reduce((sum, h) => sum + (h.impliedValue || 0), 0)
                            )}
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
                            <th className="px-6 py-3 font-medium text-muted-foreground text-left w-[20%]">Round / Instrument</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground text-right">Ownership</th>
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
                            holdingsList.map((holding, idx) => (
                                <tr key={idx} className="border-b border-border/40 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground">{holding.fundName}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{holding.equityType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {holding.instruments.map((inst, i) => (
                                            <span key={i} className="inline-block px-2 py-0.5 rounded textxs font-medium bg-blue-50 text-blue-700 border border-blue-100 mr-2 mb-1">
                                                {inst}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                        <div>{holding.ownership > 0 ? `${holding.ownership.toFixed(2)}%` : '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground align-top space-y-1">
                                        <div>
                                            {holding.totalShares === 0 && holding.instruments.some(i => i.includes('SAFE'))
                                                ? 'SAFE'
                                                : holding.totalShares.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                        <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(holding.totalCost)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground align-top space-y-1">
                                        <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(holding.impliedValue || 0)}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                        {Object.values(fundHoldings).length > 0 && (
                            <tr className="bg-gray-50/50 font-medium">
                                <td colSpan={4} className="px-6 py-4 text-foreground text-right uppercase text-xs tracking-wider">Total Net Funding</td>
                                <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                                        Object.values(fundHoldings).reduce((sum, h) => sum + h.totalCost, 0)
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-foreground underline decoration-double decoration-gray-300 underline-offset-4">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                                        Object.values(fundHoldings).reduce((sum, h) => sum + (h.impliedValue || 0), 0)
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
                                // New SAFE Props
                                valuationCap={round.valuationCap}
                                discount={round.discount}
                                id={round.id}
                                structure={round.structure}
                                onConvertRequest={(e) => handleOpenConversion(e, round)}
                                originalSafeTerms={round.originalSafeTerms}
                                onRevertRequest={(e) => handleRevert(e, round.id)}
                                rSquaredInvested={round.rSquaredInvestedAmount}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
}

function DocItem({ name, type, size, url }: { name: string; type: string; size: string; url?: string }) {
    if (!url) {
        // Fallback for missing URLs
        return (
            <li className="flex items-center justify-between p-1.5 rounded bg-gray-50 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-2">
                    <FileText size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>{size}</span>
                </div>
            </li>
        );
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
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
        </a>
    )
}

function RoundEventRow({ round, date, valuation, amountRaised, pps, participated, onDelete, valuationCap, discount, id, structure, onConvertRequest, originalSafeTerms, onRevertRequest, rSquaredInvested }: {
    round: string;
    date: string;
    valuation: string;
    amountRaised?: string;
    pps: string;
    participated?: boolean,
    onDelete?: (e: React.MouseEvent) => void,
    valuationCap?: string,
    discount?: string,
    id?: string,
    structure?: string,
    onConvertRequest?: (e: React.MouseEvent, round: Round) => void,
    onRevertRequest?: (e: React.MouseEvent, roundId: string) => void,

    originalSafeTerms?: any,
    rSquaredInvested?: number
}) {
    const formatCurrencyDisplay = (val: string, type: 'compact' | 'standard' = 'standard') => {
        if (!val || val === '-') return '-';
        const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));

        // Return '-' for 0 or NaN to avoid "$0.00" on unpriced rounds
        if (isNaN(num) || num === 0) return '-';

        return type === 'compact' ? formatCompact(num) : formatCurrency(num, { maximumFractionDigits: 4 });
    };

    const isSafe = structure === 'SAFE' || round.toLowerCase().includes('safe');

    return (
        <div className={`px-6 py-4 flex items-center justify-between transition-colors cursor-pointer group ${participated ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-gray-50/50'}`}>
            <div className="flex items-center gap-6">
                <div className="w-40">
                    <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {round}
                        <span className="ml-2 text-[9px] text-muted-foreground font-mono bg-gray-100 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity" title={id}>
                            #{id ? id.slice(0, 4) : '???'}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                </div>

                <div className="w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Raised</div>
                    <div className="font-mono text-sm text-foreground">{amountRaised ? formatCurrencyDisplay(amountRaised, 'compact') : '-'}</div>
                </div>

                {isSafe ? (
                    // SAFE VIEW: Merged Column or replacing Val/PPS
                    <div className="w-48">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">SAFE Terms</div>
                        <div className="font-mono text-xs text-foreground flex flex-col">
                            <span>{valuationCap ? `Cap: ${formatCurrencyDisplay(valuationCap, 'compact')}` : 'Uncapped'}</span>
                            {discount && discount !== '0' && <span className="text-muted-foreground">Discount: {discount}%</span>}
                        </div>
                    </div>
                ) : (
                    // STANDARD VIEW
                    <>
                        <div className="w-24">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                Valuation
                                {originalSafeTerms && (
                                    <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded-full font-medium" title="Converted from SAFE">
                                        CVT
                                    </span>
                                )}
                            </div>
                            <div className="font-mono text-sm text-foreground">{formatCurrencyDisplay(valuation, 'compact')}</div>
                        </div>

                        <div className="w-24">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">PPS</div>
                            <div className="font-mono text-sm text-foreground">{formatCurrencyDisplay(pps, 'standard')}</div>
                        </div>
                    </>
                )}

                {/* R-Squared Invested Column (Replaces Badge) */}
                <div className="w-32 text-left">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">R-Squared</div>
                    <div className={`font-mono text-sm ${rSquaredInvested && rSquaredInvested > 0 ? 'text-emerald-700 font-semibold' : 'text-gray-300'}`}>
                        {rSquaredInvested && rSquaredInvested > 0 ? formatCompact(rSquaredInvested) : '—'}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* SAFE Conversion Buttons */}
                    <div className="flex gap-2">
                        {isSafe && !originalSafeTerms && onConvertRequest && (
                            <button
                                onClick={(e) => onConvertRequest(e, {
                                    id: id || '',
                                    round,
                                    date,
                                    valuation,
                                    pps,
                                    documents: [],
                                    structure: structure as any,
                                    valuationCap,
                                    discount,
                                    originalSafeTerms,
                                    lead: '',
                                    capitalRaised: amountRaised
                                } as Round)}
                                className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5"
                            >
                                <RefreshCw size={12} className="opacity-80" /> Convert
                            </button>
                        )}

                        {originalSafeTerms && onRevertRequest && id && (
                            <button
                                onClick={(e) => onRevertRequest(e, id)}
                                className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1"
                                title="Revert to SAFE"
                            >
                                <RefreshCw size={10} /> Revert
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-4">
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div >
    )
}

