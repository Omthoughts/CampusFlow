import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Users, FileText, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard data.</div>;

  const stats = [
    { label: 'Total Students', value: data?.studentCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Notices', value: data?.activeNotices || 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Upcoming Events', value: data?.upcomingEvents || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Welcome to the CampusFlow Admin Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
