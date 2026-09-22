'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Loader2, Shield, UserX, UserCheck, Trash2, AlertTriangle, X, Check, KeyRound
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'active' | 'disabled' | 'blocked';
type RoleFilter = 'all' | 'sender' | 'receiver' | 'admin';

interface ConfirmDialog {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'sender' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
    role === 'receiver' ? 'bg-lavender-100 text-lavender-700 border border-lavender-200' :
    'bg-amber-100 text-amber-700 border border-amber-200';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' :
    status === 'disabled' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
    'bg-red-100 text-red-600 border border-red-200';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [passwordUser, setPasswordUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState<ConfirmDialog>({
    open: false, title: '', message: '', confirmLabel: '', confirmClass: '', onConfirm: () => {}
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') list = list.filter(u => u.status === statusFilter);
    setFiltered(list);
    setPage(0);
  }, [users, search, roleFilter, statusFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const openConfirm = (title: string, message: string, confirmLabel: string, confirmClass: string, onConfirm: () => void) => {
    setConfirm({ open: true, title, message, confirmLabel, confirmClass, onConfirm });
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'disabled') => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) showToast('Failed to update status', 'error');
    else { showToast(`User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`); await fetchUsers(); }
    setActionLoading(null);
  };

  const handleRoleUpdate = async (userId: string, role: Exclude<RoleFilter, 'all'>) => {
    setActionLoading(`${userId}:role`);
    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) showToast('Failed to update role', 'error');
    else { showToast('User role updated'); await fetchUsers(); }
    setActionLoading(null);
  };

  const handlePasswordUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordUser || newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setActionLoading(`${passwordUser.id}:password`);
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`/api/admin/users/${passwordUser.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session?.access_token || ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) showToast(result.error || 'Failed to update password', 'error');
    else { showToast('Password updated successfully'); setPasswordUser(null); setNewPassword(''); }
    setActionLoading(null);
  };

  const handleBlock = async (userId: string) => {
    setActionLoading(userId);
    const { data: authData } = await supabase.auth.getUser();
    const { error: blockErr } = await supabase.from('blocked_users').insert({
      user_id: userId,
      reason: 'Blocked by admin',
      blocked_by: authData.user?.id,
    });
    if (!blockErr) {
      await supabase.from('profiles').update({ status: 'blocked', updated_at: new Date().toISOString() }).eq('id', userId);
      showToast('User blocked');
      await fetchUsers();
    } else showToast('Failed to block user', 'error');
    setActionLoading(null);
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) showToast('Failed to delete user', 'error');
    else { showToast('User deleted'); await fetchUsers(); }
    setActionLoading(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {passwordUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={handlePasswordUpdate} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-rose-700">Reset Password</h3>
                  <p className="text-xs text-rose-400/70">{passwordUser.email}</p>
                </div>
              </div>
              <label className="block text-sm font-medium text-rose-700 mb-2" htmlFor="new-password">New password</label>
              <input id="new-password" type="password" minLength={8} required value={newPassword} onChange={event => setNewPassword(event.target.value)}
                placeholder="At least 8 characters" autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-sm text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/50" />
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => { setPasswordUser(null); setNewPassword(''); }}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading === `${passwordUser.id}:password`}
                  className="px-4 py-2 rounded-xl text-sm text-white font-medium bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors">
                  {actionLoading === `${passwordUser.id}:password` ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirm.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-display text-lg font-bold text-rose-700">{confirm.title}</h3>
              </div>
              <p className="text-sm text-rose-400/80 mb-6">{confirm.message}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirm(c => ({ ...c, open: false }))}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => { confirm.onConfirm(); setConfirm(c => ({ ...c, open: false })); }}
                  className={`px-4 py-2 rounded-xl text-sm text-white font-medium transition-colors ${confirm.confirmClass}`}>
                  {confirm.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-rose-700">User Management</h1>
            <p className="text-sm text-rose-400/60">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/50" />
          <input
            type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/70 border border-rose-100 text-sm text-rose-700 placeholder:text-rose-400/40 focus:outline-none focus:ring-2 focus:ring-rose-300/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-rose-400/50" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as RoleFilter)}
            className="px-3 py-2 rounded-xl bg-white/70 border border-rose-100 text-sm text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/50">
            <option value="all">All Roles</option>
            <option value="sender">Sender</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 rounded-xl bg-white/70 border border-rose-100 text-sm text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/50">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-12 h-12 text-rose-300" />
            <p className="text-rose-400/60 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rose-100/50 bg-rose-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-rose-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {paged.map((user, i) => (
                  <motion.tr key={user.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-lavender-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-rose-700">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-rose-600/70">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <select value={user.role} disabled={actionLoading === `${user.id}:role`} onChange={event => handleRoleUpdate(user.id, event.target.value as Exclude<RoleFilter, 'all'>)}
                        aria-label={`Change role for ${user.name || user.email}`}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-100 text-xs font-semibold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/50 disabled:opacity-50">
                        <option value="sender">Sender</option>
                        <option value="receiver">Receiver</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={user.status} /></td>
                    <td className="px-5 py-3.5 text-rose-400/60 text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                        ) : (
                          <>
                            <button title="Reset password" onClick={() => setPasswordUser(user)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors">
                              <KeyRound className="w-4 h-4" />
                            </button>
                            {user.status === 'active' ? (
                              <button title="Disable user"
                                onClick={() => openConfirm('Disable User', `Are you sure you want to disable ${user.name}? They won't be able to login.`, 'Disable', 'bg-gray-500 hover:bg-gray-600', () => handleStatusUpdate(user.id, 'disabled'))}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : user.status === 'disabled' ? (
                              <button title="Enable user"
                                onClick={() => openConfirm('Enable User', `Re-enable ${user.name}?`, 'Enable', 'bg-green-500 hover:bg-green-600', () => handleStatusUpdate(user.id, 'active'))}
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : null}
                            {user.status !== 'blocked' && (
                              <button title="Block user"
                                onClick={() => openConfirm('Block User', `Block ${user.name} permanently? This will be logged.`, 'Block', 'bg-orange-500 hover:bg-orange-600', () => handleBlock(user.id))}
                                className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                                <Shield className="w-4 h-4" />
                              </button>
                            )}
                            <button title="Delete user"
                              onClick={() => openConfirm('Delete User', `Permanently delete ${user.name}? This cannot be undone.`, 'Delete', 'bg-red-500 hover:bg-red-600', () => handleDelete(user.id))}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-rose-400/60">
            Page {page + 1} of {totalPages} · {filtered.length} total
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 rounded-xl glass text-rose-600 disabled:opacity-40 hover:bg-rose-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-2 rounded-xl glass text-rose-600 disabled:opacity-40 hover:bg-rose-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
