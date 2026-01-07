"use client";

import { X, Check, FileText, Trash2, Pencil, Upload, Building2, Layout } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CompanyData {
    id?: string;
    name: string;
    category: string;
    country: string;
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

export function CompanyCreationModal({ checkIfOpen, onClose, initialData }: CompanyCreationModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'notes'>('profile');

    // Form State
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [country, setCountry] = useState("US");
    const [oneLiner, setOneLiner] = useState("");
    const [formationDate, setFormationDate] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [description, setDescription] = useState("");

    // Documents State
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Notes State
    const [notes, setNotes] = useState<{ id: string, content: string, date: string, author: string }[]>([]);
    const [noteContent, setNoteContent] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    // Reset or Populate on Open
    useEffect(() => {
        if (checkIfOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setCategory(initialData.category || "");
                setCountry(initialData.country || "US");
                setOneLiner(initialData.oneLiner || "");
                setFormationDate(initialData.formationDate || "");
                setJurisdiction(initialData.jurisdiction || "");
                setDescription(initialData.description || "");
                setDocuments(initialData.documents || []);
                // Notes would be loaded here if part of initialData
                setNotes([]); // Reset notes for now or load if available
                setActiveTab('profile'); // Always start on profile
            } else {
                // Reset for new company
                setName("");
                setCategory("");
                setCountry("US");
                setOneLiner("");
                setFormationDate("");
                setJurisdiction("");
                setDescription("");
                setDocuments([]);
                setNotes([]);
                setActiveTab('profile');
            }
        }
    }, [checkIfOpen, initialData]);

    if (!checkIfOpen) return null;

    // --- HANDLERS ---

    // Notes
    const addNote = () => {
        if (!noteContent.trim()) return;
        if (editingNoteId) {
            setNotes(notes.map(n => n.id === editingNoteId ? { ...n, content: noteContent } : n));
            setEditingNoteId(null);
        } else {
            const newNote = {
                id: Math.random().toString(36).substr(2, 9),
                content: noteContent,
                date: new Date().toLocaleDateString(),
                author: "You" // Placeholder
            };
            setNotes([newNote, ...notes]);
        }
        setNoteContent("");
    };

    const deleteNote = (id: string) => setNotes(notes.filter(n => n.id !== id));

    const startEditingNote = (note: { id: string, content: string }) => {
        setEditingNoteId(note.id);
        setNoteContent(note.content);
        setActiveTab('notes');
    };

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

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">One-Liner</label>
                                <textarea
                                    value={oneLiner} onChange={(e) => setOneLiner(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                                    placeholder="Briefly describe what the company does..."
                                />
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
                                <label className="block text-sm font-medium text-muted-foreground">Description</label>
                                <textarea
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                                    placeholder="Detailed description of the company business model and traction..."
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: NOTES */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">Company Notes</h3>
                                        <p className="text-xs text-muted-foreground">Internal memos, updates, and key information.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Type your note here..."
                                        className="w-full h-32 p-4 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                                <div className="space-y-3 mt-4">
                                    {notes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                            <FileText size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No notes added yet.</p>
                                        </div>
                                    ) : (
                                        notes.map((note) => (
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
                    )}

                    {/* TAB: DOCUMENTS */}
                    {activeTab === 'documents' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">Company Documents</h3>
                                        <p className="text-xs text-muted-foreground">Legal docs, formation papers, etc.</p>
                                    </div>
                                    <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">{documents.length} files attached</span>
                                </div>

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
                                        className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group"
                                    >
                                        <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                                            <Upload size={20} className="text-blue-500 group-hover:text-blue-600" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Click to upload documents</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, Slides (Max 25MB)</p>
                                    </div>

                                    {/* Document List */}
                                    {documents.length > 0 && (
                                        <div className="bg-gray-50 rounded-md border border-border divide-y divide-border overflow-hidden mt-4">
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
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end items-center bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        {initialData ? 'Save Changes' : 'Create Company'}
                        <Check size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
