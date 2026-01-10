'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addFeatureRequest, deleteFeatureRequest, updateFeatureRequest } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Link as LinkIcon, Paperclip, Bug, Lightbulb, FileText, X, Upload } from 'lucide-react';

interface FeatureRequest {
    id: string;
    content: string;
    status: string;
    priority: string;
    type: string; // Feature, Bug, Report
    files: { name: string; url: string }[];
    created_at: string;
}

export function FeatureRequestManager({ initialRequests }: { initialRequests: FeatureRequest[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form State
    const [newRequest, setNewRequest] = useState('');
    const [newType, setNewType] = useState('Feature');
    const [attachedFiles, setAttachedFiles] = useState<{ name: string, url: string }[]>([]);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const supabase = createClient();

            // Unique filename: timestamp_filename
            const timestamp = new Date().getTime();
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`; // Sanitize chars

            const { data, error } = await supabase
                .storage
                .from('roadmap_files')
                .upload(filename, file);

            if (error) {
                console.error('Upload failed:', error);
                alert('Upload failed: ' + error.message);
                return;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('roadmap_files')
                .getPublicUrl(filename);

            setAttachedFiles([...attachedFiles, { name: file.name, url: publicUrl }]);

        } catch (error: any) {
            console.error('Error uploading:', error);
            alert('Error uploading file.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    };

    const handleAdd = async () => {
        if (!newRequest.trim()) return;

        await addFeatureRequest(newRequest, 'Medium', newType, attachedFiles);
        setNewRequest('');
        setAttachedFiles([]);
        setNewType('Feature');
        startTransition(() => {
            router.refresh();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        await deleteFeatureRequest(id);
        startTransition(() => {
            router.refresh();
        });
    };

    const toggleStatus = async (req: FeatureRequest) => {
        const nextStatus = req.status === 'Done' ? 'Open' : 'Done';
        await updateFeatureRequest(req.id, { status: nextStatus });
        startTransition(() => {
            router.refresh();
        });
    };

    const openRequests = initialRequests.filter(r => r.status !== 'Done');
    const completedRequests = initialRequests.filter(r => r.status === 'Done');

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Bug': return <Bug size={14} className="text-red-500" />;
            case 'Report': return <FileText size={14} className="text-blue-500" />;
            default: return <Lightbulb size={14} className="text-amber-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Bug': return 'bg-red-50 text-red-700 border-red-100';
            case 'Report': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Area */}
            {/* Input Area: Chat-style Layout */}
            <div className="bg-white p-1 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div className="flex items-center gap-2 p-1">
                    {/* Type Selector (Compact) */}
                    <div className="relative">
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium hover:bg-slate-100 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        >
                            <option value="Feature">Feature</option>
                            <option value="Bug">Bug</option>
                            <option value="Report">Report</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <span className="text-[10px]">▼</span>
                        </div>
                    </div>

                    {/* Main Input */}
                    <input
                        type="text"
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        placeholder="Describe the feature, bug, or report..."
                        className="flex-1 h-9 px-2 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/60 text-sm outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />

                    {/* File Trigger (Icon Only) */}
                    <div className="relative shrink-0">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors ${isUploading ? 'animate-pulse' : ''}`}
                            title="Attach File"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                        </label>
                    </div>

                    {/* Add Button (Compact) */}
                    <button
                        onClick={handleAdd}
                        disabled={isPending || !newRequest.trim()}
                        className="h-9 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Add</span>}
                    </button>
                </div>

                {/* Staged Files (Below Input) */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-3 pb-3 border-t border-slate-100 pt-2 mt-1">
                        {attachedFiles.map((f, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium text-slate-600">
                                <LinkIcon size={10} />
                                <a href={f.url} target="_blank" className="hover:underline max-w-[150px] truncate">{f.name}</a>
                                <button onClick={() => removeFile(i)} className="ml-1 hover:text-red-500 rounded-full p-0.5 hover:bg-red-50 transition-colors"><X size={10} /></button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {openRequests.length === 0 && completedRequests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border">
                        <div className="flex justify-center mb-3">
                            <div className="p-3 bg-secondary/20 rounded-full"><Lightbulb className="w-6 h-6 opacity-50" /></div>
                        </div>
                        <p>No items yet. Track bugs, features, and reports here.</p>
                    </div>
                )}

                <div className="grid gap-3">
                    {openRequests.map(req => (
                        <div key={req.id} className="group flex items-start gap-3 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
                            <button
                                onClick={() => toggleStatus(req)}
                                className="mt-1 text-muted-foreground hover:text-emerald-500 transition-colors"
                            >
                                <Circle className="w-5 h-5" />
                            </button>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-foreground leading-relaxed font-medium">{req.content}</p>
                                    <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1.5 ${getTypeColor(req.type || 'Feature')}`}>
                                        {getTypeIcon(req.type || 'Feature')}
                                        {req.type || 'Feature'}
                                    </div>
                                </div>

                                {req.files && Array.isArray(req.files) && req.files.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {req.files.map((f: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={f.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-border rounded text-xs text-blue-600 hover:underline hover:border-blue-200 transition-colors"
                                            >
                                                <Paperclip size={10} />
                                                {f.name || 'Attachment'}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                    {req.priority && req.priority !== 'Medium' && (
                                        <>
                                            <span>•</span>
                                            <span className={req.priority === 'High' ? 'text-red-500 font-medium' : ''}>{req.priority}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(req.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {completedRequests.length > 0 && (
                    <div className="pt-8">
                        <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest pl-1">Completed</h4>
                        <div className="grid gap-2 opacity-60 hover:opacity-100 transition-opacity">
                            {completedRequests.map(req => (
                                <div key={req.id} className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/50 rounded-lg">
                                    <button
                                        onClick={() => toggleStatus(req)}
                                        className="text-emerald-600"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <span className="flex-1 line-through text-muted-foreground decoration-border">
                                        {req.content}
                                    </span>
                                    <span className="text-[10px] uppercase text-muted-foreground px-2">{req.type}</span>
                                    <button
                                        onClick={() => handleDelete(req.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
