import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Database, Clock, Cpu, Download, Loader2, AlertTriangle,
  ShieldAlert, ShieldCheck, Gavel, Building, Mail,
} from 'lucide-react';
import { getAdminDocument } from '../../api/adminPanel';
import { exportDocument, supervisorReview, prosecutorReview } from '../../api/documents';

// exportDocument uses responseType: 'blob' so on error axios still hands back
// a Blob (not parsed JSON) in err.response.data — it must be read as text first.
const parseBlobError = async (err) => {
  const data = err?.response?.data;
  if (!(data instanceof Blob)) return err?.response?.data?.error;
  try {
    const text = await data.text();
    return JSON.parse(text)?.error;
  } catch {
    return undefined;
  }
};

const REVIEW_STATUS_LABELS = {
  pending_supervisor: 'Pending Supervisor Review',
  pending_prosecutor: 'Pending Prosecutor Review',
  approved: 'Approved',
  rejected: 'Rejected',
  not_required: 'No Review Required',
};
const SOURCE_LABELS = { llm: 'AI Review', structural: 'Structural Check', system: 'System' };

export default function AdminDocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [submittingSupervisor, setSubmittingSupervisor] = useState(false);
  const [prosecutorName, setProsecutorName] = useState('');
  const [prosecutorNotes, setProsecutorNotes] = useState('');
  const [submittingProsecutor, setSubmittingProsecutor] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchDoc = async () => {
    try {
      const { data } = await getAdminDocument(id);
      setDoc(data);
    } catch (err) {
      setError('Could not load document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExport = async (format) => {
    if (format === 'pdf') setExportingPdf(true);
    else setExportingDocx(true);
    setError('');
    try {
      const response = await exportDocument(id, { format });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.case_number || 'document'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const apiError = await parseBlobError(err);
      setError(apiError?.detail || `Failed to export ${format.toUpperCase()}.`);
    } finally {
      setExportingPdf(false);
      setExportingDocx(false);
    }
  };

  const handleSupervisorReview = async (approved) => {
    setSubmittingSupervisor(true);
    setReviewError('');
    try {
      // supervisorReview() hits the officer-facing endpoint, whose serializer
      // doesn't include user_email/agency_name (an officer always already
      // knows it's their own document) — merge rather than replace so the
      // admin-only identity fields already in state aren't wiped out.
      const { data } = await supervisorReview(id, { approved, notes: supervisorNotes });
      setDoc((prev) => ({ ...prev, ...data }));
      setSupervisorNotes('');
    } catch (err) {
      setReviewError(err?.response?.data?.error?.detail || 'Failed to submit supervisor review.');
    } finally {
      setSubmittingSupervisor(false);
    }
  };

  const handleProsecutorReview = async (approved) => {
    if (!prosecutorName.trim()) {
      setReviewError("Enter the prosecutor's name before recording their decision.");
      return;
    }
    setSubmittingProsecutor(true);
    setReviewError('');
    try {
      const { data } = await prosecutorReview(id, {
        reviewer_name: prosecutorName, approved, notes: prosecutorNotes,
      });
      setDoc((prev) => ({ ...prev, ...data }));
      setProsecutorNotes('');
    } catch (err) {
      setReviewError(err?.response?.data?.error?.detail || 'Failed to submit prosecutor review.');
    } finally {
      setSubmittingProsecutor(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 flex items-center gap-4">
        <AlertTriangle size={28} />
        <div>
          <h3 className="font-bold text-lg">Error Loading Document</h3>
          <p>{error || 'Document not found.'}</p>
        </div>
      </div>
    );
  }

  const qualityFlags = doc.quality_flags || [];
  const leakFlags = doc.leak_flags || [];
  const reviewStatus = doc.review_status;

  return (
    <div className="animate-in fade-in duration-500 pb-10 space-y-6">
      <Link to="/admin/documents" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Back to Document Review
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText size={26} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{doc.doc_type.replace('_', ' ')}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1.5">
              <span className="flex items-center gap-1"><Database size={14} /> {doc.case_number || 'No case #'}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(doc.created_at).toLocaleString()}</span>
              <span className="flex items-center gap-1"><Mail size={14} /> {doc.user_email}</span>
              {doc.agency_name && <span className="flex items-center gap-1"><Building size={14} /> {doc.agency_name}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('docx')}
            disabled={exportingDocx}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
          >
            {exportingDocx ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
            DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-70"
          >
            {exportingPdf ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Quality Review */}
      {qualityFlags.length > 0 && (
        <div className="bg-slate-800 text-slate-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2.5 bg-slate-700 rounded-xl shrink-0"><Gavel className="text-indigo-300" size={22} /></div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1">Constitutional Quality Review</h4>
            <p className="text-slate-300 text-sm mb-3">Compliance checks to resolve before this document is relied upon.</p>
            <ul className="space-y-2">
              {qualityFlags.map((flag, i) => (
                <li key={i} className="bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 flex items-start gap-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
                    {SOURCE_LABELS[flag.source] || flag.source || 'review'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{flag.issue}</p>
                    {flag.detail && <p className="text-xs text-slate-300 mt-0.5">{flag.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Leak flags */}
      {leakFlags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 rounded-xl shrink-0"><AlertTriangle className="text-amber-600" size={22} /></div>
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Potential Hallucination Detected</h4>
            <p className="text-amber-800 text-sm">The AI included details not found in the officer's provided notes.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {leakFlags.map((flag, i) => (
                <li key={i} className="text-xs bg-amber-100 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {flag.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Review & Signature */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-500" /> Review &amp; Signature
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-700'
              : reviewStatus === 'rejected' ? 'bg-red-100 text-red-700'
              : reviewStatus === 'not_required' ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {REVIEW_STATUS_LABELS[reviewStatus] || reviewStatus}
          </span>
        </div>

        {reviewError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{reviewError}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {doc.supervisor_reviewed_by_email && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Supervisor Review</p>
              <p className="text-gray-900 font-medium">{doc.supervisor_reviewed_by_email}</p>
              {doc.supervisor_notes && <p className="text-gray-600 mt-1">{doc.supervisor_notes}</p>}
              <p className="text-xs text-gray-400 mt-1">{new Date(doc.supervisor_reviewed_at).toLocaleString()}</p>
            </div>
          )}
          {doc.prosecutor_reviewed_name && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prosecutor Review</p>
              <p className="text-gray-900 font-medium">
                {doc.prosecutor_reviewed_name} — {doc.prosecutor_approved ? 'Approved' : 'Rejected'}
              </p>
              {doc.prosecutor_notes && <p className="text-gray-600 mt-1">{doc.prosecutor_notes}</p>}
              <p className="text-xs text-gray-400 mt-1">{new Date(doc.prosecutor_reviewed_at).toLocaleString()}</p>
            </div>
          )}
          {doc.signature_name && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Signed by Officer</p>
              <p className="text-emerald-900 font-medium font-serif italic text-base">{doc.signature_name}</p>
              <p className="text-xs text-emerald-600 mt-1">{new Date(doc.signed_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        {reviewStatus === 'pending_supervisor' && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Supervisor Decision</p>
            <textarea
              value={supervisorNotes}
              onChange={(e) => setSupervisorNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSupervisorReview(true)}
                disabled={submittingSupervisor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => handleSupervisorReview(false)}
                disabled={submittingSupervisor}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {reviewStatus === 'pending_prosecutor' && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Gavel size={16} className="text-gray-400" /> Record Prosecutor Decision
            </p>
            <input
              type="text"
              value={prosecutorName}
              onChange={(e) => setProsecutorName(e.target.value)}
              placeholder="Prosecutor's full name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              value={prosecutorNotes}
              onChange={(e) => setProsecutorNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleProsecutorReview(true)}
                disabled={submittingProsecutor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                Approved
              </button>
              <button
                onClick={() => handleProsecutorReview(false)}
                disabled={submittingProsecutor}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                Rejected
              </button>
            </div>
          </div>
        )}

        {!['pending_supervisor', 'pending_prosecutor'].includes(reviewStatus) && (
          <p className="text-sm text-gray-400 pt-2 border-t border-gray-100">
            {reviewStatus === 'not_required'
              ? "This document's agency doesn't require review."
              : 'No further review action is pending.'}
          </p>
        )}
      </div>

      {/* Narrative (read-only) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Generated Narrative</h3>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1"><Cpu size={14} /> {doc.model_used || 'Unknown'}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {(doc.generation_time_ms / 1000).toFixed(1)}s</span>
          </div>
        </div>
        <div className="p-6 md:p-8 text-gray-800 text-base leading-relaxed font-serif whitespace-pre-wrap">
          {doc.ai_narrative || <span className="text-gray-400 italic">No narrative generated.</span>}
        </div>
      </div>
    </div>
  );
}
