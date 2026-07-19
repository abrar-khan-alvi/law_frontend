import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Mail, Loader2, ShieldCheck, Ban, CheckCircle2, BadgeCheck } from 'lucide-react';
import { listAdminUsers, updateAdminUser, getStats } from '../../api/adminPanel';
import { useAuth } from '../../contexts/AuthContext';

// AdminUserSerializer only returns full_name (falls back to email when no
// name is on file), not first_name/last_name separately.
const initials = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdministratorManagement() {
  const { adminUser: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const searchTimeout = useRef(null);

  const fetchAdmins = useCallback(async (p, q) => {
    setLoading(true);
    try {
      const params = { page: p, role: 'admin' };
      if (q) params.q = q;
      const { data } = await listAdminUsers(params);
      const results = data.results || data;
      setAdmins(results);
      setHasMore(!!data.next);
      setCount(data.count ?? results.length);
    } catch (err) {
      console.error('Failed to fetch administrators', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins(page, query);
  }, [fetchAdmins, page]);

  useEffect(() => {
    getStats()
      .then(({ data }) => setTotalAdmins(data.users.admins))
      .catch((err) => console.error('Failed to fetch stats', err));
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchAdmins(1, val);
    }, 500);
  };

  const handleToggleStatus = async (admin) => {
    setActionLoadingId(admin.id);
    try {
      const { data } = await updateAdminUser(admin.id, { is_active: !admin.is_active });
      setAdmins(admins.map(a => a.id === admin.id ? data : a));
      setTotalAdmins((n) => n); // count unchanged by a status toggle
    } catch (err) {
      alert('Failed to update administrator status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administrators</h1>
          <p className="text-gray-500 mt-1">Platform admins with full access to every agency and officer.</p>
        </div>
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <ShieldCheck size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{totalAdmins ?? '—'}</h3>
            <p className="text-xs font-medium text-gray-500">Total Administrators</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6 flex items-start gap-2">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        Administrators bypass plan limits and agency scoping — grant this role sparingly. Role changes aren't available from this page; contact engineering to promote or demote an account.
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && admins.length === 0 ? (
                <tr><td colSpan="5" className="py-14 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={24} /></td></tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <ShieldCheck className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500 font-medium">No administrators found.</p>
                  </td>
                </tr>
              ) : (
                admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {initials(admin.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {admin.full_name}
                            {admin.email === currentUser?.email && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">You</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {admin.email}
                            {admin.email_verified && <BadgeCheck size={13} className="text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {admin.last_active ? new Date(admin.last_active).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {actionLoadingId === admin.id ? (
                        <Loader2 className="animate-spin text-gray-400 inline-block" size={18} />
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          disabled={admin.email === currentUser?.email}
                          title={admin.email === currentUser?.email ? "You can't suspend your own account" : (admin.is_active ? 'Suspend account' : 'Activate account')}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${admin.is_active ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                        >
                          {admin.is_active ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                        </button>
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
