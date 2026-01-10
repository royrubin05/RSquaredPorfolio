'use client';

import { useState, useTransition } from 'react';
import { addTeamMember, deleteTeamMember } from '@/app/actions';
import { UserPlus, Trash2, Key, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) return;

        await addTeamMember({ name, email, password });
        setName('');
        setEmail('');
        setPassword('');
        startTransition(() => router.refresh());
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        await deleteTeamMember(id);
        startTransition(() => router.refresh());
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Team & Access
            </h3>

            {/* Add User Form */}
            <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="text-sm font-medium text-slate-700">Add New User</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text" required placeholder="Full Name"
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="email" required placeholder="Email Address"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text" required placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Create User
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-gray-50/50 px-4 py-3 border-b border-border text-xs font-medium text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                    <div className="col-span-4">User</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>
                <div className="divide-y divide-border">
                    {initialMembers.map(user => (
                        <div key={user.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors">
                            <div className="col-span-4 font-medium text-sm text-foreground">{user.name}</div>
                            <div className="col-span-4 text-sm text-muted-foreground">{user.email}</div>
                            <div className="col-span-2">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded textxs font-medium border border-blue-100">
                                    {user.role}
                                </span>
                            </div>
                            <div className="col-span-2 text-right">
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={isPending} // Should check if self-delete?
                                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
