"use client";

import { FileText, Trash2, Upload, Loader2, Link as LinkIcon, Download } from "lucide-react";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CompanyDocument {
    id?: string; // Optional for new uploads before saving to DB? Actually we can treat it as DB ID if saved separately, but here we just pass metadata to parent form which saves to DB?
    // Parent form 'upsertCompany' needs to save these to 'company_documents' table.
    // So we will pass back objects that match the table structure roughly.
    name: string;
    size: string;
    type: string;
    url: string;
}

interface DocumentsManagerProps {
    documents: CompanyDocument[];
    onDocumentsChange: (docs: CompanyDocument[]) => void;
}

export function DocumentsManager({ documents, onDocumentsChange }: DocumentsManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const supabase = createClient();
        const newDocs: CompanyDocument[] = [];

        try {
            for (const file of Array.from(e.target.files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('company_documents')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert(`Failed to upload ${file.name}: ${uploadError.message}`);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('company_documents')
                    .getPublicUrl(filePath);

                newDocs.push({
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                    type: file.type || 'application/octet-stream',
                    url: publicUrl
                });
            }
            onDocumentsChange([...documents, ...newDocs]);
        } catch (err) {
            console.error('Upload exception:', err);
            alert("An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteDocument = (url: string) => onDocumentsChange(documents.filter(d => d.url !== url));

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
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-blue-300'}`}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-primary" size={24} />
                                <p className="text-sm font-medium text-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors text-blue-600">
                                    <Upload size={24} />
                                </div>
                                <p className="text-sm font-medium text-foreground">Click to upload documents</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (Max 25MB)</p>
                            </>
                        )}
                    </div>

                    {/* Document List */}
                    {documents.length > 0 && (
                        <div className="bg-gray-50 rounded-md border border-border divide-y divide-border overflow-hidden">
                            {documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-white border border-border rounded-md">
                                            <FileText size={16} className="text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground truncate hover:underline hover:text-primary">
                                                {doc.name}
                                            </a>
                                            <p className="text-xs text-muted-foreground">{doc.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-gray-100 rounded-md"
                                            title="View"
                                        >
                                            <LinkIcon size={14} />
                                        </a>
                                        <button
                                            onClick={() => deleteDocument(doc.url)}
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
