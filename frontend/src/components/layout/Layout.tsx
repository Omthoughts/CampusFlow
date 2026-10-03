import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { api } from '../../lib/api';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
    logout();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Notices', href: '/notices', icon: FileText },
    { name: 'Deadlines', href: '/deadlines', icon: Bell },
    { name: 'Events & Calendar', href: '/calendar', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 text-primary font-bold text-xl">
          <GraduationCap className="h-6 w-6" />
          <span>CampusFlow</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-500 hover:text-slate-700"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col
        fixed md:sticky top-[61px] md:top-0 h-[calc(100vh-61px)] md:h-screen z-40 transition-all duration-300
      `}>
        <div className="p-6 hidden md:flex items-center space-x-2 text-primary font-bold text-2xl border-b border-slate-100">
          <GraduationCap className="h-8 w-8" />
          <span>CampusFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
