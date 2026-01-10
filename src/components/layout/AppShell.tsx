"use client";

import Link from 'next/link';
import { Home, PieChart, Users, BookOpen, Settings, Lightbulb, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - Richer, subtle gradient */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-gradient-to-b from-slate-50 to-white flex flex-col pt-2">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 mb-2">
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            R-Squared Ventures
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <NavLink href="/" icon={<Home size={20} />} label="Dashboard" />
          <NavLink href="/funds" icon={<BookOpen size={20} />} label="Funds" />
          <NavLink href="/companies" icon={<PieChart size={20} />} label="Portfolio Companies" />
          <NavLink href="/investors" icon={<Users size={20} />} label="Co-Investors" />
        </nav>

        {/* Footer / Settings */}
        <div className="p-4 border-t border-border/50 bg-slate-50/50 space-y-4">
          {/* Alpha Warning Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-amber-600 font-bold text-xs select-none">(!)</div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-800">System in Alpha</div>
                <p className="text-[10px] leading-relaxed text-amber-700/90">
                  Please verify all data and calculations independently.
                </p>
              </div>
            </div>
          </div>
          <NavLink href="/calculations" icon={<BookOpen size={20} />} label="Logic & Formulas" />
          <NavLink href="/features" icon={<Lightbulb size={20} />} label="Roadmap" />
          <NavLink href="/settings" icon={<Settings size={20} />} label="Settings" />

          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all mt-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="px-3 py-2 text-[10px] text-muted-foreground/40 font-mono text-center mt-2">
            v{process.env.NEXT_PUBLIC_GIT_COMMIT || '2.4.0-beta'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden relative bg-white">
        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
        ? 'bg-primary/10 text-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-slate-100'
        }`}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}

      <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span>{label}</span>

      {/* Hover Arrow */}
      {!isActive && (
        <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
          ›
        </span>
      )}
    </Link>
  );
}
