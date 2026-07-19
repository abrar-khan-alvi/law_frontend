import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, FileText, Loader2, ShieldAlert, Building, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listAdminDocuments } from '../../api/adminPanel';

const DOC_TYPE_LABELS = {
  incident_report: 'Incident Report',
  search_warrant: 'Search Warrant',
  arrest_warrant: 'Arrest Warrant',
};

const REVIEW_STATUS_LABELS = {
  pending_supervisor: 'Pending Supervisor Review',
  pending_prosecutor: 'Pending Prosecutor Review',
  approved: 'Approved',
  rejected: 'Rejected',
  not_required: 'No Review Required',
};

const reviewBadgeClass = (reviewStatus) => {
  switch (reviewStatus) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending_supervisor':
    case 'pending_prosecutor':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function DocumentReview() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [docType, setDocType] = useState('');
  const [pendingOnly, setPendingOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  const searchTimeout = useRef(null);

  const fetchDocs = useCallback(async (p, q, type, onlyPending) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (q) params.q = q;
      if (type) params.doc_type = type;
      if (onlyPending) params.pending_review = true;

      const { data } = await listAdminDocuments(params);
      const results = data.results || data;
      setDocuments(results);
      setHasMore(!!data.next);
      setCount(data.count ?? results.length);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs(page, query, docType, pendingOnly);
  }, [fetchDocs, page, docType, pendingOnly]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchDocs(1, val, docType, pendingOnly);
    }, 500);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Document Review</h1>
          <p className="text-gray-500 mt-1">
            Approve or reject warrants and reports awaiting supervisor/prosecutor sign-off.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by officer email..."
              value={query}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={docType}
            onChange={(e) => { setDocType(e.target.value); setPage(1); }}
            className="w-full sm:w-52 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Document Types</option>
            <option value="incident_report">Incident Report</option>
            <option value="search_warrant">Search Warrant</option>
            <option value="arrest_warrant">Arrest Warrant</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={pendingOnly}
              onChange={(e) => { setPendingOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Pending review only
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Officer / Agency</th>
                <th className="px-6 py-4">Review Status</th>
                <th className="px-6 py-4">Flags</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && documents.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={24} /></td></tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">
                    {pendingOnly ? 'Nothing awaiting review right now.' : 'No documents found.'}
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const flagCount = (doc.leak_flag_count || 0) + (doc.quality_flag_count || 0);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400"><FileText size={18} /></div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                            </div>
                            <div className="text-xs text-gray-500">{doc.case_number || 'No case #'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{doc.user_email}</div>
                        {doc.agency_name && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building size={12} /> {doc.agency_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${reviewBadgeClass(doc.review_status)}`}>
                          {['pending_supervisor', 'pending_prosecutor'].includes(doc.review_status) && <ShieldAlert size={12} />}
                          {REVIEW_STATUS_LABELS[doc.review_status] || doc.review_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {flagCount > 0 ? (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                            {flagCount} flag{flagCount === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Clean</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/documents/${doc.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Review <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
