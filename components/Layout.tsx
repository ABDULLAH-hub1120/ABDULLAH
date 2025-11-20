import React from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { APP_NAME } from '../config';
import { 
  LayoutDashboard, 
  CreditCard, 
  LogOut, 
  Settings, 
  Users, 
  ShieldCheck, 
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  view: 'dashboard' | 'pricing' | 'admin';
  setView: (view: 'dashboard' | 'pricing' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, view, setView }) => {
  const { currentUser, logout } = useGlobalState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ id, icon: Icon, label }: { id: 'dashboard' | 'pricing' | 'admin', icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        view === id 
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl">A</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu</div>
          
          <NavItem id="dashboard" icon={LayoutDashboard} label="Generate" />
          <NavItem id="pricing" icon={CreditCard} label="Buy Credits" />
          
          {currentUser?.role === 'admin' && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-4">Admin</div>
              <NavItem id="admin" icon={ShieldCheck} label="Admin Console" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="text-xs text-slate-400 mb-1">Current Plan</div>
            <div className="font-bold text-violet-400">{currentUser?.credits} Credits</div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <button 
            className="lg:hidden text-slate-400 p-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{currentUser?.name}</div>
              <div className="text-xs text-slate-400">{currentUser?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
