"use client";

import { X, ChevronRight, Check, Plus, FileText, Trash2, Pencil, Upload } from "lucide-react";
import { useState, useRef } from "react";
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

    const totalSteps = 4;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${step === 1 ? 'bg-blue-100 text-blue-600' : step === 2 ? 'bg-purple-100 text-purple-600' : step === 3 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {step === 1 && <span className="font-bold text-xs">01</span>}
                            {step === 2 && <span className="font-bold text-xs">02</span>}
                            {step === 3 && <span className="font-bold text-xs">03</span>}
                            {step === 4 && <span className="font-bold text-xs">04</span>}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground tracking-tight">Log New Deal</h2>
                            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}: <span className="font-medium text-foreground">
                                {step === 1 ? 'Company Details' : step === 2 ? 'Round Terms' : step === 3 ? 'Our Position' : 'Syndicate'}
                            </span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-gray-100 rounded-md">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && <StepCompany initialCompany={initialCompany} />}
                    {step === 2 && <StepRoundTerms />}
                    {step === 3 && <StepPosition participated={participated} setParticipated={setParticipated} />}
                    {step === 4 && <StepSyndicate />}
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

// Countries List
const TOP_COUNTRIES = ["United States", "Israel", "United Kingdom", "Canada"];
const OTHER_COUNTRIES = ["Germany", "France", "Singapore", "Sweden", "Switzerland", "Netherlands", "Australia", "South Korea", "Japan", "Brazil", "India"];

interface CompanyDocument {
    id: string;
    name: string;
    size: string;
    type: string;
}

function StepCompany({ initialCompany = "" }: { initialCompany?: string }) {
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newDocs: CompanyDocument[] = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.type
            }));
            setDocuments([...documents, ...newDocs]);
        }
    };

    const deleteDocument = (id: string) => {
        setDocuments(documents.filter(d => d.id !== id));
    };

    const startEditing = (doc: CompanyDocument) => {
        setEditingDocId(doc.id);
        setEditName(doc.name);
    };

    const saveEdit = () => {
        if (editingDocId) {
            setDocuments(documents.map(d => d.id === editingDocId ? { ...d, name: editName } : d));
            setEditingDocId(null);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">1. Company Profile</h3>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Company Name</label>
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            defaultValue={initialCompany}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">One-Liner</label>
                        <input
                            type="text"
                            placeholder="e.g. AI-powered supply chain optimization"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Category</label>
                        <select className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white">
                            <option value="">Select Category...</option>
                            <option value="AI">Artificial Intelligence</option>
                            <option value="Fintech">Fintech</option>
                            <option value="SaaS">B2B SaaS</option>
                            <option value="Consumer">Consumer</option>
                            <option value="Health">Healthcare</option>
                            <option value="Infra">Infrastructure</option>
                            <option value="Crypto">Crypto / Web3</option>
                        </select>
                    </div>
                </div>

                {/* Legal / Formation */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Formation Date</label>
                        <input type="date" className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white" />
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
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Jurisdiction</label>
                        <input
                            type="text"
                            placeholder="e.g. Delaware, Cayman"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Description</label>
                    <textarea
                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                        placeholder="Detailed description of the company business model and traction..."
                    />
                </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-muted-foreground flex justify-between items-center">
                    <span>Documents</span>
                    <span className="text-xs font-normal text-muted-foreground">{documents.length} files attached</span>
                </label>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />

                <div className="space-y-2">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                        <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-white transition-colors">
                            <Upload size={16} className="text-muted-foreground group-hover:text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Click to upload documents</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, Slides (Max 25MB)</p>
                    </div>

                    {/* Document List */}
                    {documents.length > 0 && (
                        <div className="bg-gray-50 rounded-md border border-border divide-y divide-border overflow-hidden">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-white border border-border rounded-md">
                                            <FileText size={16} className="text-blue-600" />
                                        </div>
                                        {editingDocId === doc.id ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm border border-primary rounded-sm focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit();
                                                        if (e.key === 'Escape') setEditingDocId(null);
                                                    }}
                                                    onBlur={saveEdit}
                                                />
                                            </div>
                                        ) : (
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.size} • {new Date().toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(doc)}
                                            className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                            title="Rename"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteDocument(doc.id)}
                                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StepRoundTerms() {
    const [roundType, setRoundType] = useState<'Equity' | 'SAFE'>('Equity');

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                2. Round Terms
            </h3>

            {/* Security Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-md mb-6">
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

            <div className="max-w-xl space-y-4">
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
                    </div>
                )}
            </div>
        </div>
    )
}

function StepPosition({ participated, setParticipated }: { participated: boolean; setParticipated: (v: boolean) => void }) {
    const [hasProRata, setHasProRata] = useState(false);

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                3. Our Position
            </h3>

            {/* Participation Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-border rounded-md">
                <input
                    type="checkbox"
                    id="participated"
                    checked={participated}
                    onChange={(e) => setParticipated(e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="participated" className="text-sm text-foreground font-medium cursor-pointer select-none">
                    We participated in this round
                </label>
            </div>

            {participated ? (
                <div className="space-y-4 pl-1 animation-in fade-in slide-in-from-top-2 duration-300">
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
            ) : (
                <div className="p-8 border-2 border-dashed border-border rounded-md flex flex-col items-center text-center">
                    <p className="text-sm text-muted-foreground">Market Event Only</p>
                    <p className="text-xs text-muted-foreground mt-1">This round will be logged for valuation purposes but no capital was deployed.</p>
                </div>
            )}
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
