import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Power, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { formatDate } from '../utils/formatters';

export const AdminOwnersPage = () => {
  const { showSuccess, showError } = useToast();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/owners/?${params.toString()}`);
      if (res.success) {
        setOwners(res.data);
      }
    } catch (err) {
      showError('Failed to load hall owners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [statusFilter]);

  useEffect(() => {
    if (owners.length && !selectedOwnerId) {
      setSelectedOwnerId(owners[0].id);
    }

    if (selectedOwnerId && !owners.some((owner) => owner.id === selectedOwnerId)) {
      setSelectedOwnerId(owners[0]?.id || null);
    }
  }, [owners, selectedOwnerId]);

  const selectedOwner = owners.find((owner) => owner.id === selectedOwnerId) || null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOwners();
  };

  const handleOwnerAction = async (ownerId, actionName, ownerName) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/owners/${ownerId}/action/`, { action: actionName });
      if (res.success) {
        showSuccess(res.message);
        fetchOwners();
      }
    } catch (err) {
      showError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hall Owner Management</h1>
          <p className="text-sm text-slate-500 mt-1">Verify business registrations, monitor active listings, and manage account suspensions</p>
        </div>
      </div>

      {/* Search & Filter Bar (Wireframe Admin Screen 2) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search owner or business name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <Button type="submit" variant="primary" size="sm" icon={Search}>
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
          >
            <option value="">All Owner States</option>
            <option value="ACTIVE">Active & Verified</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {selectedOwner && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-[0_12px_28px_rgba(99,102,241,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600">Owner verification review</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">{selectedOwner.full_name}</h2>
              <p className="text-sm text-slate-500">{selectedOwner.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(selectedOwner.verification_status === 'PENDING' || selectedOwner.verification_status === 'REJECTED') && (
                <Button
                  variant="success"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleOwnerAction(selectedOwner.id, 'APPROVE', selectedOwner.full_name)}
                  disabled={actionLoading}
                >
                  Approve
                </Button>
              )}
              {(selectedOwner.verification_status === 'PENDING' || selectedOwner.verification_status === 'REJECTED' || selectedOwner.verification_status === 'VERIFIED') && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={XCircle}
                  onClick={() => handleOwnerAction(selectedOwner.id, 'REJECT', selectedOwner.full_name)}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              )}
              {selectedOwner.verification_status === 'VERIFIED' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={ShieldAlert}
                  onClick={() => handleOwnerAction(selectedOwner.id, 'SUSPEND', selectedOwner.full_name)}
                  disabled={actionLoading}
                >
                  Suspend
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Business</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{selectedOwner.business_name || 'Individual host'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Locality</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{selectedOwner.locality || selectedOwner.city || 'Hyderabad'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Venues</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{selectedOwner.venue_count} listed</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</div>
              <div className="mt-1">
                <Badge variant={selectedOwner.verification_status === 'VERIFIED' ? 'success' : selectedOwner.verification_status === 'PENDING' ? 'warning' : 'danger'} size="sm">
                  {selectedOwner.verification_status}
                </Badge>
              </div>
            </div>
          </div>

          {(selectedOwner.id_proof_url || selectedOwner.business_proof_url) && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedOwner.id_proof_url && (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">ID Proof</div>
                  <a href={selectedOwner.id_proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900">
                    View document
                  </a>
                </div>
              )}
              {selectedOwner.business_proof_url && (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Business Proof</div>
                  <a href={selectedOwner.business_proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900">
                    View document
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Owners Table (Wireframe Admin Screen 2) */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : owners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No venue owners found"
          description="There are no hall owners matching your search criteria."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
          <Table>
            <TableHead>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHeaderCell className="text-slate-600">Owner Name & Email</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Business / Venue Name</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Locality</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Venues</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Status</TableHeaderCell>
                <TableHeaderCell className="text-slate-600">Joined</TableHeaderCell>
                <TableHeaderCell className="text-slate-600 text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {owners.map((owner) => {
                const isUnderReview = owner.verification_status === 'PENDING';
                const isRejected = owner.verification_status === 'REJECTED';
                const isSuspended = !owner.is_active || owner.verification_status === 'SUSPENDED';
                const isActive = owner.is_active && owner.verification_status === 'VERIFIED';

                return (
                  <TableRow
                    key={owner.id}
                    className={`border-slate-200 hover:bg-slate-50 cursor-pointer ${selectedOwnerId === owner.id ? 'bg-indigo-50/80' : ''}`}
                    onClick={() => setSelectedOwnerId(owner.id)}
                  >
                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">{owner.full_name}</div>
                      <div className="text-xs text-slate-500">{owner.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-700">{owner.business_name || 'Individual Host'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">{owner.locality || owner.city}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">{owner.venue_count} Halls</Badge>
                    </TableCell>
                    <TableCell>
                      {isActive && <Badge variant="success" size="sm">Active</Badge>}
                      {isUnderReview && <Badge variant="warning" size="sm">Under Review</Badge>}
                      {isRejected && <Badge variant="danger" size="sm">Rejected</Badge>}
                      {isSuspended && <Badge variant="danger" size="sm">Suspended</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(owner.joined_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(isUnderReview || isRejected) && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleOwnerAction(owner.id, 'APPROVE', owner.full_name)}
                            disabled={actionLoading}
                          >
                            Approve
                          </Button>
                        )}
                        {(isUnderReview || isRejected || isActive) && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleOwnerAction(owner.id, 'REJECT', owner.full_name)}
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={ShieldAlert}
                            onClick={() => handleOwnerAction(owner.id, 'SUSPEND', owner.full_name)}
                            disabled={actionLoading}
                          >
                            Suspend
                          </Button>
                        )}
                        {isSuspended && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => handleOwnerAction(owner.id, 'REACTIVATE', owner.full_name)}
                            disabled={actionLoading}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
