'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addFeatureRequest, deleteFeatureRequest, updateFeatureRequest } from '@/app/actions';
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

interface FeatureRequest {
    id: string;
    content: string;
    status: string;
    priority: string;
    created_at: string;
}

export function FeatureRequestManager({ initialRequests }: { initialRequests: FeatureRequest[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [newRequest, setNewRequest] = useState('');

    // Optimistic UI could be added here, but for simplicity we rely on router.refresh()

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequest.trim()) return;

        await addFeatureRequest(newRequest);
        setNewRequest('');
        startTransition(() => {
            router.refresh();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this request?')) return;
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

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <form onSubmit={handleAdd} className="flex gap-3">
                <input
                    type="text"
                    value={newRequest}
                    onChange={(e) => setNewRequest(e.target.value)}
                    placeholder="Add a new feature request or note..."
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={isPending || !newRequest.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                </button>
            </form>

            {/* List */}
            <div className="space-y-4">
                {openRequests.length === 0 && completedRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                        No feature requests yet. Add one above!
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
                            <div className="flex-1">
                                <p className="text-foreground leading-relaxed">{req.content}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">
                                        {req.status}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
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
                    <div className="pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Completed</h4>
                        <div className="grid gap-2 opacity-60 hover:opacity-100 transition-opacity">
                            {completedRequests.map(req => (
                                <div key={req.id} className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/50 rounded-lg">
                                    <button
                                        onClick={() => toggleStatus(req)}
                                        className="text-emerald-600"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <span className="flex-1 li-through text-muted-foreground decoration-border">
                                        {req.content}
                                    </span>
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
