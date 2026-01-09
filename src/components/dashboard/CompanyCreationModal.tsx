"use client";

import { X, Check, FileText, Trash2, Pencil, Upload, Building2, Layout, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotesManager, Note } from "../shared/NotesManager";
import { DocumentsManager, CompanyDocument } from "../shared/DocumentsManager";
import { getCountries, getCategories } from "@/app/actions";

// ... existing interfaces ...

export interface CompanyData {
    id?: string;
    // ...
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

export function CompanyCreationModal({ checkIfOpen, onClose, initialData, onSave, availableStatuses }: CompanyCreationModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'notes'>('profile');

    // Form State
    const [name, setName] = useState("");
    const [website, setWebsite] = useState("");
    const [affinityLink, setAffinityLink] = useState("");
    const [category, setCategory] = useState("");
    const [country, setCountry] = useState("United States"); // Default to full name
    const [oneLiner, setOneLiner] = useState("");
    const [formationDate, setFormationDate] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");

    const [notes, setNotes] = useState<Note[]>([]);
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);

    const [countryList, setCountryList] = useState<string[]>([]);
    const [categoryList, setCategoryList] = useState<string[]>([]); // Dynamic

    useEffect(() => {
        getCountries().then(setCountryList);
        getCategories().then(setCategoryList);
    }, []);

    // ... existing logic ...

    // Reset or Populate on Open
    useEffect(() => {
        if (checkIfOpen) {
            if (initialData) {
                // ...
                setName(initialData.name || "");
                setWebsite(initialData.website || "");
                setAffinityLink(initialData.affinityLink || "");
                setCategory(initialData.category || "");
                setCountry(initialData.country || "United States");
                setOneLiner(initialData.oneLiner || "");
                setFormationDate(initialData.formationDate || "");
                setJurisdiction(initialData.jurisdiction || "");
                setDescription(initialData.description || "");

                // Populate arrays if they exist in initialData
                // Note: initialData might not have 'notes' if checking the Interface, but we'll adding safe checks.
                // Cast to any to access potential extra fields or just default to empty
                setDocuments(initialData.documents || []);
                setNotes((initialData as any).notes || []);

                setStatus(initialData.status || "Active");
                setActiveTab('profile'); // Always start on profile
            } else {
                // Reset for new company
                setName("");
                setWebsite("");
                setAffinityLink("");
                setCategory("");
                setCountry("United States");
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

    if (!checkIfOpen) return null;

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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Country</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <select
                                            value={country} onChange={(e) => setCountry(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm bg-white"
                                        >
                                            {countryList.length > 0 ? (
                                                countryList.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))
                                            ) : (
                                                <option value="United States">United States (Loading...)</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">One-Liner</label>
                                    <input
                                        type="text"
                                        placeholder="Brief description..."
                                        value={oneLiner} onChange={(e) => setOneLiner(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
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
                                        {categoryList.length > 0 ? (
                                            categoryList.map(c => <option key={c} value={c}>{c}</option>)
                                        ) : (
                                            // Fallback if loading
                                            <>
                                                <option value="AI">AI</option>
                                                <option value="SaaS">SaaS</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Focus</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. B2B / Consumer"
                                        // Using 'jurisdiction' field as flexible 'Focus/Sub-sector' field for now in UI if not strictly mapped
                                        // Or we can just keep it as is. 
                                        // Wait, the original had 'Category' select hardcoded.
                                        value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
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
