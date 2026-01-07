import Link from 'next/link';
import { Home, PieChart, Users, BookOpen, Settings } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - Distinct soft gray */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-primary font-bold text-lg tracking-tight">R² Portfolio</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <NavLink href="/" icon={<Home size={20} />} label="Dashboard" />
          <NavLink href="/companies" icon={<PieChart size={20} />} label="Portfolio Companies" />
          <NavLink href="/investors" icon={<Users size={20} />} label="Co-Investors" />
        </nav>

        {/* Footer / Settings */}
        <div className="p-4 border-t border-border">
          <Link href="/settings" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100/50 rounded-md transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-white rounded-md transition-all group"
    >
      <span className="group-hover:text-primary transition-colors">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
