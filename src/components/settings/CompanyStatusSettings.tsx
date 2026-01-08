"use client";

import { Check, Plus, Trash2, X, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanyStatuses, saveCompanyStatuses } from "@/app/actions";

export function CompanyStatusSettings() {
    const [statuses, setStatuses] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<string | null>(null); // If null, adding new
    const [modalValue, setModalValue] = useState("");

    // Load statuses on mount
    useEffect(() => {
        getCompanyStatuses().then((s) => {
            setStatuses(s);
            setIsLoading(false);
        });
    }, []);

    const handleSaveList = async (newStatuses: string[]) => {
        setIsLoading(true);
        await saveCompanyStatuses(newStatuses);
        setStatuses(newStatuses);
        setIsLoading(false);
    };

    const handleDelete = async (statusToDelete: string) => {
        if (confirm(`Are you sure you want to delete status "${statusToDelete}"?`)) {
            const updated = statuses.filter(s => s !== statusToDelete);
            await handleSaveList(updated);
        }
    };

    const openAddCheck = () => {
        setEditingStatus(null);
        setModalValue("");
        setIsModalOpen(true);
    };

    const openEditCheck = (status: string) => {
        setEditingStatus(status);
        setModalValue(status);
        setIsModalOpen(true);
    };

    const handleSaveModal = async () => {
        if (!modalValue.trim()) return;
        const trimmed = modalValue.trim();

        if (editingStatus) {
            // Edit Mode
            if (trimmed !== editingStatus && statuses.includes(trimmed)) {
                alert("Status already exists.");
                return;
            }
            const updated = statuses.map(s => s === editingStatus ? trimmed : s);
            await handleSaveList(updated);
        } else {
            // Add Mode
            if (statuses.includes(trimmed)) {
                alert("Status already exists.");
                return;
            }
            const updated = [...statuses, trimmed];
            await handleSaveList(updated);
        }
        setIsModalOpen(false);
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
                    onClick={openAddCheck}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>Add Status</span>
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-border text-left">
                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status Name</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                        {statuses.map((status, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{status}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditCheck(status)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(status)}
                                            className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-foreground">{editingStatus ? 'Edit Status' : 'Add New Status'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">Status Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. In Due Diligence"
                                    className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={modalValue}
                                    onChange={(e) => setModalValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveModal();
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                            <button
                                onClick={handleSaveModal}
                                disabled={!modalValue.trim()}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Check size={16} />
                                <span>{editingStatus ? 'Save Changes' : 'Save Status'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
