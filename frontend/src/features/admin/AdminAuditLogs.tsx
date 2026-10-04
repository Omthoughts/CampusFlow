import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shield, Clock, Activity, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor?: {
    name: string;
    email: string;
  };
  metadata?: any;
}

export default function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const { data: logs = [], isLoading, error } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit');
      return res.data.data;
    }
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('PUBLISH')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPLOAD')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('AI_VERIFICATION') || action.includes('EXTRACT')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Security & Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Complete tamper-evident audit trail of all notice publications, AI summaries, and administrative actions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Actions</option>
            <option value="PUBLISH_NOTICE">Publish Notice</option>
            <option value="UPLOAD_DOCUMENT">Upload Document</option>
            <option value="AI_VERIFICATION_COMPLETE">AI Verification</option>
            <option value="CREATE_EVENT">Create Event</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading audit trail...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">Failed to load audit logs.</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No matching audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Metadata</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getActionBadgeColor(log.action)}`}>
                        <Activity className="h-3 w-3 mr-1" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {log.actor?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{log.actor?.name || 'System Actor'}</p>
                          <p className="text-[11px] text-slate-400">{log.actor?.email || 'system'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 text-xs">{log.entityType}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">{log.entityId}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400 mr-1" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
