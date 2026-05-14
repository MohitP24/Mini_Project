import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Activity, 
  Users, 
  Settings, 
  Search, 
  Bell,
  Menu,
  X,
  Play
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, active }: SidebarItemProps) => (
  <Link
    to={to}
    className={`flex items-center px-6 py-4 transition-all duration-200 group ${
      active 
        ? 'bg-sentinel-teal/20 border-r-4 border-sentinel-teal text-white' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 mr-4 ${active ? 'text-sentinel-teal' : 'group-hover:text-sentinel-teal'}`} />
    <span className="font-medium tracking-wide">{label}</span>
  </Link>
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className={`sidebar-gradient w-72 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-72'}`}>
        <div className="p-8 flex items-center">
          <div className="bg-sentinel-teal p-2 rounded-lg mr-3 shadow-glass">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tighter">SENTINEL</h1>
        </div>

        <nav className="mt-4 flex-grow">
          <SidebarItem 
            to="/" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={location.pathname === '/'} 
          />
          <SidebarItem 
            to="/events" 
            icon={Activity} 
            label="Event Timeline" 
            active={location.pathname === '/events'} 
          />
          <SidebarItem 
            to="/sessions" 
            icon={Users} 
            label="Session Explorer" 
            active={location.pathname === '/sessions'} 
          />
          <SidebarItem 
            to="/policies" 
            icon={Settings} 
            label="Policy Admin" 
            active={location.pathname === '/policies'} 
          />
          <SidebarItem 
            to="/simulation" 
            icon={Play} 
            label="What-If Simulation" 
            active={location.pathname === '/simulation'} 
          />
          <SidebarItem 
            to="/forensics" 
            icon={Search} 
            label="Forensics" 
            active={location.pathname === '/forensics'} 
          />
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <div className="flex items-center text-slate-400 hover:text-white cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-3 border border-white/10">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Security Admin</p>
              <p className="text-xs">Level 4 Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-transparent relative overflow-y-auto">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-4 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sentinel-teal" />
              <input 
                type="text" 
                placeholder="Search events, IPs, or sessions..." 
                className="bg-slate-900 border border-white/5 rounded-full py-2 pl-10 pr-4 w-80 text-sm focus:outline-none focus:border-sentinel-teal/50 focus:ring-1 focus:ring-sentinel-teal/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center px-3 py-1 rounded-full bg-sentinel-teal/10 border border-sentinel-teal/20">
              <div className="w-2 h-2 rounded-full bg-sentinel-teal animate-pulse mr-2"></div>
              <span className="text-xs font-semibold text-sentinel-teal uppercase tracking-widest">Gateway Live</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
