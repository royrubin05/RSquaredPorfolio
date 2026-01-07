"use client";

import { FileText, Pencil, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";

export interface CompanyDocument {
    id: string;
    name: string;
    size: string;
    type: string;
}

interface DocumentsManagerProps {
    documents: CompanyDocument[];
    onDocumentsChange: (docs: CompanyDocument[]) => void;
}

export function DocumentsManager({ documents, onDocumentsChange }: DocumentsManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newDocs: CompanyDocument[] = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.type
            }));
            onDocumentsChange([...documents, ...newDocs]);
        }
    };

    const deleteDocument = (id: string) => onDocumentsChange(documents.filter(d => d.id !== id));



    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="text-center space-y-1 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Documents</h3>
                <p className="text-sm text-muted-foreground">Attach signed term sheets, definitive docs, and side letters.</p>
            </div>

            <div className="space-y-3 pt-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h4 className="text-sm font-medium text-foreground">Attachments</h4>
                    </div>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">{documents.length} files attached</span>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />

                <div className="space-y-3">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-purple-300 transition-all cursor-pointer group"
                    >
                        <div className="p-3 bg-purple-50 rounded-full mb-3 group-hover:bg-purple-100 transition-colors text-purple-600">
                            <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium text-foreground">Click to upload documents</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (Max 25MB)</p>
                    </div>

                    {/* Document List */}
                    {documents.length > 0 && (
                        <div className="bg-gray-50 rounded-md border border-border divide-y divide-border overflow-hidden">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-white border border-border rounded-md">
                                            <FileText size={16} className="text-purple-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

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
    );
}
