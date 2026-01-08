"use client";

import { Plus, Wallet, Edit2, Trash2, X, Check, Layers, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";
// import { INITIAL_FUNDS, INITIAL_INDUSTRIES } from "../../lib/constants"; // Removed
import { CompanyStatusSettings } from "./CompanyStatusSettings";
import { upsertFund, deleteFund, saveIndustries, upsertTeamMember, deleteTeamMember } from "@/app/actions";
import { useRouter } from "next/navigation";

interface SettingsPageProps {
    initialFunds?: any[];
    initialIndustries?: any[];
    initialTeam?: any[];
}

export function SettingsPage({ initialFunds = [], initialIndustries = [], initialTeam = [] }: SettingsPageProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'funds' | 'industries' | 'users' | 'statuses'>('funds');

    // Data State (synced with props)
    const [funds, setFunds] = useState(initialFunds);
    const [industries, setIndustries] = useState(initialIndustries);
    const [users, setUsers] = useState(initialTeam);

    useEffect(() => { setFunds(initialFunds); }, [initialFunds]);
    useEffect(() => { setIndustries(initialIndustries); }, [initialIndustries]);
    useEffect(() => { setUsers(initialTeam); }, [initialTeam]);

    // Modals
    const [isAddFundOpen, setIsAddFundOpen] = useState(false);
    const [isAddIndustryOpen, setIsAddIndustryOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const [selectedFund, setSelectedFund] = useState<any>(null);
    const [selectedIndustry, setSelectedIndustry] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // --- Handlers ---

    // Funds
    const handleDeleteFund = async (id: any) => {
        if (confirm("Are you sure you want to delete this fund?")) {
            await deleteFund(id); // Action revalidates
            // Optimistic update optional, but props update will follow
        }
    };
    const handleAddFund = async (newFund: any) => {
        // Optimistic UI could go here, but waiting for server is safer for IDs
        await upsertFund(newFund);
        setIsAddFundOpen(false);
        setSelectedFund(null);
    };
    const openEditFund = (fund: any) => { setSelectedFund(fund); setIsAddFundOpen(true); }

    // Industries
    const handleDeleteIndustry = async (name: string) => {
        if (confirm("Are you sure you want to delete this industry tag?")) {
            const newList = industries.filter(i => i.name !== name).map(i => i.name);
            await saveIndustries(newList);
        }
    };
    const handleAddIndustry = async (name: string) => {
        // If editing, we actually just remove old and add new (simple replace for tags)
        let newList = industries.map(i => i.name);

        if (selectedIndustry) {
            newList = newList.map(n => n === selectedIndustry.name ? name : n);
        } else {
            if (!newList.includes(name)) newList.push(name);
        }

        await saveIndustries(newList);
        setIsAddIndustryOpen(false);
        setSelectedIndustry(null);
    };
    const openEditIndustry = (industry: any) => { setSelectedIndustry(industry); setIsAddIndustryOpen(true); }

    // Users
    const handleDeleteUser = async (id: any) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteTeamMember(id);
        }
    };
    const handleAddUser = async (user: any) => {
        await upsertTeamMember(user);
        setIsAddUserOpen(false);
        setSelectedUser(null);
    };
    const openEditUser = (user: any) => { setSelectedUser(user); setIsAddUserOpen(true); }


    return (
        <div className="flex-1 w-full p-6 md:p-8">
            <AddFundModal
                isOpen={isAddFundOpen}
                onClose={() => { setIsAddFundOpen(false); setSelectedFund(null); }}
                onSave={handleAddFund}
                initialData={selectedFund}
            />
            <AddIndustryModal
                isOpen={isAddIndustryOpen}
                onClose={() => { setIsAddIndustryOpen(false); setSelectedIndustry(null); }}
                onSave={handleAddIndustry}
                initialData={selectedIndustry}
            />

            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => { setIsAddUserOpen(false); setSelectedUser(null); }}
                onSave={handleAddUser}
                initialData={selectedUser}
            />

            <div className="w-full max-w-4xl">
                {/* Page Header */}
                <div className="mb-8 border-b border-border pb-6">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage global configurations, funds, and taxonomy.</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-border mb-8 overflow-x-auto">
                    <TabButton
                        active={activeTab === 'funds'}
                        onClick={() => setActiveTab('funds')}
                        label="Fund Management"
                        icon={<Wallet size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'industries'}
                        onClick={() => setActiveTab('industries')}
                        label="Industries"
                        icon={<Layers size={16} />}
                    />

                    <TabButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                        label="User Management"
                        icon={<Users size={16} />}
                    />
                    <TabButton
                        active={activeTab === 'statuses'}
                        onClick={() => setActiveTab('statuses')}
                        label="Company Statuses"
                        icon={<Activity size={16} />}
                    />
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">

                    {/* STATUSES TAB */}
                    {activeTab === 'statuses' && <CompanyStatusSettings />}

                    {/* FUNDS TAB */}
                    {activeTab === 'funds' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-medium text-foreground">Active Funds</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Manage your active checkbooks and capital commitments.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddFundOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    <Plus size={16} />
                                    <span>Add Fund</span>
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b border-border text-left">
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Fund Name</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Vintage</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Committed Capital</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Deployed</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-white">
                                        {funds.map((fund) => (
                                            <tr key={fund.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground">{fund.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-mono">{fund.vintage}</td>
                                                <td className="px-6 py-4 text-right font-mono text-foreground">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: fund.currency, maximumFractionDigits: 0 }).format(fund.committed)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: fund.currency, maximumFractionDigits: 0 }).format(fund.deployed)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditFund(fund)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFund(fund.id)}
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
                        </div>
                    )}

                    {/* INDUSTRIES TAB */}
                    {activeTab === 'industries' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-medium text-foreground">Industry Tags</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Standardize investment sectors across your portfolio.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddIndustryOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    <Plus size={16} />
                                    <span>Add Industry</span>
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b border-border text-left">
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Industry Name</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Companies</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-white">
                                        {industries.map((industry) => (
                                            <tr key={industry.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground">{industry.name}</td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">{industry.companies}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditIndustry(industry)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteIndustry(industry.name)}
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
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-medium text-foreground">User Management</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Control access to the platform.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddUserOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    <Plus size={16} />
                                    <span>Add User</span>
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b border-border text-left">
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">User</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Role</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-white">
                                        {users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-foreground">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditUser(user)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

function AddIndustryModal({ isOpen, onClose, onSave, initialData }: { isOpen: boolean; onClose: () => void; onSave: (name: string) => void; initialData?: any }) {
    const [name, setName] = useState(initialData ? initialData.name : '');

    // Reset or update when initialData changes
    if (initialData && name !== initialData.name) setName(initialData.name);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-foreground">{initialData ? 'Edit Industry' : 'Add New Industry'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Industry Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Biotechnology"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && name) {
                                    onSave(name);
                                    setName('');
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                    <button
                        onClick={() => {
                            onSave(name);
                            setName('');
                        }}
                        disabled={!name}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Check size={16} />
                        <span>{initialData ? 'Save Changes' : 'Add Industry'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function AddFundModal({ isOpen, onClose, onSave, initialData }: { isOpen: boolean; onClose: () => void; onSave: (fund: any) => void; initialData?: any }) {
    const [formData, setFormData] = useState(initialData || { name: '', vintage: '', committed: '', currency: 'USD' });

    // Update effect for initialData would be better, but simple inline init for now:
    if (isOpen && initialData && formData.name !== initialData.name) {
        setFormData(initialData);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-foreground">{initialData ? 'Edit Fund' : 'Add New Fund'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Fund Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Fund IV"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Vintage</label>
                            <input
                                type="text"
                                placeholder="2026"
                                className="w-full px-4 py-2 border border-border rounded-md text-sm font-mono"
                                value={formData.vintage}
                                onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Currency</label>
                            <select
                                className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Committed Capital</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{formData.currency}</span>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm font-mono"
                                value={formData.committed}
                                onChange={(e) => setFormData({ ...formData, committed: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                    <button
                        onClick={() => {
                            onSave({ ...formData, committed: Number(formData.committed) });
                            setFormData({ name: '', vintage: '', committed: '', currency: 'USD' }); // Reset
                        }}
                        disabled={!formData.name || !formData.committed}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Check size={16} />
                        <span>{initialData ? 'Save Changes' : 'Create Fund'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}



function AddUserModal({ isOpen, onClose, onSave, initialData }: { isOpen: boolean; onClose: () => void; onSave: (user: any) => void; initialData?: any }) {
    const [formData, setFormData] = useState(initialData || { name: '', email: '', role: 'Admin' });

    // Update effect for initialData
    if (isOpen && initialData && formData.name !== initialData.name) {
        setFormData(initialData);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-foreground">{initialData ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Full Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Jane Doe"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Email Address</label>
                        <input
                            type="email"
                            placeholder="jane@example.com"
                            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Role</label>
                        <select
                            className="w-full px-4 py-2 border border-border rounded-md text-sm bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Viewer">Viewer (Read Only)</option>
                        </select>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-gray-50/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                    <button
                        onClick={() => {
                            onSave(formData);
                            setFormData({ name: '', email: '', role: 'Admin' });
                        }}
                        disabled={!formData.name || !formData.email}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Check size={16} />
                        <span>{initialData ? 'Save Changes' : 'Invite User'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
