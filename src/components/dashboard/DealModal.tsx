"use client";

import { X, ChevronRight, Check, Plus } from "lucide-react";
import { useState } from "react";
import { INITIAL_ROUND_LABELS } from "../../lib/constants";

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
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${step === 1 ? 'bg-blue-100 text-blue-600' : step === 2 ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {step === 1 && <span className="font-bold text-xs">01</span>}
                            {step === 2 && <span className="font-bold text-xs">02</span>}
                            {step === 3 && <span className="font-bold text-xs">03</span>}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground tracking-tight">Log New Deal</h2>
                            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}: <span className="font-medium text-foreground">{step === 1 ? 'Target Company' : step === 2 ? 'Deal Parameters' : 'Syndicate'}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-gray-100 rounded-md">
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
                            className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${step === totalSteps
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-blue-200'
                            }`}
                    >
                        {step === totalSteps ? (participated ? 'Log Deal' : 'Log Market Event') : 'Next Step'}
                        {step < totalSteps && <ChevronRight size={16} />}
                        {step === totalSteps && <Check size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}


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
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                2. Deal Structure
            </h3>

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

            <div className={`grid gap-8 divide-x divide-border ${participated ? 'grid-cols-2' : 'grid-cols-1 divide-none'}`}>

                {/* LEFT COLUMN: Round Definition (Global) */}
                <div className={`space-y-4 ${participated ? 'pr-4' : ''}`}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Round Terms</h4>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">Round Label</label>
                            <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white">
                                <option value="">Select Round...</option>
                                {[...INITIAL_ROUND_LABELS].sort((a, b) => a.order - b.order).map(label => (
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
                                    <input type="text" placeholder={roundType === 'SAFE' ? "No Cap" : "0.00"} className="w-full pl-5 pr-2 py-2 border border-border rounded-md text-sm font-mono" />
                                </div>
                            </div>
                        </div>

                        {roundType === 'Equity' ? (
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
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">Discount</label>
                                    <div className="relative">
                                        <input type="text" placeholder="0" className="w-full pl-3 pr-6 py-2 border border-border rounded-md text-sm font-mono" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {/* Spacer to keep alignment if needed, or remove */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Our Investment (Specific) */}
                {participated && (
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

                            {roundType === 'Equity' ? (
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
                            ) : (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700">
                                    Shares will be calculated automatically upon future equity conversion event.
                                </div>
                            )}

                            {/* Pro-Rata Rights Toggle (Bottom) */}
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StepSyndicate() {
    const [leads, setLeads] = useState<string[]>([]);
    const [coInvestors, setCoInvestors] = useState<string[]>([]);

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                3. Deal Syndicate
            </h3>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Lead Investor(s)</label>
                <div className="p-1">
                    <InvestorMultiSelect
                        selected={leads}
                        onChange={setLeads}
                        placeholder="Who led the round? (e.g. Sequoia)"
                        accentColor="emerald"
                    />
                </div>
                <p className="text-xs text-muted-foreground pl-1">Key signal: Who priced this round?</p>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Major Co-Investors</label>
                <div className="p-1">
                    <InvestorMultiSelect
                        selected={coInvestors}
                        onChange={setCoInvestors}
                        placeholder="Add value-add co-investors..."
                        accentColor="blue"
                    />
                </div>
            </div>
        </div>
    )
}

// Helper Component for Multi-Select Investors
function InvestorMultiSelect({ selected, onChange, placeholder, accentColor = 'primary' }: { selected: string[]; onChange: (v: string[]) => void; placeholder: string; accentColor?: string }) {
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Expanded Mock List
    const MOCK_INVESTORS = [
        "a16z", "Sequoia", "Benchmark", "Founders Fund", "Index Ventures", "Lightspeed", "Accel", "Kleiner Perkins",
        "Greylock", "Khosla Ventures", "Y Combinator", "First Round", "Union Square Ventures", "Bessemer", "General Catalyst",
        "Insight Partners", "Tiger Global", "SoftBank", "Coatue", "Andreessen Horowitz", "Ribbit Capital"
    ].sort();

    const suggestions = input
        ? MOCK_INVESTORS.filter(i => i.toLowerCase().includes(input.toLowerCase()) && !selected.includes(i))
        : MOCK_INVESTORS.filter(i => !selected.includes(i)).slice(0, 5); // Show top 5 recent/popular by default if empty? Or just none. Let's show none for cleaner UI unless typing.

    // Actually, user asked "how does the search work". Let's make it responsive.
    const filteredSuggestions = MOCK_INVESTORS.filter(i =>
        i.toLowerCase().includes(input.toLowerCase()) && !selected.includes(i)
    );

    const addInvestor = (name: string) => {
        if (name && !selected.includes(name)) {
            onChange([...selected, name]);
            setInput('');
            setIsOpen(false);
        }
    };

    const colorStyles = accentColor === 'emerald'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus-within:ring-emerald-500'
        : 'bg-blue-50 text-blue-700 border-blue-200 focus-within:ring-blue-500';

    const chipStyles = accentColor === 'emerald'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-blue-100 text-blue-800 border-blue-200';

    return (
        <div className="relative group">
            <div className={`p-2 flex flex-wrap gap-2 border rounded-md transition-all bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-offset-1 ring-offset-white ${accentColor === 'emerald' ? 'focus-within:ring-emerald-100 border-emerald-200' : 'focus-within:ring-blue-100 border-blue-200'}`}>
                {selected.map((inv) => (
                    <div key={inv} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${chipStyles} animate-in fade-in zoom-in duration-200`}>
                        <span>{inv}</span>
                        <button onClick={() => onChange(selected.filter(s => s !== inv))} className="hover:text-red-600 transition-colors p-0.5 rounded-full hover:bg-black/5">
                            <X size={10} strokeWidth={3} />
                        </button>
                    </div>
                ))}

                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delayed blur to allow clicks
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input) {
                            e.preventDefault();
                            addInvestor(input);
                        }
                        if (e.key === 'Backspace' && !input && selected.length > 0) {
                            onChange(selected.slice(0, -1));
                        }
                        if (e.key === 'Escape') setIsOpen(false);
                    }}
                    placeholder={selected.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] text-sm outline-none bg-transparent h-7 px-1 text-foreground placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (input || filteredSuggestions.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filteredSuggestions.length > 0 && <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">Suggestions</div>}

                        {filteredSuggestions.map(s => (
                            <button
                                key={s}
                                onMouseDown={(e) => { e.preventDefault(); addInvestor(s); }} // Use onMouseDown to prevent blur
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center justify-between group transition-colors"
                            >
                                <span className="font-medium text-foreground">{s}</span>
                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                            </button>
                        ))}

                        {input && !filteredSuggestions.includes(input) && (
                            <button
                                onMouseDown={(e) => { e.preventDefault(); addInvestor(input); }}
                                className="w-full text-left px-3 py-2.5 text-sm rounded-md hover:bg-blue-50 text-blue-600 flex items-center gap-2 border-t border-border mt-1"
                            >
                                <Plus size={14} />
                                <span className="font-medium">Create new investor "{input}"</span>
                            </button>
                        )}

                        {filteredSuggestions.length === 0 && !input && (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                Start typing to find investors...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
