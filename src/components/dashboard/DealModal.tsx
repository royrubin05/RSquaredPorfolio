"use client";

import { X, ChevronRight, Check, Plus } from "lucide-react";
import { useState } from "react";

const INITIAL_ROUND_LABELS = [
    { id: 'pre-seed', name: 'Pre-Seed', order: 1 },
    { id: 'seed', name: 'Seed', order: 2 },
    { id: 'series-a', name: 'Series A', order: 3 },
    { id: 'series-b', name: 'Series B', order: 4 },
    { id: 'series-c', name: 'Series C', order: 5 },
    { id: 'bridge', name: 'Bridge', order: 6 },
    { id: 'safe', name: 'SAFE', order: 7 },
];

interface DealModalProps {
    checkIfOpen: boolean;
    onClose: () => void;
    initialStep?: number;
    initialCompany?: string;
}

export function DealModal({ checkIfOpen, onClose, initialStep = 1, initialCompany = "" }: DealModalProps) {
    const [step, setStep] = useState(initialStep);
    const [participated, setParticipated] = useState(true);

    // Reset state when modal opens/closes or props change
    // Note: In a real app, use useEffect or a key to reset properly
    if (!checkIfOpen) return null;

    const totalSteps = 3;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Log New Deal</h2>
                        <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && <StepCompany initialCompany={initialCompany} />}
                    {step === 2 && <StepDealStructure participated={participated} setParticipated={setParticipated} />}
                    {step === 3 && <StepSyndicate />}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-gray-50/50">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={() => {
                            if (step < totalSteps) setStep(step + 1);
                            else onClose(); // Close on finish
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        {step === totalSteps ? 'Log Deal' : 'Next'}
                        {step < totalSteps && <ChevronRight size={16} />}
                        {step === totalSteps && <Check size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Countries List
const TOP_COUNTRIES = ["United States", "Israel"];
const OTHER_COUNTRIES = ["United Kingdom", "Canada", "Germany", "France", "Singapore", "Sweden", "Switzerland", "Netherlands", "Australia", "South Korea", "Japan", "Brazil", "India"];

function StepCompany({ initialCompany = "" }: { initialCompany?: string }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">1. Select Company</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Company Name</label>
                <div className="relative">
                    <input
                        autoFocus
                        type="text"
                        defaultValue={initialCompany}
                        placeholder="Company Name"
                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                {!initialCompany && (
                    <p className="text-xs text-muted-foreground">Start typing to search. If no match found, you can create a new company.</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Industry</label>
                    <select className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white">
                        <option value="">Select Industry...</option>
                        <option value="AI">Artificial Intelligence</option>
                        <option value="Fintech">Fintech</option>
                        <option value="Security">Cybersecurity</option>
                        <option value="Health">Healthcare</option>
                        <option value="Infra">Infrastructure</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Country</label>
                    <select className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white">
                        <option value="US">United States</option>
                        <option value="IL">Israel</option>
                        <option disabled>──────────</option>
                        {OTHER_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

function StepDealStructure({ participated, setParticipated }: { participated: boolean; setParticipated: (v: boolean) => void }) {
    const [roundType, setRoundType] = useState<'Equity' | 'SAFE'>('Equity');
    const [valType, setValType] = useState<'Pre' | 'Post'>('Post');
    const [hasProRata, setHasProRata] = useState(false);

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">2. Deal Structure</h3>

            {/* Top Row: Participation & Security Type */}
            <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 border border-border rounded-md">
                    <input
                        type="checkbox"
                        id="participated"
                        checked={participated}
                        onChange={(e) => setParticipated(e.target.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="participated" className="text-sm text-foreground font-medium cursor-pointer select-none">
                        We participated
                    </label>
                </div>

                <div className="flex-1 flex bg-gray-100 p-1 rounded-md">
                    <button
                        onClick={() => setRoundType('Equity')}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-sm transition-all ${roundType === 'Equity' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Priced Round
                    </button>
                    <button
                        onClick={() => setRoundType('SAFE')}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-sm transition-all ${roundType === 'SAFE' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        SAFE / Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 divide-x divide-border">

                {/* LEFT COLUMN: Round Definition (Global) */}
                <div className="space-y-4 pr-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Round Terms</h4>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">Round Label</label>
                            <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white">
                                <option value="">Select Round...</option>
                                {INITIAL_ROUND_LABELS.sort((a, b) => a.order - b.order).map(label => (
                                    <option key={label.id} value={label.name}>{label.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">Close Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-border rounded-md text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-muted-foreground">Round Size</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                    <input type="text" placeholder="0.00" className="w-full pl-5 pr-2 py-2 border border-border rounded-md text-sm font-mono" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-muted-foreground">
                                    {roundType === 'Equity' ? 'Post-Money Val' : 'Valuation Cap'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                    <input type="text" placeholder="0.00" className="w-full pl-5 pr-2 py-2 border border-border rounded-md text-sm font-mono" />
                                </div>
                            </div>
                        </div>

                        {roundType === 'Equity' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">PPS</label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                        <input type="text" placeholder="0.000" className="w-full pl-5 pr-2 py-2 border border-border rounded-md text-sm font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">Round Shares</label>
                                    <input type="text" placeholder="0" className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Our Investment (Specific) */}
                <div className="space-y-4 pl-8">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Our Position</h4>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">Invested From Fund</label>
                            <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white">
                                <option>Fund I (Vintage 2020)</option>
                                <option>Fund II (Active)</option>
                                <option>Fund III (Raising)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">Amount Invested</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <input type="text" placeholder="0.00" className="w-full pl-6 pr-4 py-2 border border-border rounded-md text-sm font-bold font-mono text-primary" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-muted-foreground">Shares Purchased</label>
                                <input type="text" placeholder="0" className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-muted-foreground">Ownership %</label>
                                <div className="relative">
                                    <input type="text" placeholder="0.00" className="w-full pl-3 pr-6 py-2 border border-border rounded-md text-sm font-mono bg-gray-50" disabled />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Pro-Rata Rights Toggle (Bottom) */}
                        {participated && (
                            <div className="pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="prorata"
                                        checked={hasProRata}
                                        onChange={(e) => setHasProRata(e.target.checked)}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="prorata" className="text-sm text-foreground cursor-pointer select-none">
                                        Includes Pro-Rata Rights
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StepSyndicate() {
    const [leads, setLeads] = useState<string[]>([]);
    const [coInvestors, setCoInvestors] = useState<string[]>([]);

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">3. Deal Syndicate</h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Lead Investor(s)</label>
                <div className="p-3 border border-border rounded-md bg-white">
                    <InvestorMultiSelect
                        selected={leads}
                        onChange={setLeads}
                        placeholder="Search or add lead investors..."
                    />
                </div>
                <p className="text-xs text-muted-foreground">Who led or priced this round?</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Major Co-Investors</label>
                <div className="p-3 border border-border rounded-md bg-white">
                    <InvestorMultiSelect
                        selected={coInvestors}
                        onChange={setCoInvestors}
                        placeholder="Add other major investors..."
                    />
                </div>
            </div>
        </div>
    )
}

// Helper Component for Multi-Select Investors
function InvestorMultiSelect({ selected, onChange, placeholder }: { selected: string[]; onChange: (v: string[]) => void; placeholder: string }) {
    const [input, setInput] = useState('');

    // Simple mock list for suggestions
    const MOCK_INVESTORS = ["a16z", "Sequoia", "Benchmark", "Founders Fund", "Index Ventures", "Lightspeed", "Accel", "Kleiner Perkins"];
    const suggestions = input ? MOCK_INVESTORS.filter(i => i.toLowerCase().includes(input.toLowerCase()) && !selected.includes(i)) : [];

    const addInvestor = (name: string) => {
        if (name && !selected.includes(name)) {
            onChange([...selected, name]);
            setInput('');
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {selected.map((inv) => (
                <div key={inv} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-medium animate-in fade-in zoom-in duration-200">
                    <span>{inv}</span>
                    <button onClick={() => onChange(selected.filter(s => s !== inv))} className="hover:text-primary/70">
                        <X size={12} />
                    </button>
                </div>
            ))}
            <div className="relative flex-1 min-w-[120px]">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input) {
                            e.preventDefault();
                            addInvestor(input);
                        }
                        if (e.key === 'Backspace' && !input && selected.length > 0) {
                            onChange(selected.slice(0, -1));
                        }
                    }}
                    placeholder={selected.length === 0 ? placeholder : ""}
                    className="w-full text-sm outline-none bg-transparent h-6"
                />
                {/* Suggestions Dropdown */}
                {input && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-border rounded-md shadow-lg z-50 overflow-hidden">
                        {suggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => addInvestor(s)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between group"
                            >
                                <span>{s}</span>
                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-muted-foreground" />
                            </button>
                        ))}
                        <button
                            onClick={() => addInvestor(input)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-muted-foreground border-t border-border italic"
                        >
                            Create "{input}"
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
