"use client";

import { X, Check, FileText, Trash2, Pencil, Upload, Building2, Layout } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotesManager, Note } from "../shared/NotesManager";
import { DocumentsManager, CompanyDocument } from "../shared/DocumentsManager";

export interface CompanyData {
    id?: string;
    name: string;
    website?: string;
    affinityLink?: string;
    category: string;
    country: string;
    status: string;
    oneLiner: string;
    formationDate?: string;
    jurisdiction?: string;
    description?: string;
    documents?: CompanyDocument[];
}

interface CompanyCreationModalProps {
    checkIfOpen: boolean;
    onClose: () => void;
    initialData?: CompanyData | null;
    onSave: (data: CompanyData) => void;
    availableStatuses?: string[];
}

// Countries List
const TOP_COUNTRIES = ["United States", "Israel", "United Kingdom", "Canada"];
const OTHER_COUNTRIES = ["Germany", "France", "Singapore", "Sweden", "Switzerland", "Netherlands", "Australia", "South Korea", "Japan", "Brazil", "India"];



export function CompanyCreationModal({ checkIfOpen, onClose, initialData, onSave, availableStatuses }: CompanyCreationModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'notes'>('profile');

    // Form State
    const [name, setName] = useState("");
    const [website, setWebsite] = useState("");
    const [affinityLink, setAffinityLink] = useState("");
    const [category, setCategory] = useState("");
    const [country, setCountry] = useState("US");
    const [oneLiner, setOneLiner] = useState("");
    const [formationDate, setFormationDate] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");

    // Documents State
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Notes State
    const [notes, setNotes] = useState<Note[]>([]);

    // Reset or Populate on Open
    useEffect(() => {
        if (checkIfOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setWebsite(initialData.website || "");
                setAffinityLink(initialData.affinityLink || "");
                setCategory(initialData.category || "");
                setCountry(initialData.country || "US");
                setOneLiner(initialData.oneLiner || "");
                setFormationDate(initialData.formationDate || "");
                setJurisdiction(initialData.jurisdiction || "");
                setDescription(initialData.description || "");
                setDocuments(initialData.documents || []);
                // Notes would be loaded here if part of initialData
                setNotes([]); // Reset notes for now or load if available
                setStatus(initialData.status || "Active");
                setActiveTab('profile'); // Always start on profile
            } else {
                // Reset for new company
                setName("");
                setWebsite("");
                setAffinityLink("");
                setCategory("");
                setCountry("US");
                setOneLiner("");
                setFormationDate("");
                setJurisdiction("");
                setDescription("");
                setDocuments([]);
                setNotes([]);
                setStatus("Active");
                setActiveTab('profile');
            }
        }
    }, [checkIfOpen, initialData]);

    if (!checkIfOpen) return null;

    // --- HANDLERS ---

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (showConfirmModal) {
            const timer = setTimeout(() => {
                setShowConfirmModal(false);
                onClose();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [showConfirmModal, onClose]);

    const handleSave = () => {
        const companyData: CompanyData = {
            id: initialData?.id, // Preserve ID if editing
            name,
            website,
            affinityLink,
            category,
            country,
            status,
            oneLiner: description, // Sync oneLiner to description for now as requested
            formationDate,
            jurisdiction,
            description,
            documents
        };
        onSave(companyData);
        setShowConfirmModal(true);
    };

    // Notes




    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                            {initialData ? 'Edit Company' : 'Create New Company'}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {initialData ? `Update details for ${initialData.name}` : 'Add a new portfolio company to the system.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-gray-100 rounded-md">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-2 border-b border-border bg-white flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'profile'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Building2 size={16} />
                        Company Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'notes'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <FileText size={16} />
                        Notes
                        {notes.length > 0 && (
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{notes.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'documents'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Layout size={16} />
                        Documents
                        {documents.length > 0 && (
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{documents.length}</span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 h-[500px]">

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">Company Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">Status</label>
                                <select
                                    value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                >
                                    {(availableStatuses || ['Active', 'Watchlist', 'Exit', 'Shutdown']).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Website</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={website} onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Affinity Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://affinity.co/..."
                                        value={affinityLink} onChange={(e) => setAffinityLink(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Category</label>
                                    <select
                                        value={category} onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                    >
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
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Country</label>
                                    <select
                                        value={country} onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                    >
                                        <option value="US">United States</option>
                                        <option value="IL">Israel</option>
                                        <option disabled>──────────</option>
                                        {OTHER_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>



                            {/* Legal / Formation */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Formation Date</label>
                                    <input
                                        type="date"
                                        value={formationDate} onChange={(e) => setFormationDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Jurisdiction</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Delaware, Cayman"
                                        value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">What does the company do?</label>
                                <textarea
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                                    placeholder="Detailed description of the company business model and traction..."
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: NOTES */}
                    {/* TAB: NOTES */}
                    {activeTab === 'notes' && (
                        <NotesManager notes={notes} onNotesChange={setNotes} />
                    )}

                    {/* TAB: DOCUMENTS */}
                    {activeTab === 'documents' && (
                        <DocumentsManager documents={documents} onDocumentsChange={setDocuments} />

                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end items-center bg-gray-50/50">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {initialData ? 'Save Changes' : 'Create Company'}
                        <Check size={16} />
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Saved Successfully</h3>
                        <p className="text-sm text-gray-500">
                            {initialData ? 'Company details have been updated.' : 'New portfolio company created.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
