import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { api } from '../../lib/api';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  FileText, 
  Clock,
  Sparkles,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  link?: string;
}

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fetch notifications
  const { data: notifsData } = useQuery<{ data: NotificationItem[] }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    enabled: !!isAuthenticated,
  });

  const notifications = notifsData?.data || [];
  const unreadCount = notifications.filter(n => !n.readAt).length;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

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
    { name: 'Deadlines', href: '/deadlines', icon: Clock },
    { name: 'Events', href: '/events', icon: Sparkles },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  const canAccessAdmin = user.role === 'ADMIN' || user.role === 'FACULTY';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 text-primary font-bold text-xl">
          <GraduationCap className="h-6 w-6" />
          <span>CampusFlow</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
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
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
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
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Admin Portal Shortcut if permitted */}
          {canAccessAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Management
              </p>
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all"
              >
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Admin Portal</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {user.department || 'PES MCOE'} • {user.role}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-3.5 justify-between items-center sticky top-0 z-30 shadow-sm">
          {/* Audience Targeting Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <span className="px-2.5 py-1 bg-indigo-50 text-primary rounded-md font-bold">
              {user.department || 'MCA'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              Year {user.year || 'FY'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              Div {user.division || 'A'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              Batch {user.batch || 'F1'}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            {canAccessAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-slate-50 transition-colors ${
                            !notif.readAt ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {notif.type}
                            </span>
                            {!notif.readAt && (
                              <button
                                onClick={() => markOneReadMutation.mutate(notif.id)}
                                className="text-[10px] text-slate-400 hover:text-primary font-medium"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <Link 
                            to={notif.link || '/dashboard'}
                            onClick={() => setIsNotifOpen(false)}
                            className="block mt-1 font-semibold text-xs text-slate-900 hover:text-primary transition-colors"
                          >
                            {notif.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {notif.body}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      to="/notices"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View all official announcements →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
