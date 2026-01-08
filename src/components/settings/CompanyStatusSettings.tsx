"use client";

import { Check, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanyStatuses, saveCompanyStatuses } from "@/app/actions";

export function CompanyStatusSettings() {
    const [statuses, setStatuses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    // Load statuses on mount
    useEffect(() => {
        getCompanyStatuses().then((s) => {
            setStatuses(s);
            setIsLoading(false);
        });
    }, []);

    const handleSaveStatuses = async (newStatuses: string[]) => {
        setIsLoading(true);
        await saveCompanyStatuses(newStatuses);
        setStatuses(newStatuses);
        setIsLoading(false);
    };

    const handleDelete = async (statusToDelete: string) => {
        if (confirm(`Are you sure you want to delete status "${statusToDelete}"?`)) {
            const updated = statuses.filter(s => s !== statusToDelete);
            await handleSaveStatuses(updated);
        }
    };

    const handleAdd = async () => {
        if (!newStatus.trim()) return;
        if (statuses.includes(newStatus.trim())) {
            alert("Status already exists.");
            return;
        }

        const updated = [...statuses, newStatus.trim()];
        await handleSaveStatuses(updated);
        setNewStatus("");
        setIsAddOpen(false);
    };

    if (isLoading) return <div className="text-sm text-muted-foreground p-4">Loading statuses...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-lg font-medium text-foreground">Company Statuses</h2>
                    <p className="text-sm text-muted-foreground mt-1">Customize the lifecycle stages for your portfolio companies.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>Add Status</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statuses.map((status, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center group hover:border-primary/30 transition-all hover:shadow-sm">
                        <span className="text-sm font-medium text-foreground">{status}</span>
                        <button
                            onClick={() => handleDelete(status)}
                            className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-foreground">Add New Status</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">Status Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. In Due Diligence"
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdd();
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                            <button
                                onClick={handleAdd}
                                disabled={!newStatus.trim()}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Check size={16} />
                                <span>Save Status</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
