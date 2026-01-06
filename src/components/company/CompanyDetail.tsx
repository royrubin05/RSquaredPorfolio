"use client";

import { Calendar, DollarSign, Users, Plus, TrendingUp, FileText, X } from "lucide-react";
import { useState } from "react";
import { DealModal } from "../dashboard/DealModal";


interface Round {
    id: string;
    round: string;
    date: string;
    valuation: string;
    pps: string;
    lead: string;
    isLead?: boolean;
    documents: { name: string; type: string; size: string }[];
}

const ROUNDS: Round[] = [
    {
        id: "series-b",
        round: "Series B",
        date: "Oct 2024",
        valuation: "$120M",
        pps: "$2.00",
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
        lead: "Index Ventures",
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
        lead: "R² Capital",
        isLead: true,
        documents: [
            { name: "Seed Term Sheet", type: "PDF", size: "120 KB" },
            { name: "SAFE Agreement", type: "PDF", size: "85 KB" }
        ]
    }
];

export function CompanyDetail() {
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [selectedRound, setSelectedRound] = useState<Round | null>(null);

    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <DealModal
                checkIfOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                initialStep={2}
                initialCompany="Nimble Types"
            />
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
                                    {ROUNDS.map((round) => (
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

            {/* Round Detail Modal */}
            {selectedRound && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-foreground">{selectedRound.round} Details</h3>
                            <button onClick={() => setSelectedRound(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Date</div>
                                    <div className="text-sm font-medium text-foreground">{selectedRound.date}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Lead Investor</div>
                                    <div className="text-sm font-medium text-foreground">{selectedRound.lead}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Valuation (Post)</div>
                                    <div className="text-sm font-medium text-foreground font-mono">{selectedRound.valuation}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">PPS</div>
                                    <div className="text-sm font-medium text-foreground font-mono">{selectedRound.pps}</div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-6">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Round Documents</h4>
                                <ul className="space-y-2">
                                    {selectedRound.documents.map((doc, idx) => (
                                        <DocItem key={idx} name={doc.name} type={doc.type} size={doc.size} />
                                    ))}
                                </ul>
                            </div>
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
                                onClick={() => setIsDocsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <FileText size={16} className="text-muted-foreground" />
                                <span>Documents</span>
                            </button>
                            <button
                                onClick={() => setIsDealModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                <span>Log Round</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-16 border-t border-border pt-6">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Total Invested</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">$3.7M</div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Current Value (FMV)</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">$11.5M</div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Growth</div>
                            <div className="text-2xl font-bold text-green-600 font-mono mt-1 flex items-center gap-1">
                                <TrendingUp size={20} />
                                <span>210%</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Ownership</div>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">12.5%</div>
                        </div>
                    </div>
                </div>

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
                            {ROUNDS.map((round) => (
                                <div key={round.id} onClick={() => setSelectedRound(round)}>
                                    <RoundEventRow
                                        round={round.round}
                                        date={round.date}
                                        valuation={round.valuation}
                                        pps={round.pps}
                                        lead={round.lead}
                                        isLead={round.isLead}
                                    />
                                </div>
                            ))}
                        </div>
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

function RoundEventRow({ round, date, valuation, pps, lead, isLead }: { round: string; date: string; valuation: string; pps: string; lead: string; isLead?: boolean }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-6">
                <div className="w-32">
                    <div className="font-semibold text-foreground text-sm">{round}</div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">Premoney: </span>
                    <span className="font-mono text-foreground">{valuation}</span>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">PPS: </span>
                    <span className="font-mono text-foreground">{pps}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Lead Investor</span>

                <span className={`text-sm font-medium px-2 py-1 rounded ${isLead ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-foreground'}`}>
                    {lead}
                </span>
            </div >
        </div >
    )
}
