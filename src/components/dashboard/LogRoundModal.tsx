"use client";

import { X, ChevronRight, Check, Plus, Trash2, DollarSign, PieChart, FileText, Upload, Pencil, Calendar, Tag, Layers, Hash, Layout, Users, TrendingUp, Activity, ArrowRight, PieChart as PieChartIcon } from "lucide-react";
import { MOCK_INVESTORS } from "../../lib/constants";
import { useState, useRef } from "react";
import { INITIAL_ROUND_LABELS } from "../../lib/constants";
import { NotesManager, Note } from "../shared/NotesManager";
import { DocumentsManager, CompanyDocument } from "../shared/DocumentsManager";

interface LogRoundModalProps {
    checkIfOpen: boolean;
    onClose: () => void;
    companyName: string;
    onSave: (data: any) => void;
    initialData?: any;
}



interface Allocation {
    id: string;
    fundId: string;
    amount: string;
    shares: string;
    ownership: string;
}

export function LogRoundModal({ checkIfOpen, onClose, companyName, onSave, initialData }: LogRoundModalProps) {
    const [activeTab, setActiveTab] = useState<'terms' | 'documents' | 'position' | 'syndicate' | 'notes'>('terms');
    const [showConfirmModal, setShowConfirmModal] = useState(false);


    // --- STATE: STEP 1 (Round Terms) ---
    const [roundDate, setRoundDate] = useState(initialData?.roundTerms?.date || "");
    const [stage, setStage] = useState(initialData?.roundTerms?.stage || "");
    const [capitalRaised, setCapitalRaised] = useState(initialData?.roundTerms?.capitalRaised || "");
    const [structure, setStructure] = useState<'Equity' | 'SAFE'>(initialData?.roundTerms?.structure || 'Equity');
    const [valuation, setValuation] = useState(initialData?.roundTerms?.valuation || "");
    const [valContext, setValContext] = useState<'Pre' | 'Post'>(initialData?.roundTerms?.valContext || 'Post');
    const [pps, setPps] = useState(initialData?.roundTerms?.pps || "");
    const [valuationCap, setValuationCap] = useState(initialData?.roundTerms?.valuationCap || "");
    const [discount, setDiscount] = useState(initialData?.roundTerms?.discount || "");

    // Documents State
    const [documents, setDocuments] = useState<CompanyDocument[]>(initialData?.roundTerms?.documents || []);

    // Notes State
    const [notes, setNotes] = useState<Note[]>(initialData?.notes || []);


    // --- STATE: STEP 2 (Our Position) ---
    const [participated, setParticipated] = useState(initialData?.position?.participated ?? false);
    const [allocations, setAllocations] = useState<Allocation[]>(initialData?.position?.allocations || [
        { id: '1', fundId: '', amount: '', shares: '', ownership: '' }
    ]);
    const [hasProRata, setHasProRata] = useState(initialData?.position?.hasProRata || false);
    const [hasWarrants, setHasWarrants] = useState(initialData?.position?.hasWarrants || false);

    const [warrantCoverage, setWarrantCoverage] = useState(initialData?.position?.warrantCoverage || "");
    const [warrantCoverageType, setWarrantCoverageType] = useState<'money' | 'percentage'>(initialData?.position?.warrantCoverageType || 'percentage');
    const [warrantExpiration, setWarrantExpiration] = useState(initialData?.position?.warrantExpiration || "");

    // --- STATE: STEP 3 (Syndicate) ---
    const [leads, setLeads] = useState<string[]>(initialData?.syndicate?.leads || []);
    const [coInvestors, setCoInvestors] = useState<string[]>(initialData?.syndicate?.coInvestors || []);


    // --- HANDLERS ---





    // Allocations
    const addAllocation = () => setAllocations([...allocations, { id: Math.random().toString(), fundId: '', amount: '', shares: '', ownership: '' }]);
    const removeAllocation = (id: string) => setAllocations(allocations.filter(a => a.id !== id));
    const updateAllocation = (id: string, field: keyof Allocation, value: string) => setAllocations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));

    // Final Save
    const handleLogRound = () => {
        // Validation
        if (!roundDate) {
            alert("Please select a Round Date.");
            return;
        }

        // Just show the confirmation modal
        setShowConfirmModal(true);
    };

    const processFinalSave = () => {
        const payload = {
            id: initialData?.id, // Persist ID for updates
            roundTerms: {
                date: roundDate,
                stage,
                capitalRaised,
                structure,
                valuation,
                valContext,
                pps,
                valuationCap,
                discount,
                documents: documents || []
            },
            position: {
                participated,
                allocations: allocations || [],
                hasProRata,
                hasWarrants,

                warrantCoverage,
                warrantCoverageType,
                warrantExpiration
            },
            syndicate: {
                leads: leads || [],
                coInvestors: coInvestors || []
            },
            notes: notes || []
        };

        // Call the parent onSave logic
        onSave(payload);

        // Close modal
        setShowConfirmModal(false);
        onClose();
    };


    if (!checkIfOpen) return null;

    // Tabs Config
    // Tabs Config
    const TABS = [
        { id: 'terms', label: 'Round Terms', icon: Layers },
        { id: 'position', label: 'R-Squared Position', icon: DollarSign },
        { id: 'syndicate', label: 'Syndicate', icon: Users },
        { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
        { id: 'documents', label: 'Documents', icon: Layers, count: documents.length }, // Suggestion: Use slightly different icon for Docs vs Notes? Using Layers for now to match old style or check imports
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
            <div className="w-[900px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Log Financing Round</h2>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">{companyName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pt-2 border-b border-gray-100 bg-gray-50/50 flex gap-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            // @ts-ignore
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {/* @ts-ignore */}
                            {tab.count > 0 && (
                                // @ts-ignore
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] ml-1">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <div className={activeTab === 'terms' ? 'block' : 'hidden'}>
                        <StepRoundTerms
                            roundDate={roundDate} setRoundDate={setRoundDate}
                            stage={stage} setStage={setStage}
                            capitalRaised={capitalRaised} setCapitalRaised={setCapitalRaised}
                            structure={structure} setStructure={setStructure}
                            valuation={valuation} setValuation={setValuation}
                            valContext={valContext} setValContext={setValContext}
                            pps={pps} setPps={setPps}
                            valuationCap={valuationCap} setValuationCap={setValuationCap}
                            discount={discount} setDiscount={setDiscount}
                        />
                    </div>
                    <div className={activeTab === 'position' ? 'block' : 'hidden'}>
                        <StepPosition
                            participated={participated}
                            setParticipated={setParticipated}
                            allocations={allocations}
                            addAllocation={addAllocation}
                            removeAllocation={removeAllocation}
                            updateAllocation={updateAllocation}
                            hasProRata={hasProRata}
                            setHasProRata={setHasProRata}
                            hasWarrants={hasWarrants}
                            setHasWarrants={setHasWarrants}
                            warrantCoverage={warrantCoverage}
                            setWarrantCoverage={setWarrantCoverage}
                            warrantCoverageType={warrantCoverageType}
                            setWarrantCoverageType={setWarrantCoverageType}
                            warrantExpiration={warrantExpiration}
                            setWarrantExpiration={setWarrantExpiration}
                            structure={structure}
                            pps={pps}
                        />
                    </div>
                    <div className={activeTab === 'syndicate' ? 'block' : 'hidden'}>
                        <StepSyndicate
                            leads={leads} setLeads={setLeads}
                            coInvestors={coInvestors} setCoInvestors={setCoInvestors}
                        />
                    </div>
                    <div className={activeTab === 'notes' ? 'block' : 'hidden'}>
                        <NotesManager notes={notes} onNotesChange={setNotes} />
                    </div>
                    <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
                        <DocumentsManager documents={documents} onDocumentsChange={setDocuments} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end items-center bg-gray-50/50 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogRound}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {initialData ? 'Save Changes' : 'Log Round'} <Check size={16} />
                    </button>
                </div>
            </div>

            {/* Success Confirmation Modal */}
            {showConfirmModal && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-8 w-[360px] text-center transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Round Logged Successfully</h3>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                            The financing round has been recorded to the company ledger and portfolio metrics have been updated.
                        </p>
                        <button
                            onClick={processFinalSave}
                            className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StepNotes({ notes, noteContent, setNoteContent, addNote, deleteNote, startEditingNote, editingNoteId }: any) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Deal Notes</h3>
                <p className="text-sm text-muted-foreground">Capture qualitative details, side letters, or important context.</p>
            </div>

            <div className="space-y-6">
                {/* Input Area */}
                <div className="space-y-3">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your note here..."
                        className="w-full h-32 p-4 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={addNote}
                            disabled={!noteContent.trim()}
                            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingNoteId ? 'Update Note' : 'Add Note'}
                        </button>
                    </div>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <FileText size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notes added yet.</p>
                        </div>
                    ) : (
                        notes.map((note: any) => (
                            <div key={note.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-gray-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">{note.author}</span>
                                        <span>•</span>
                                        <span>{note.date}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditingNote(note)} className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-600 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StepRoundTerms(props: any) {
    // Destructuring props for cleaner usage
    const {
        roundDate, setRoundDate, stage, setStage, capitalRaised, setCapitalRaised,
        structure, setStructure, valuation, setValuation, valContext, setValContext,
        pps, setPps, valuationCap, setValuationCap, discount, setDiscount,
    } = props;

    // Currency Formatter
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        // Remove all non-numeric characters except decimal
        const rawValue = e.target.value.replace(/,/g, '');

        // Allow empty string to clear input
        if (rawValue === '') {
            setter('');
            return;
        }

        // Check if valid number (allow decimal point at end)
        if (!isNaN(Number(rawValue)) || rawValue.endsWith('.')) {
            // Split integer and decimal parts
            const parts = rawValue.split('.');
            // Format integer part with commas
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            // Rejoin
            setter(parts.join('.'));
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Round Terms</h3>

            </div>

            {/* 1. Common Fields */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Round Date <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors" size={16} />
                        <input
                            type="date"
                            value={roundDate} onChange={(e) => setRoundDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Security Class / Legal Name</label>
                    <div className="relative group">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="e.g. Series A-1 Preferred"
                            value={stage} onChange={(e) => setStage(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 pl-1">The exact class name from the legal docs.</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Capital Raised (Total)</label>
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors font-medium">$</div>
                    <input
                        type="text"
                        placeholder="0.00"
                        value={capitalRaised}
                        onChange={(e) => handleCurrencyChange(e, setCapitalRaised)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Structure Control */}
            <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-gray-700">Structure</label>
                <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setStructure('Equity')}
                        className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all duration-200 ${structure === 'Equity' ? 'bg-white shadow-sm text-purple-700 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
                    >
                        <PieChart size={16} />
                        Priced Round (Equity)
                    </button>
                    <button
                        onClick={() => setStructure('SAFE')}
                        className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all duration-200 ${structure === 'SAFE' ? 'bg-white shadow-sm text-purple-700 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
                    >
                        <FileText size={16} />
                        SAFE / Convertible
                    </button>
                </div>
            </div>

            {/* 2. Conditional Logic: Priced Round */}
            {structure === 'Equity' && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Valuation</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <input
                                    type="text"
                                    placeholder="0.00"
                                    value={valuation}
                                    onChange={(e) => handleCurrencyChange(e, setValuation)}
                                    className="w-full pl-7 pr-4 py-2 border border-purple-200 rounded-md text-sm font-mono focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Context</label>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={valContext === 'Pre'}
                                        onChange={() => setValContext('Pre')}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-foreground">Pre-Money</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={valContext === 'Post'}
                                        onChange={() => setValContext('Post')}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-foreground">Post-Money</span>
                                </label>
                            </div>
                        </div>
                    </div>


                    {/* Valuation Calculation Card */}
                    {
                        (valuation && capitalRaised) && (
                            <div className="bg-white/50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Company Valuation</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {valContext === 'Pre'
                                            ? `Pre-Money ($${valuation}) + Raised ($${capitalRaised})`
                                            : `Entered as Post-Money Valuation`
                                        }
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        ${(() => {
                                            const v = parseFloat(valuation.replace(/,/g, '')) || 0;
                                            const c = parseFloat(capitalRaised.replace(/,/g, '')) || 0;
                                            const total = valContext === 'Pre' ? v + c : v;
                                            return total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                                        })()}
                                        {valContext === 'Pre' && (capitalRaised.includes('M') || valuation.includes('M')) ? 'M' : ''}
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Price Per Share (PPS)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <input
                                type="text"
                                placeholder="0.0000"
                                value={pps}
                                onChange={(e) => handleCurrencyChange(e, setPps)}
                                className="w-full pl-7 pr-4 py-2 border border-purple-200 rounded-md text-sm font-mono focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div >
            )}

            {/* 3. Conditional Logic: SAFE */}
            {structure === 'SAFE' && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Valuation Cap</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <input
                                    type="text"
                                    placeholder="No Cap"
                                    value={valuationCap}
                                    onChange={(e) => handleCurrencyChange(e, setValuationCap)}
                                    className="w-full pl-7 pr-4 py-2 border border-purple-200 rounded-md text-sm font-mono focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Discount</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={discount} onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full pl-3 pr-7 py-2 border border-purple-200 rounded-md text-sm font-mono focus:ring-purple-500"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



interface StepPositionProps {
    participated: boolean;
    setParticipated: (v: boolean) => void;
    allocations: Allocation[];
    addAllocation: () => void;
    removeAllocation: (id: string) => void;
    updateAllocation: (id: string, field: keyof Allocation, value: string) => void;
    hasProRata: boolean;
    setHasProRata: (v: boolean) => void;
    // Warrants
    hasWarrants: boolean;
    setHasWarrants: (v: boolean) => void;
    warrantCoverage: string;
    setWarrantCoverage: (v: string) => void;
    warrantCoverageType: 'money' | 'percentage';
    setWarrantCoverageType: (v: 'money' | 'percentage') => void;
    warrantExpiration: string;
    setWarrantExpiration: (v: string) => void;
    structure: string;
    pps: string;
}

function StepPosition({ participated, setParticipated, allocations, addAllocation, removeAllocation, updateAllocation, hasProRata, setHasProRata, hasWarrants, setHasWarrants, warrantCoverage, setWarrantCoverage, warrantCoverageType, setWarrantCoverageType, warrantExpiration, setWarrantExpiration, structure, pps }: StepPositionProps) {


    const handleAllocationChange = (id: string, field: keyof Allocation, value: string) => {
        // 1. Clean Input (Allow numbers and decimals only)
        const cleanValue = value.replace(/[^0-9.]/g, '');

        // Prevent multiple dots
        if ((cleanValue.match(/\./g) || []).length > 1) return;

        // 2. Format with Commas (for display in Amount field)
        let formatted = cleanValue;
        if (cleanValue) {
            const parts = cleanValue.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            formatted = parts.join('.');
        }

        // Update the field (Amount) with formatted value
        updateAllocation(id, field, formatted);

        // 3. Auto-calculate Shares (only if field is amount)
        if (field === 'amount') {
            // Safe PPS extraction
            const cleanPps = (pps || '').toString().replace(/[^0-9.]/g, '');

            // If we have valid amount AND valid PPS
            if (cleanValue && cleanPps && Number(cleanPps) !== 0 && !isNaN(Number(cleanValue))) {
                const shares = Number(cleanValue) / Number(cleanPps);
                // Update shares (using floor + locale string for nice number format)
                updateAllocation(id, 'shares', Math.floor(shares).toLocaleString());
            } else {
                // RESET SHARES if Amount is cleared or invalid
                updateAllocation(id, 'shares', '');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1 mb-2">
                <h3 className="text-lg font-semibold text-foreground">R-Squared Participation</h3>
                <p className="text-sm text-muted-foreground">Record specific capital deployment from your Funds.</p>
            </div>

            {/* Participation Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Did R-Squared Ventures invest in the round?</p>

                    </div>
                </div>
                <label htmlFor="participated" className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input
                        type="checkbox"
                        id="participated"
                        checked={participated}
                        onChange={(e) => setParticipated(e.target.checked)}
                        className="peer sr-only"
                    />
                    <div className="block h-6 overflow-hidden rounded-full bg-gray-300 peer-checked:bg-amber-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
                </label>
            </div>

            {participated && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* Fund Allocation List (Repeater) */}
                    <div className="bg-gray-50 border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-border">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs uppercase">Fund</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs uppercase w-32">Amount</th>
                                    {structure !== 'SAFE' && (
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs uppercase w-32">Shares</th>
                                    )}
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs uppercase w-24">Own %</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {allocations.map((alloc: Allocation) => (
                                    <tr key={alloc.id} className="group bg-white">
                                        <td className="p-2">
                                            <select
                                                className="w-full px-2 py-1.5 border border-border rounded text-sm bg-transparent focus:ring-1 focus:ring-amber-500"
                                                value={alloc.fundId}
                                                onChange={(e) => updateAllocation(alloc.id, 'fundId', e.target.value)}
                                            >
                                                <option value="">Select Fund...</option>
                                                <option value="Fund I">Fund I (Vintage 2020)</option>
                                                <option value="Fund II">Fund II (Active)</option>
                                                <option value="Fund III">Fund III (Raising)</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                                <input
                                                    type="text"
                                                    placeholder="0.00"
                                                    className="w-full pl-5 px-2 py-1.5 border border-border rounded text-sm font-mono focus:ring-1 focus:ring-amber-500"
                                                    value={alloc.amount}
                                                    onChange={(e) => handleAllocationChange(alloc.id, 'amount', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        {structure !== 'SAFE' && (
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    placeholder="0"
                                                    className="w-full px-2 py-1.5 border border-border rounded text-sm font-mono focus:ring-1 focus:ring-amber-500"
                                                    value={alloc.shares}
                                                    onChange={(e) => handleAllocationChange(alloc.id, 'shares', e.target.value)}
                                                />
                                            </td>
                                        )}
                                        <td className="p-2">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="0.0"
                                                    className="w-full pl-2 pr-5 py-1.5 border border-border rounded text-sm font-mono bg-amber-50 focus:ring-1 focus:ring-amber-500"
                                                    value={alloc.ownership}
                                                    onChange={(e) => handleAllocationChange(alloc.id, 'ownership', e.target.value)}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-center">
                                            {allocations.length > 1 && (
                                                <button
                                                    onClick={() => removeAllocation(alloc.id)}
                                                    className="text-muted-foreground hover:text-red-500 p-1 rounded transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 bg-gray-50 border-t border-border">
                            <button
                                onClick={addAllocation}
                                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded transition-colors"
                            >
                                <Plus size={14} />
                                Select Fund
                            </button>
                        </div>
                    </div>




                    {/* Warrants Section */}
                    <div className="pt-2 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="warrants"
                                checked={hasWarrants}
                                onChange={(e) => setHasWarrants(e.target.checked)}
                                className="w-4 h-4 text-amber-600 border-border rounded focus:ring-primary"
                            />
                            <label htmlFor="warrants" className="text-sm font-medium text-foreground cursor-pointer select-none">
                                Round includes Warrant Coverage
                            </label>
                        </div>

                        {hasWarrants && (
                            <div className="ml-6 p-4 bg-gray-50 border border-border rounded-lg grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">Coverage Amount</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            {warrantCoverageType === 'money' && (
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    <DollarSign size={14} />
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                placeholder={warrantCoverageType === 'percentage' ? "20" : "500,000"}
                                                className={`w-full ${warrantCoverageType === 'money' ? 'pl-8' : 'pl-3'} pr-3 py-2 border border-border rounded-md text-sm`}
                                                value={warrantCoverage}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (warrantCoverageType === 'money') {
                                                        const raw = val.replace(/,/g, '');
                                                        if (!isNaN(Number(raw)) || raw === '') {
                                                            setWarrantCoverage!(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                                                        }
                                                    } else {
                                                        setWarrantCoverage!(val);
                                                    }
                                                }}
                                            />
                                            {warrantCoverageType === 'percentage' && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</div>
                                            )}
                                        </div>
                                        <select
                                            value={warrantCoverageType}
                                            onChange={(e) => setWarrantCoverageType!(e.target.value as any)}
                                            className="px-3 py-2 bg-white border border-border text-foreground text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-24"
                                        >
                                            <option value="percentage">%</option>
                                            <option value="money">$</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">Expiration Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
                                        value={warrantExpiration}
                                        onChange={(e) => setWarrantExpiration(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
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
                                Pro-Rata
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface StepSyndicateProps {
    leads: string[];
    setLeads: (v: string[]) => void;
    coInvestors: string[];
    setCoInvestors: (v: string[]) => void;
}

function StepSyndicate({ leads, setLeads, coInvestors, setCoInvestors }: StepSyndicateProps) {
    const handleLeadChange = (newLeads: string[]) => {
        setLeads(newLeads);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-semibold text-foreground">The Syndicate</h3>
                <p className="text-sm text-muted-foreground">Build the relationship graph by tagging who else is in the deal.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground flex justify-between">
                        <span>Lead Investor(s)</span>
                        <span className="text-xs text-muted-foreground font-normal">Who led/priced the round?</span>
                    </label>
                    <div className="p-1">
                        <InvestorMultiSelect
                            selected={leads}
                            onChange={handleLeadChange}
                            placeholder="Select Lead Investor(s)..."
                            accentColor="emerald"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Co-Investors</label>
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
        </div>
    )
}

// Helper Component for Multi-Select Investors
function InvestorMultiSelect({ selected, onChange, placeholder, accentColor = 'primary', single = false }: { selected: string[]; onChange: (v: string[]) => void; placeholder: string; accentColor?: string; single?: boolean }) {
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Expanded Mock List
    const MOCK_INVESTORS_LIST = MOCK_INVESTORS.map(i => i.name).sort();

    const filteredSuggestions = MOCK_INVESTORS_LIST.filter(i =>
        i.toLowerCase().includes(input.toLowerCase()) && !selected.includes(i)
    );

    const addInvestor = (name: string) => {
        if (name && !selected.includes(name)) {
            onChange([...selected, name]);
            setInput('');
            setIsOpen(false);
        }
    };

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

                {/* Hide input if single mode and selection exists */}
                {(!single || selected.length === 0) && (
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
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (input || filteredSuggestions.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filteredSuggestions.length > 0 && <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">Suggestions</div>}

                        {filteredSuggestions.map(s => (
                            <button
                                key={s}
                                onMouseDown={(e) => { e.preventDefault(); addInvestor(s); }}
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
                    </div>
                </div>
            )}
        </div>
    )
}
