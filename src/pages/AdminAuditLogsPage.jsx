import React, { useState, useEffect } from 'react';
import { FileText, Filter, ShieldCheck, User, Clock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatDateTime } from '../utils/formatters';

export const AdminAuditLogsPage = () => {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs/');
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      showError('Failed to load system audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Immutable System Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">Traceability log of all administrative actions, financial approvals, and policy adjustments</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit entries found"
          description="System events will be recorded here automatically."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
          <Table>
            <TableHead>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHeaderCell className="text-slate-600">Timestamp</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Actor & Role</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Action Type</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Target Object</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">IP Address</TableHeaderCell>
                <TableHeaderCell className="text-slate-600 text-right">Details / Changes</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell>
                    <div className="text-xs font-semibold text-slate-700">{formatDateTime(log.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-slate-900">{log.actor_email}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">{log.actor_role}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700">{log.object_type}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-28">ID: {log.object_id}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[11px] font-mono text-slate-600 truncate block max-w-48 ml-auto">
                      {JSON.stringify(log.changes || {})}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
