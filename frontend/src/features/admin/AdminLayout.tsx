import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { 
  Settings, 
  Upload, 
  FileText, 
  List,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Client-side protection (backend enforces real protection)
  if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    logout();
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Settings },
    { name: 'Upload Notice', href: '/admin/notices/upload', icon: Upload },
    { name: 'Manage Notices', href: '/admin/notices', icon: FileText },
    { name: 'Manage Events', href: '/admin/events', icon: List },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col min-h-screen">
        <div className="p-6 flex items-center space-x-2 font-bold text-xl border-b border-slate-800">
          <Settings className="h-6 w-6 text-primary" />
          <span>Admin Portal</span>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <Link to="/dashboard" className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm px-4">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Student View</span>
          </Link>
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Admin Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
