
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addFeatureRequest, deleteFeatureRequest, updateFeatureRequest } from '@/app/actions';
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Link as LinkIcon, AlertCircle, Bug, Lightbulb, FileText, X } from 'lucide-react';

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
    const [newFileUrl, setNewFileUrl] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<{ name: string, url: string }[]>([]);

    const handleAddFile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFileUrl) return;

        // Simple validation or name extraction
        let name = "Attached Link";
        try {
            const url = new URL(newFileUrl);
            name = url.hostname + url.pathname.slice(0, 15) + (url.pathname.length > 15 ? '...' : '');
        } catch (e) {
            // Invalid URL, maybe let it slide or alert? For now gentle fallback
        }

        setAttachedFiles([...attachedFiles, { name, url: newFileUrl }]);
        setNewFileUrl('');
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
            <div className="bg-slate-50/50 p-4 rounded-xl border border-border space-y-4">
                <div className="flex gap-3">
                    <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="Feature">Feature</option>
                        <option value="Bug">Bug</option>
                        <option value="Report">Report</option>
                    </select>
                    <input
                        type="text"
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        placeholder="Describe the item..."
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={isPending || !newRequest.trim()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </div>

                {/* File Attachment Input (Lightweight) */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newFileUrl}
                            onChange={(e) => setNewFileUrl(e.target.value)}
                            placeholder="Paste link to file (Drive, Loom, Screenshot)..."
                            className="flex-1 px-3 py-1.5 rounded-md border border-border bg-white text-xs"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddFile(e)}
                        />
                        <button
                            type="button"
                            onClick={handleAddFile}
                            className="px-3 py-1.5 bg-slate-100 border border-border rounded-md text-xs font-medium hover:bg-slate-200"
                        >
                            Attach Link
                        </button>
                    </div>
                </div>

                {/* Staged Files */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {attachedFiles.map((f, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-dashed border-slate-300 rounded text-xs text-muted-foreground">
                                <LinkIcon size={10} />
                                <a href={f.url} target="_blank" className="hover:underline max-w-[150px] truncate">{f.name}</a>
                                <button onClick={() => removeFile(i)} className="ml-1 hover:text-red-500"><X size={12} /></button>
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
                                                <LinkIcon size={10} />
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
