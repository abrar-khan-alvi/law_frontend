import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Mail, Building, Loader2, Gavel, Users as UsersIcon, UserCheck, UserX, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react';
import { listAdminUsers, updateAdminUser, listAdminPlans, getStats } from '../../api/adminPanel';
import { listAgencies } from '../../api/agency';

const STAT_CARDS = [
  { key: 'total', label: 'Total Officers', icon: UsersIcon, color: 'blue' },
  { key: 'active', label: 'Active', icon: UserCheck, color: 'emerald' },
  { key: 'suspended', label: 'Suspended', icon: UserX, color: 'red' },
  { key: 'supervisors', label: 'Supervisors', icon: ShieldCheck, color: 'indigo' },
];

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600' },
};

// AdminUserSerializer only returns full_name (falls back to email when no
// name is on file), not first_name/last_name separately.
const initials = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supervisorOnly, setSupervisorOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const searchTimeout = useRef(null);

  const fetchUsers = useCallback(async (p, q, status, supOnly) => {
    setLoading(true);
    try {
      const params = { page: p, exclude_role: 'admin' };
      if (q) params.q = q;
      if (status) params.is_active = status === 'active';
      if (supOnly) params.is_supervisor = true;

      const { data } = await listAdminUsers(params);
      const results = data.results || data;
      setUsers(results);
      setHasMore(!!data.next);
      setCount(data.count ?? results.length);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(() => {
    getStats()
      .then(({ data }) => setStats(data.users))
      .catch((err) => console.error('Failed to fetch stats', err));
  }, []);

  useEffect(() => {
    fetchUsers(page, query, statusFilter, supervisorOnly);
  }, [fetchUsers, page, statusFilter, supervisorOnly]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    listAdminPlans()
      .then(({ data }) => setPlans(data))
      .catch((err) => console.error('Failed to fetch plans', err));
  }, []);

  useEffect(() => {
    listAgencies({ page_size: 100 })
      .then(({ data }) => setAgencies(data.results || data))
      .catch((err) => console.error('Failed to fetch agencies', err));
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val, statusFilter, supervisorOnly);
    }, 500);
  };

  const handleToggleStatus = async (user) => {
    setActionLoadingId(user.id);
    try {
      const { data } = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? data : u));
      fetchStats();
    } catch (err) {
      alert('Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSupervisor = async (user) => {
    setActionLoadingId(user.id);
    try {
      const { data } = await updateAdminUser(user.id, { is_supervisor: !user.is_supervisor });
      setUsers(users.map(u => u.id === user.id ? data : u));
      fetchStats();
    } catch (err) {
      alert('Failed to update supervisor status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeAgency = async (userId, agencyId) => {
    setActionLoadingId(userId);
    try {
      const { data } = await updateAdminUser(userId, { agency: agencyId === '' ? null : Number(agencyId) });
      setUsers(users.map(u => u.id === userId ? data : u));
    } catch (err) {
      alert('Failed to update agency assignment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangePlan = async (userId, planName) => {
    setActionLoadingId(userId);
    try {
      const { data } = await updateAdminUser(userId, { plan: planName });
      setUsers(users.map(u => u.id === userId ? data : u));
    } catch (err) {
      alert('Failed to update user subscription plan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const statValues = {
    total: stats?.officers ?? '—',
    active: stats?.active_officers ?? '—',
    suspended: stats?.suspended_officers ?? '—',
    supervisors: stats?.supervisors ?? '—',
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Officer Management</h1>
          <p className="text-gray-500 mt-1">Manage officer accounts, agency assignments, and access.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${COLOR_CLASSES[color].bg} rounded-full group-hover:scale-110 transition-transform duration-500`}></div>
            <div className="relative">
              <div className={`w-10 h-10 ${COLOR_CLASSES[color].icon} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{statValues[key]}</h3>
              <p className="text-xs font-medium text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email or badge..."
              value={query}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-44 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none sm:ml-auto">
            <input
              type="checkbox"
              checked={supervisorOnly}
              onChange={(e) => { setSupervisorOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Supervisors only
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Officer Details</th>
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                <tr><td colSpan="5" className="py-14 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={24} /></td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <UsersIcon className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500 font-medium">No officers found.</p>
                    <p className="text-gray-400 text-sm mt-0.5">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {initials(user.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {user.full_name}
                            {user.is_supervisor && (
                              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-0.5">
                                <Gavel size={10} /> Supervisor
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {user.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Badge: {user.badge_number || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Agency */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-gray-400 shrink-0" />
                        <select
                          value={user.agency ?? ''}
                          onChange={(e) => handleChangeAgency(user.id, e.target.value)}
                          disabled={actionLoadingId === user.id}
                          title="Assign to an agency — drives court captions, review workflow, and legal templates on generated warrants"
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                        >
                          <option value="">No Agency</option>
                          {agencies.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      {!user.agency && (
                        <div className="text-xs text-gray-400 mt-1 pl-[20px]">{user.department_name || 'No department on file'}</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Suspended
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      <select
                        value={user.subscription?.plan || user.plan || 'free'}
                        onChange={(e) => handleChangePlan(user.id, e.target.value)}
                        disabled={actionLoadingId === user.id}
                        className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.name}>{p.display_name}</option>
                        ))}
                        {plans.length === 0 && (
                          <option value="free">Free</option>
                        )}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {actionLoadingId === user.id ? (
                        <Loader2 className="animate-spin text-gray-400 inline-block" size={18} />
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleSupervisor(user)}
                            className={`p-2 rounded-lg transition-colors ${user.is_supervisor ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            title={user.is_supervisor ? 'Revoke supervisor review privileges' : 'Grant supervisor review privileges'}
                          >
                            <Gavel size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                            title={user.is_active ? 'Suspend account' : 'Activate account'}
                          >
                            {user.is_active ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && (page > 1 || hasMore) && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">Page {page} · {count} total</span>
            <button
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
