'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Database,
  UploadCloud,
  FileText,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Lock,
  ArrowUpRight,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { SCHEME_CATEGORIES, INDIAN_STATES } from '@/lib/data/sample-schemes';
import type { SchemeCategory } from '@/lib/types';

interface AdminStatus {
  schemesCount: number;
  customSchemesCount: number;
  chunksCount: number;
  aiProvider: string;
  model: string;
  embeddingModel: string;
  baseUrl: string;
}

interface SchemeListItem {
  id: string;
  name: string;
  slug: string;
  category: SchemeCategory;
  department: string;
  jurisdiction: string;
  isCustom: boolean;
  officialUrl?: string;
}

export function AdminPageClient() {
  const [adminKey, setAdminKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('yojnasetu_admin_key') || '';
    }
    return '';
  });
  const [keyInput, setKeyInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'add-scheme' | 'ingest-doc' | 'manage'>('add-scheme');
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form: Add Scheme
  const [schemeName, setSchemeName] = useState('');
  const [category, setCategory] = useState<SchemeCategory>('education');
  const [department, setDepartment] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Central');
  const [targetGroup, setTargetGroup] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [documentsText, setDocumentsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');

  // Form: Raw Document Ingest
  const [docTitle, setDocTitle] = useState('');
  const [docDept, setDocDept] = useState('');
  const [docJurisdiction, setDocJurisdiction] = useState('Central');
  const [docUrl, setDocUrl] = useState('');
  const [docContent, setDocContent] = useState('');

  const fetchStatusAndSchemes = useCallback(async (key: string) => {
    setIsLoadingStatus(true);
    try {
      const [statusRes, schemesRes] = await Promise.all([
        fetch('/api/admin/status', { headers: { 'x-admin-key': key } }),
        fetch('/api/admin/schemes', { headers: { 'x-admin-key': key } }),
      ]);

      if (!statusRes.ok || !schemesRes.ok) {
        throw new Error('Authentication failed. Please check your passcode.');
      }

      const statusData = await statusRes.json();
      const schemesData = await schemesRes.json();

      setStatus(statusData);
      setSchemes(schemesData.schemes || []);
      setIsAuthenticated(true);
      setAuthError('');
    } catch (err) {
      setIsAuthenticated(false);
      setAuthError(err instanceof Error ? err.message : 'Invalid admin passcode');
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Auto-fetch on mount if adminKey exists in sessionStorage
  useEffect(() => {
    let ignore = false;
    if (adminKey) {
      Promise.all([
        fetch('/api/admin/status', { headers: { 'x-admin-key': adminKey } }),
        fetch('/api/admin/schemes', { headers: { 'x-admin-key': adminKey } }),
      ])
        .then(async ([statusRes, schemesRes]) => {
          if (ignore) return;
          if (!statusRes.ok || !schemesRes.ok) {
            setIsAuthenticated(false);
            setAuthError('Authentication failed. Please check your passcode.');
            return;
          }
          const [statusData, schemesData] = await Promise.all([
            statusRes.json(),
            schemesRes.json(),
          ]);
          if (ignore) return;
          setStatus(statusData);
          setSchemes(schemesData.schemes || []);
          setIsAuthenticated(true);
          setAuthError('');
        })
        .catch((err) => {
          if (ignore) return;
          setIsAuthenticated(false);
          setAuthError(err instanceof Error ? err.message : 'Invalid admin passcode');
        });
    }
    return () => {
      ignore = true;
    };
  }, [adminKey]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem('yojnasetu_admin_key', keyInput.trim());
    setAdminKey(keyInput.trim());
    fetchStatusAndSchemes(keyInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yojnasetu_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
    setStatus(null);
  };

  // Submit New Scheme
  const handleAddScheme = async (e: FormEvent) => {
    e.preventDefault();
    if (!schemeName.trim() || !summary.trim() || !department.trim()) return;

    setIsSubmitting(true);
    setFeedbackNotice(null);

    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          name: schemeName,
          category,
          department,
          jurisdiction,
          targetGroup,
          summary,
          description: description || summary,
          benefits: benefitsText.split('\n').filter((l) => l.trim()),
          requiredDocuments: documentsText.split('\n').filter((l) => l.trim()),
          applicationSteps: stepsText.split('\n').filter((l) => l.trim()),
          officialUrl,
          sourceTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add scheme');

      setFeedbackNotice({
        type: 'success',
        message: `Scheme "${data.scheme.name}" successfully published and indexed (${data.chunksIngested} vector chunks created)!`,
      });

      // Reset form
      setSchemeName('');
      setDepartment('');
      setSummary('');
      setDescription('');
      setBenefitsText('');
      setDocumentsText('');
      setStepsText('');
      setOfficialUrl('');
      setSourceTitle('');

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error adding scheme',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Raw Document
  const handleIngestDocument = async (e: FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsSubmitting(true);
    setFeedbackNotice(null);

    try {
      const res = await fetch('/api/admin/ingest-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          title: docTitle,
          department: docDept,
          jurisdiction: docJurisdiction,
          sourceUrl: docUrl,
          content: docContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to ingest document');

      setFeedbackNotice({
        type: 'success',
        message: `Official document "${docTitle}" successfully chunked & embedded! ${data.chunksIngested} chunks added to vector store (Total in store: ${data.totalEntriesInStore}).`,
      });

      setDocTitle('');
      setDocDept('');
      setDocUrl('');
      setDocContent('');

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error ingesting document',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-index all vectors
  const handleReindex = async () => {
    if (!confirm('This will re-embed all schemes in the database into the vector store. Continue?')) {
      return;
    }

    setIsReindexing(true);
    setFeedbackNotice(null);

    try {
      const res = await fetch('/api/admin/reindex', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-indexing failed');

      setFeedbackNotice({
        type: 'success',
        message: `Re-indexing complete! Processed ${data.schemesProcessed} schemes into ${data.chunksIngested} vector entries.`,
      });

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to re-index',
      });
    } finally {
      setIsReindexing(false);
    }
  };

  // Delete custom scheme
  const handleDeleteScheme = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete custom scheme "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/schemes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setFeedbackNotice({
        type: 'success',
        message: `Deleted "${name}".`,
      });

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error deleting scheme',
      });
    }
  };

  // ================= RENDER: AUTH GATE =================
  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">YojnaSetu Administration</h1>
            <p className="text-xs text-slate-500">
              Enter your administrator passcode to upload official documents, add schemes, and manage vector indices.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Configured in .env.local as ADMIN_SECRET (default: admin123)</p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingStatus || !keyInput.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Admin Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= RENDER: ADMIN DASHBOARD =================
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-slate-50 pb-16">
      {/* Top Console Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              YS
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Document Ingestion & Scheme Admin</h1>
              <p className="text-xs text-slate-500">Live Vector Store & Semantic RAG Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReindex}
              disabled={isReindexing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Re-embeds all schemes into data/vector-store.json"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isReindexing ? 'Re-indexing...' : 'Re-index All Vectors'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
            >
              Lock Console
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Feedback alert */}
        {feedbackNotice && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${
              feedbackNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1 text-sm">{feedbackNotice.message}</div>
            <button
              type="button"
              onClick={() => setFeedbackNotice(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Vector & AI Metrics Bar */}
        {status && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Schemes Active</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{status.schemesCount}</span>
                {status.customSchemesCount > 0 && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    +{status.customSchemesCount} custom
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Vector Store Chunks</span>
              <div className="mt-1 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span className="text-2xl font-bold text-slate-900">{status.chunksCount}</span>
              </div>
              <span className="text-[10px] text-slate-400">data/vector-store.json</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">AI Provider</span>
              <div className="mt-1 font-bold text-slate-900 text-sm truncate">{status.model}</div>
              <span className="text-[10px] text-slate-500 truncate block">{status.baseUrl}</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Embeddings Model</span>
              <div className="mt-1 font-bold text-slate-900 text-sm truncate">{status.embeddingModel}</div>
              <span className="text-[10px] text-emerald-600 font-medium">1536 dimensions • Ready</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('add-scheme')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'add-scheme'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Scheme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ingest-doc')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'ingest-doc'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Official Gazette / Notification</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'manage'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage Indexed Schemes ({schemes.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: ADD STRUCTURED SCHEME ================= */}
        {activeTab === 'add-scheme' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Publish & Vector-Index a New Welfare Scheme</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter official scheme guidelines. Upon clicking Save, the system will automatically chunk, generate 1536-dimensional embeddings, and register the scheme into the RAG vector store and web directory.
              </p>
            </div>

            <form onSubmit={handleAddScheme} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheme Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    placeholder="e.g. PM Surya Ghar: Muft Bijli Yojana"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SchemeCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {Object.entries(SCHEME_CATEGORIES).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ministry / Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Ministry of New and Renewable Energy"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jurisdiction *
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Central">Central (All India)</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Beneficiary Group
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="e.g. Residential households seeking rooftop solar installations"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Summary (Brief Overview) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provides up to 300 units of free electricity every month to 1 crore households through rooftop solar subsidies..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the scheme context, budget allocation, and technical specifications..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Benefits (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    placeholder="Subsidies of ₹30,000 to ₹78,000&#10;Up to 300 units free power&#10;Net metering electricity export revenue"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Documents (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={documentsText}
                    onChange={(e) => setDocumentsText(e.target.value)}
                    placeholder="Electricity consumer bill&#10;Aadhaar Card of householder&#10;Bank account passbook&#10;Roof ownership proof"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Steps (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    placeholder="Step 1: Register on pmsuryaghar.gov.in&#10;Step 2: Submit DISCOM rooftop feasibility request&#10;Step 3: Installation by registered vendor&#10;Step 4: Net meter setup and DBT credit"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Portal URL
                  </label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://pmsuryaghar.gov.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Source / Gazette Title
                  </label>
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Operational Guidelines for PM Surya Ghar Yojana 2024"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Embedding & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Publish & Index into Vector Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 2: INGEST RAW GAZETTE NOTIFICATION ================= */}
        {activeTab === 'ingest-doc' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ingest Raw Gazette Circular or Press Notification</h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste official notification text directly. The AI pipeline will automatically extract paragraphs, generate semantic vector embeddings, and store citations so citizens can immediately query it in the Ask Assistant.
              </p>
            </div>

            <form onSubmit={handleIngestDocument} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Gazette Notification No. 12/2025: Income Criteria Update"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issuing Ministry / Department
                  </label>
                  <input
                    type="text"
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    placeholder="e.g. Department of Social Justice and Empowerment"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jurisdiction
                  </label>
                  <select
                    value={docJurisdiction}
                    onChange={(e) => setDocJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Central">Central (National)</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Gazette / Circular URL
                  </label>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://egazette.gov.in/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Document Text (Paste Gazette / Circular Content) *
                </label>
                <textarea
                  required
                  rows={10}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste the full text of the circular or notification here. Paragraphs will be automatically split and vectorized..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Minimum 50 characters required.</p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || docContent.trim().length < 50}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Splitting & Embedding Vectors...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Embed & Index Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 3: MANAGE SCHEMES ================= */}
        {activeTab === 'manage' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Indexed Welfare Schemes Registry</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  All active schemes currently searchable via RAG AI and the public catalog.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Scheme Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Jurisdiction</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs">
                        <div className="truncate">{scheme.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{scheme.id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs capitalize border border-slate-200 font-medium">
                          {scheme.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{scheme.department}</td>
                      <td className="px-4 py-3.5 text-slate-600">{scheme.jurisdiction}</td>
                      <td className="px-4 py-3.5">
                        {scheme.isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            Admin Upload
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                            System Base
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/schemes/${scheme.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                            title="View Scheme Page"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                          {scheme.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteScheme(scheme.id, scheme.name)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Scheme"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
