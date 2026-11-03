'use client';

import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
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
  FileUp,
  Sparkles,
  Upload,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  UserCheck,
  LayoutDashboard,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Settings2,
  HelpCircle,
  Activity,
  FileCheck,
  Radio,
  BookOpen,
} from 'lucide-react';
import { SCHEME_CATEGORIES, INDIAN_STATES } from '@/lib/data/sample-schemes';
import type { Scheme, SchemeCategory, EligibilityCriterion } from '@/lib/types';

interface AdminStatus {
  schemesCount: number;
  customSchemesCount: number;
  chunksCount: number;
  aiProvider: string;
  model: string;
  embeddingModel: string;
  dimensions?: number;
  baseUrl: string;
}

type SchemeWithCustom = Scheme & { isCustom?: boolean };
type AdminView = 'overview' | 'schemes' | 'publish' | 'ingest' | 'engine';

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

  // Main View Navigation
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [schemes, setSchemes] = useState<SchemeWithCustom[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Edit Mode State
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);

  // Form: Add/Edit Scheme
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

  // Eligibility Criteria Builder State
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [maxIncome, setMaxIncome] = useState<string>('');
  const [genderReq, setGenderReq] = useState<string>('any');
  const [categoryReq, setCategoryReq] = useState<string>('all');
  const [isStudentReq, setIsStudentReq] = useState<boolean>(false);
  const [isBPLReq, setIsBPLReq] = useState<boolean>(false);
  const [isDisabledReq, setIsDisabledReq] = useState<boolean>(false);

  // Form: Raw Document Ingest
  const [docTitle, setDocTitle] = useState('');
  const [docDept, setDocDept] = useState('');
  const [docJurisdiction, setDocJurisdiction] = useState('Central');
  const [docUrl, setDocUrl] = useState('');
  const [docContent, setDocContent] = useState('');

  // AI PDF Parse & Auto-fill State
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [uploadedPages, setUploadedPages] = useState<number | null>(null);

  // Raw Document PDF Extraction
  const [isUploadingDocPdf, setIsUploadingDocPdf] = useState(false);
  const [docPdfError, setDocPdfError] = useState<string | null>(null);

  // Bulk JSON Import State
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);

  // Scheme Management Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState<'all' | 'custom' | 'system'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

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

  const resetSchemeForm = () => {
    setEditingSchemeId(null);
    setSchemeName('');
    setCategory('education');
    setDepartment('');
    setJurisdiction('Central');
    setTargetGroup('');
    setSummary('');
    setDescription('');
    setBenefitsText('');
    setDocumentsText('');
    setStepsText('');
    setOfficialUrl('');
    setSourceTitle('');
    setMinAge('');
    setMaxAge('');
    setMaxIncome('');
    setGenderReq('any');
    setCategoryReq('all');
    setIsStudentReq(false);
    setIsBPLReq(false);
    setIsDisabledReq(false);
  };

  // Upload and parse official scheme PDF via AI
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfUploadError('Please select a valid PDF file.');
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadError(null);
    setUploadedPdfName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/parse-pdf', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse scheme document');
      }

      const { extracted, totalPages } = data;
      setUploadedPages(totalPages || null);

      if (extracted) {
        if (extracted.name) setSchemeName(extracted.name);
        if (extracted.category && Object.keys(SCHEME_CATEGORIES).includes(extracted.category)) {
          setCategory(extracted.category as SchemeCategory);
        }
        if (extracted.department) setDepartment(extracted.department);
        if (extracted.jurisdiction) {
          if (
            extracted.jurisdiction.toLowerCase().includes('central') ||
            extracted.jurisdiction.toLowerCase().includes('all india')
          ) {
            setJurisdiction('Central');
          } else {
            const matchedState = INDIAN_STATES.find((s) =>
              extracted.jurisdiction.toLowerCase().includes(s.toLowerCase())
            );
            setJurisdiction(matchedState || extracted.jurisdiction);
          }
        }
        if (extracted.targetGroup) setTargetGroup(extracted.targetGroup);
        if (extracted.summary) setSummary(extracted.summary);
        if (extracted.description) setDescription(extracted.description);
        if (Array.isArray(extracted.benefits)) setBenefitsText(extracted.benefits.join('\n'));
        if (Array.isArray(extracted.requiredDocuments)) setDocumentsText(extracted.requiredDocuments.join('\n'));
        if (Array.isArray(extracted.applicationSteps)) setStepsText(extracted.applicationSteps.join('\n'));
        if (extracted.officialUrl) setOfficialUrl(extracted.officialUrl);
        if (extracted.sourceTitle) setSourceTitle(extracted.sourceTitle);

        // Demographic & Eligibility Auto-fills from PDF
        if (typeof extracted.minAge === 'number') setMinAge(String(extracted.minAge));
        if (typeof extracted.maxAge === 'number') setMaxAge(String(extracted.maxAge));
        if (typeof extracted.maxIncome === 'number') setMaxIncome(String(extracted.maxIncome));
        if (extracted.gender && ['female', 'male', 'transgender'].includes(extracted.gender.toLowerCase())) {
          setGenderReq(extracted.gender.toLowerCase());
        }
        if (extracted.casteCategory && ['SC', 'ST', 'OBC', 'General'].includes(extracted.casteCategory)) {
          setCategoryReq(extracted.casteCategory);
        }
        if (typeof extracted.isStudent === 'boolean') setIsStudentReq(extracted.isStudent);
        if (typeof extracted.isBPL === 'boolean') setIsBPLReq(extracted.isBPL);
        if (typeof extracted.isDisabled === 'boolean') setIsDisabledReq(extracted.isDisabled);

        setCurrentView('publish');
        setFeedbackNotice({
          type: 'success',
          message: `AI successfully analyzed "${file.name}"! Form fields and eligibility rules have been auto-populated. Please verify details before publishing.`,
        });
      }
    } catch (err) {
      setPdfUploadError(err instanceof Error ? err.message : 'Failed to parse PDF document');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  // Upload and extract text for Tab Ingest
  const handleDocPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setDocPdfError('Please select a valid PDF file.');
      return;
    }

    setIsUploadingDocPdf(true);
    setDocPdfError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/parse-pdf', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse gazette document');
      }

      if (data.rawText) {
        setDocContent(data.rawText);
      }
      if (data.extracted?.name) {
        setDocTitle(data.extracted.name);
      } else if (file.name) {
        setDocTitle(file.name.replace(/\.pdf$/i, ''));
      }
      if (data.extracted?.department) {
        setDocDept(data.extracted.department);
      }
      if (data.extracted?.jurisdiction) {
        setDocJurisdiction(data.extracted.jurisdiction);
      }

      setCurrentView('ingest');
      setFeedbackNotice({
        type: 'success',
        message: `Extracted text from "${file.name}" into document content!`,
      });
    } catch (err) {
      setDocPdfError(err instanceof Error ? err.message : 'Failed to parse document PDF');
    } finally {
      setIsUploadingDocPdf(false);
      e.target.value = '';
    }
  };

  // Bulk import multiple schemes from JSON file
  const handleBulkJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkImporting(true);
    setBulkImportError(null);

    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Selected file is not valid JSON. Please check file formatting.');
      }

      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to bulk import schemes');
      }

      const count = data.count || (data.scheme ? 1 : 0);
      setFeedbackNotice({
        type: 'success',
        message: `Successfully bulk-imported ${count} schemes (${data.chunksIngested} vector chunks indexed)!`,
      });

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setBulkImportError(err instanceof Error ? err.message : 'Failed to import JSON dataset');
    } finally {
      setIsBulkImporting(false);
      e.target.value = '';
    }
  };

  // Load a scheme into the edit form
  const handleEditScheme = (scheme: SchemeWithCustom) => {
    setEditingSchemeId(scheme.id);
    setSchemeName(scheme.name || '');
    setCategory(scheme.category || 'education');
    setDepartment(scheme.department || '');
    setJurisdiction(scheme.jurisdiction || 'Central');
    setTargetGroup(scheme.targetGroup || '');
    setSummary(scheme.summary || '');
    setDescription(scheme.description || '');
    setBenefitsText(Array.isArray(scheme.benefits) ? scheme.benefits.join('\n') : '');
    setDocumentsText(Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.join('\n') : '');
    setStepsText(Array.isArray(scheme.applicationSteps) ? scheme.applicationSteps.join('\n') : '');
    setOfficialUrl(scheme.officialUrl || '');
    setSourceTitle(scheme.sources?.[0]?.title || '');

    // Reset criteria fields first
    setMinAge('');
    setMaxAge('');
    setMaxIncome('');
    setGenderReq('any');
    setCategoryReq('all');
    setIsStudentReq(false);
    setIsBPLReq(false);
    setIsDisabledReq(false);

    // Parse existing criteria if present
    if (Array.isArray(scheme.eligibilityCriteria)) {
      scheme.eligibilityCriteria.forEach((crit) => {
        if (crit.field === 'age') {
          if (crit.operator === 'gte' || crit.operator === 'gt') setMinAge(String(crit.value));
          if (crit.operator === 'lte' || crit.operator === 'lt') setMaxAge(String(crit.value));
        } else if (crit.field === 'annual_family_income' || crit.field === 'annualIncome') {
          setMaxIncome(String(crit.value));
        } else if (crit.field === 'gender') {
          setGenderReq(String(crit.value).toLowerCase());
        } else if (crit.field === 'category') {
          setCategoryReq(String(crit.value));
        } else if (crit.field === 'is_student' || crit.field === 'isStudent') {
          setIsStudentReq(Boolean(crit.value));
        } else if (crit.field === 'is_bpl' || crit.field === 'isBPL') {
          setIsBPLReq(Boolean(crit.value));
        } else if (crit.field === 'is_disabled' || crit.field === 'isDisabled') {
          setIsDisabledReq(Boolean(crit.value));
        }
      });
    }

    setCurrentView('publish');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compile structured eligibility criteria from form inputs
  const buildEligibilityCriteria = (slugBase: string): EligibilityCriterion[] => {
    const criteria: EligibilityCriterion[] = [];

    if (minAge.trim() && !isNaN(Number(minAge))) {
      criteria.push({
        id: `crit-${slugBase}-min-age`,
        field: 'age',
        label: 'Minimum Age Requirement',
        description: `Applicant must be at least ${minAge.trim()} years old.`,
        type: 'age_range',
        required: true,
        operator: 'gte',
        value: Number(minAge.trim()),
      });
    }

    if (maxAge.trim() && !isNaN(Number(maxAge))) {
      criteria.push({
        id: `crit-${slugBase}-max-age`,
        field: 'age',
        label: 'Maximum Age Limit',
        description: `Applicant age must not exceed ${maxAge.trim()} years.`,
        type: 'age_range',
        required: true,
        operator: 'lte',
        value: Number(maxAge.trim()),
      });
    }

    if (maxIncome.trim() && !isNaN(Number(maxIncome))) {
      criteria.push({
        id: `crit-${slugBase}-income`,
        field: 'annual_family_income',
        label: 'Annual Family Income Cap',
        description: `Annual family income must not exceed ₹${Number(maxIncome.trim()).toLocaleString('en-IN')}.`,
        type: 'income_range',
        required: true,
        operator: 'lte',
        value: Number(maxIncome.trim()),
      });
    }

    if (genderReq !== 'any') {
      criteria.push({
        id: `crit-${slugBase}-gender`,
        field: 'gender',
        label: 'Target Gender',
        description: `Scheme is exclusively for ${genderReq} applicants.`,
        type: 'category',
        required: true,
        operator: 'eq',
        value: genderReq,
      });
    }

    if (categoryReq !== 'all') {
      criteria.push({
        id: `crit-${slugBase}-category`,
        field: 'category',
        label: 'Social Category Requirement',
        description: `Applicant must belong to the ${categoryReq} category.`,
        type: 'category',
        required: true,
        operator: 'eq',
        value: categoryReq,
      });
    }

    if (isStudentReq) {
      criteria.push({
        id: `crit-${slugBase}-student`,
        field: 'is_student',
        label: 'Enrolled Student Requirement',
        description: 'Applicant must be an actively enrolled student in a recognized institution.',
        type: 'boolean',
        required: true,
        operator: 'eq',
        value: true,
      });
    }

    if (isBPLReq) {
      criteria.push({
        id: `crit-${slugBase}-bpl`,
        field: 'is_bpl',
        label: 'BPL / Low Income Certificate',
        description: 'Applicant family must possess a verified BPL or Priority Ration card.',
        type: 'boolean',
        required: true,
        operator: 'eq',
        value: true,
      });
    }

    if (isDisabledReq) {
      criteria.push({
        id: `crit-${slugBase}-disabled`,
        field: 'is_disabled',
        label: 'Disability Certification (PwD)',
        description: 'Applicant must hold a valid disability certificate / UDID card.',
        type: 'boolean',
        required: true,
        operator: 'eq',
        value: true,
      });
    }

    return criteria;
  };

  // Submit New or Edited Scheme
  const handleAddScheme = async (e: FormEvent) => {
    e.preventDefault();
    if (!schemeName.trim() || !summary.trim() || !department.trim()) return;

    setIsSubmitting(true);
    setFeedbackNotice(null);

    const slugBase =
      schemeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `custom-${Date.now().toString(36)}`;

    const criteria = buildEligibilityCriteria(slugBase);

    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          id: editingSchemeId || undefined,
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
          eligibilityCriteria: criteria,
          officialUrl,
          sourceTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save scheme');

      const actionWord = editingSchemeId ? 'updated' : 'published';
      const vectorMsg =
        data.chunksIngested > 0
          ? `(${data.chunksIngested} vector chunks indexed)`
          : '(vector indexing skipped or offline)';

      setFeedbackNotice({
        type: 'success',
        message: `Scheme "${data.scheme.name}" successfully ${actionWord} with ${criteria.length} eligibility rules ${vectorMsg}!`,
      });

      resetSchemeForm();
      fetchStatusAndSchemes(adminKey);
      setCurrentView('schemes');
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error saving scheme',
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
      setCurrentView('overview');
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
    if (
      !confirm(
        'This will regenerate embeddings for all schemes in the database. Ensure an AI API key is configured before proceeding. Continue?'
      )
    ) {
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

  // Delete custom scheme and its vector embeddings
  const handleDeleteScheme = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete custom scheme "${name}"? This will also remove its embeddings from the vector store.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/schemes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      const removedMsg =
        typeof data.vectorsRemoved === 'number' && data.vectorsRemoved > 0
          ? ` and removed ${data.vectorsRemoved} vector embeddings`
          : '';

      setFeedbackNotice({
        type: 'success',
        message: `Deleted "${name}"${removedMsg}.`,
      });

      fetchStatusAndSchemes(adminKey);
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error deleting scheme',
      });
    }
  };

  // Filtered & Paginated Schemes for Registry
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      if (originFilter === 'custom' && !s.isCustom) return false;
      if (originFilter === 'system' && s.isCustom) return false;
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDept = s.department.toLowerCase().includes(q);
        const matchesId = s.id.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesId) return false;
      }
      return true;
    });
  }, [schemes, originFilter, categoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredSchemes.length / pageSize) || 1;
  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchemes.slice(start, start + pageSize);
  }, [filteredSchemes, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // ================= RENDER: AUTH GATE =================
  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50">
        <div className="w-full max-w-md bg-white border border-[#DCE2E0] rounded-3xl shadow-xl p-8 space-y-6 relative overflow-hidden">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-[#EA580C]" />

          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F2EE] text-[#176B5B] flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">YojnaSetu Control Center</h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Protected administrator interface for scheme curation, official gazette vectorization, and AI RAG model operations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Administrator Passcode
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>Configured in .env.local as</span> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">ADMIN_SECRET</code>
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingStatus || !keyInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#176B5B] hover:bg-[#105447] active:scale-[0.99] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-900/10"
            >
              {isLoadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock Control Center'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= RENDER: REDESIGNED ADMIN DASHBOARD =================
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-slate-100 p-2 sm:p-5 lg:p-7 flex">
      {/* Outer Floating Application Card Container */}
      <div className="w-full max-w-[1520px] mx-auto bg-white/95 backdrop-blur-md border border-[#DCE2E0] rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[860px]">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside
          className={`bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 transition-all duration-300 select-none ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } ${mobileMenuOpen ? 'block fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:flex'}`}
        >
          {/* Sidebar Brand Header */}
          <div className="h-18 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                YS
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                    YojnaSetu
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                    Admin Portal
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden md:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? '»' : '«'}
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <div className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
            {/* Group 1: Workspaces */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  Workspaces
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentView('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'overview'
                    ? 'bg-[#E6F2EE] text-[#176B5B] shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Control Center Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Control Center</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('schemes');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'schemes'
                    ? 'bg-[#E6F2EE] text-[#176B5B] shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Scheme Registry"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>All Schemes</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                    {schemes.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('publish');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'publish'
                    ? 'bg-[#E6F2EE] text-[#176B5B] shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Publish or Edit Scheme"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>{editingSchemeId ? 'Edit Scheme' : 'Publish Scheme'}</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('ingest');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'ingest'
                    ? 'bg-[#E6F2EE] text-[#176B5B] shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Ingest Gazette Document"
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Gazette Ingest</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('engine');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'engine'
                    ? 'bg-[#E6F2EE] text-[#176B5B] shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Vector Intelligence Engine"
              >
                <Cpu className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Vector Core</span>}
              </button>
            </div>

            {/* Group 2: System & Operations */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  Operations
                </div>
              )}

              <button
                type="button"
                onClick={handleReindex}
                disabled={isReindexing}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                title="Re-index All Vectors"
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${isReindexing ? 'animate-spin text-[#176B5B]' : ''}`} />
                {!isSidebarCollapsed && <span>{isReindexing ? 'Re-indexing...' : 'Re-index Vectors'}</span>}
              </button>

              <Link
                href="/schemes"
                target="_blank"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Open Public Welfare Portal"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Public Portal</span>}
              </Link>
            </div>
          </div>

          {/* Sidebar Footer User Card */}
          <div className="p-3.5 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  AO
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">Admin Operator</div>
                    <div className="text-[10px] text-emerald-700 font-semibold truncate">Verified Session</div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                title="Lock Console / Logout"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT WORKSPACE ================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <header className="h-18 px-6 sm:px-8 border-b border-[#E2E8F0] flex items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                <span>{currentView === 'overview' ? 'Control Center' : currentView.replace('-', ' ')}</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500">Welfare Intelligence</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <div className="relative hidden sm:block w-64 lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== 'schemes') setCurrentView('schemes');
                  }}
                  placeholder="Search schemes, gazettes..."
                  className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">
                  ⌘K
                </span>
              </div>

              {/* Glowing AI Brain Pill Button (matches screenshot) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#176B5B] via-teal-600 to-emerald-600 text-white text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Brain:</span>
                <span className="truncate max-w-[120px] font-mono text-[11px]">
                  {status?.aiProvider === 'gemini' ? 'Gemini 2.0' : status?.aiProvider === 'openai' ? 'GPT-4o' : 'Offline'}
                </span>
              </div>
            </div>
          </header>

          {/* Main Body Canvas */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Feedback alert */}
            {feedbackNotice && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs animate-in fade-in duration-200 ${
                  feedbackNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : feedbackNotice.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {feedbackNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="flex-1 text-sm font-medium">{feedbackNotice.message}</div>
                <button
                  type="button"
                  onClick={() => setFeedbackNotice(null)}
                  className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ================= SECTION: HERO SUPER-AGENT CONTROL CARD ================= */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Your Control Center
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Your AI engine indexes 640+ official gazettes, prioritizes eligibility criteria, and verifies citations in real time.
                </p>
              </div>

              {/* The Hero Floating Glowing Card (Faithful to Screenshot) */}
              <div className="bg-white border border-[#DCE2E0] rounded-2xl shadow-sm overflow-hidden relative">
                {/* Radiant glowing header gradient banner */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-[#176B5B] p-5 sm:p-6 text-white relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base sm:text-lg font-bold tracking-tight">Semantic RAG Core</h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-emerald-900 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-emerald-100 mt-0.5">
                          Indexing 640+ Central & State Welfare Initiatives
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentView('publish')}
                        className="px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Publish Scheme</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('schemes')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-900/40 text-white border border-white/20 text-xs font-semibold hover:bg-emerald-900/60 transition-colors cursor-pointer"
                      >
                        View Registry
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtitle description */}
                <div className="p-5 sm:p-6 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-b border-[#E2E8F0]">
                  Coordinates semantic vector retrieval from 3,220 official gazette chunks and deterministic eligibility conditions so citizens receive verified, citation-backed answers without AI hallucination.
                </div>

                {/* 4-Box Metrics Strip with vertical dividers (Exact match to screenshot) */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-slate-50/50">
                  <div className="p-4 sm:p-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#176B5B] flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Schemes</div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {status ? status.schemesCount : '640+'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        +{status?.customSchemesCount || 0} custom uploads
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vector Chunks</div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {status ? status.chunksCount.toLocaleString('en-IN') : '3,220'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">data/vector-store.json</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-100/70 text-sky-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Intelligence</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate max-w-[140px]">
                        {status?.model || 'Gemini 2.0 Flash'}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {status?.baseUrl || 'Google Generative AI'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Embeddings Status</div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        100%
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {status?.dimensions ? `${status.dimensions} dims • Ready` : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= VIEW: OVERVIEW / DASHBOARD ================= */}
            {currentView === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Recently Indexed Schemes & Quick Tools */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Schemes Card */}
                  <div className="bg-white border border-[#DCE2E0] rounded-2xl shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#176B5B] flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Recently Indexed Schemes</h3>
                          <p className="text-[11px] text-slate-400">Latest official welfare programs registered into the vector index.</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentView('schemes')}
                        className="text-xs font-semibold text-[#176B5B] hover:text-[#105447] transition-colors cursor-pointer"
                      >
                        View all schemes →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {schemes.slice(0, 5).map((scheme) => (
                        <div key={scheme.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">{scheme.name}</span>
                              {scheme.isCustom && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{scheme.department} • {scheme.jurisdiction}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600 font-medium capitalize">
                              {scheme.category ? scheme.category.replace('_', ' ') : 'General'}
                            </span>
                            <Link
                              href={`/schemes/${scheme.slug}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-emerald-700 transition-colors"
                              title="View Public Page"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shrink-0">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Have a new Scheme PDF or Gazette Circular?</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Upload official guidelines to auto-extract structured rules, or paste circular text directly.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCurrentView('publish')}
                        className="px-4 py-2 rounded-xl bg-[#176B5B] hover:bg-[#105447] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        Publish Scheme Form
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('ingest')}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        Ingest Raw Text
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 1 Column: Signals Considered & Engine Health (Matches screenshot) */}
                <div className="space-y-6">
                  {/* Signals Considered Card */}
                  <div className="bg-white border border-[#DCE2E0] rounded-2xl shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signals Considered</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Healthy
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100/80 text-[#176B5B] shrink-0 mt-0.5">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Cosine Similarity Retriever</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Top-k=5 semantic matching against 3,220 chunk vectors.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-teal-100/80 text-teal-800 shrink-0 mt-0.5">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Deterministic Eligibility Engine</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Zero hallucination demographic math across age, income & category.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-sky-100/80 text-sky-800 shrink-0 mt-0.5">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Server-Mapped Citations</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Collapsible source verification direct to official gazette links.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100/80 text-amber-800 shrink-0 mt-0.5">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Speech-To-Text Vernacular</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Web Speech API Hindi & English input for rural accessibility.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= VIEW: ALL SCHEMES REGISTRY ================= */}
            {currentView === 'schemes' && (
              <div className="bg-white border border-[#DCE2E0] rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#E2E8F0] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Indexed Welfare Schemes Registry</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total {schemes.length} schemes indexed ({filteredSchemes.length} match your filters).
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Showing {paginatedSchemes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                      {Math.min(currentPage * pageSize, filteredSchemes.length)} of {filteredSchemes.length}
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search by name, ID, or ministry..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <select
                        value={originFilter}
                        onChange={(e) => {
                          setOriginFilter(e.target.value as 'all' | 'custom' | 'system');
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                      >
                        <option value="all">All Origins (System + Custom)</option>
                        <option value="custom">Admin Uploads Only</option>
                        <option value="system">System Base Only</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => {
                          setCategoryFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(SCHEME_CATEGORIES).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50/80 border-b border-[#E2E8F0] text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Scheme Name</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Jurisdiction</th>
                        <th className="px-5 py-3.5">Origin</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedSchemes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500">
                            No schemes match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedSchemes.map((scheme) => (
                          <tr key={scheme.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-slate-900 max-w-xs">
                              <div className="font-bold truncate">{scheme.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{scheme.id}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs capitalize border border-slate-200 font-semibold">
                                {scheme.category ? scheme.category.replace('_', ' ') : 'General'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{scheme.department}</td>
                            <td className="px-5 py-3.5 text-slate-600">{scheme.jurisdiction}</td>
                            <td className="px-5 py-3.5">
                              {scheme.isCustom ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Custom
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                                  System
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <Link
                                  href={`/schemes/${scheme.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                                  title="View Public Scheme Page"
                                >
                                  <ArrowUpRight className="w-4 h-4" />
                                </Link>
                                {scheme.isCustom && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleEditScheme(scheme)}
                                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                                      title="Edit Scheme Details"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteScheme(scheme.id, scheme.name)}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Delete Scheme & Remove Vectors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>

                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="px-3 py-1 font-bold text-slate-800">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= VIEW: PUBLISH / EDIT SCHEME ================= */}
            {currentView === 'publish' && (
              <div className="bg-white border border-[#DCE2E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingSchemeId ? 'Edit Existing Welfare Scheme' : 'Publish & Vector-Index a New Scheme'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter official scheme guidelines. Saving automatically vectorizes embeddings into the local store and indexes deterministic eligibility rules.
                    </p>
                  </div>

                  {editingSchemeId && (
                    <button
                      type="button"
                      onClick={resetSchemeForm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </div>

                {/* AI PDF Uploader Box */}
                <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 sm:p-6 transition-all hover:border-emerald-500">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shrink-0 shadow-sm">
                        {isUploadingPdf ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <FileUp className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Upload Scheme Official PDF</h4>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            AI Auto-Fill
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">
                          Upload any official government circular or gazette PDF. AI automatically parses metadata, benefits, documents, and demographic rules to prefill the form below.
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="scheme-pdf-upload"
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all cursor-pointer ${
                        isUploadingPdf ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#176B5B] hover:bg-[#105447]'
                      }`}
                    >
                      {isUploadingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing PDF...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Choose Scheme PDF</span>
                        </>
                      )}
                      <input
                        id="scheme-pdf-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        disabled={isUploadingPdf}
                        onChange={handlePdfUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {uploadedPdfName && !isUploadingPdf && !pdfUploadError && (
                    <div className="mt-4 pt-3.5 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Parsed from <strong>{uploadedPdfName}</strong>{uploadedPages ? ` (${uploadedPages} pages)` : ''}.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPdfName(null);
                          setUploadedPages(null);
                        }}
                        className="text-[11px] underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {pdfUploadError && (
                    <div className="mt-4 pt-3.5 border-t border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pdfUploadError}</span>
                    </div>
                  )}
                </div>

                {/* Bulk Dataset JSON Import Option */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-[#176B5B] shrink-0" />
                    <span className="text-slate-700">
                      Have a JSON dataset with multiple schemes? Batch-import and vectorize them all at once.
                    </span>
                  </div>
                  <label
                    htmlFor="bulk-json-upload"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shadow-2xs transition-colors shrink-0"
                  >
                    {isBulkImporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#176B5B]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{isBulkImporting ? 'Importing...' : 'Upload Schemes JSON'}</span>
                    <input
                      id="bulk-json-upload"
                      type="file"
                      accept=".json,application/json"
                      disabled={isBulkImporting}
                      onChange={handleBulkJsonUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <form onSubmit={handleAddScheme} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Scheme Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={schemeName}
                        onChange={(e) => setSchemeName(e.target.value)}
                        placeholder="e.g. PM Surya Ghar: Muft Bijli Yojana"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as SchemeCategory)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      >
                        {Object.entries(SCHEME_CATEGORIES).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ministry / Department *
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Ministry of New and Renewable Energy"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jurisdiction *
                      </label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Beneficiary Group
                    </label>
                    <input
                      type="text"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                      placeholder="e.g. Residential households seeking rooftop solar installations"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Summary (Brief Overview) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Provides up to 300 units of free electricity every month to 1 crore households..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Detailed Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Comprehensive details on budget, specifications, and objectives..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                    />
                  </div>

                  {/* DETERMINISTIC ELIGIBILITY RULES BUILDER */}
                  <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#176B5B]" />
                      <h4 className="text-sm font-bold text-slate-900">Deterministic Eligibility Rules</h4>
                      <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        Rule Engine
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Min Age (Years)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={minAge}
                          onChange={(e) => setMinAge(e.target.value)}
                          placeholder="e.g. 18"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Max Age (Years)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={maxAge}
                          onChange={(e) => setMaxAge(e.target.value)}
                          placeholder="e.g. 35"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Max Family Income Cap (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={maxIncome}
                          onChange={(e) => setMaxIncome(e.target.value)}
                          placeholder="e.g. 250000"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Target Gender
                        </label>
                        <select
                          value={genderReq}
                          onChange={(e) => setGenderReq(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                        >
                          <option value="any">Any / All Genders</option>
                          <option value="female">Female Only (Women)</option>
                          <option value="male">Male Only</option>
                          <option value="transgender">Transgender Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Social Category
                        </label>
                        <select
                          value={categoryReq}
                          onChange={(e) => setCategoryReq(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B]"
                        >
                          <option value="all">All Categories</option>
                          <option value="SC">Scheduled Caste (SC)</option>
                          <option value="ST">Scheduled Tribe (ST)</option>
                          <option value="OBC">Other Backward Class (OBC)</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-4 text-xs">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={isStudentReq}
                          onChange={(e) => setIsStudentReq(e.target.checked)}
                          className="rounded border-slate-300 text-[#176B5B] focus:ring-[#176B5B] w-4 h-4"
                        />
                        <span>Enrolled student only</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={isBPLReq}
                          onChange={(e) => setIsBPLReq(e.target.checked)}
                          className="rounded border-slate-300 text-[#176B5B] focus:ring-[#176B5B] w-4 h-4"
                        />
                        <span>BPL / Ration card required</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={isDisabledReq}
                          onChange={(e) => setIsDisabledReq(e.target.checked)}
                          className="rounded border-slate-300 text-[#176B5B] focus:ring-[#176B5B] w-4 h-4"
                        />
                        <span>Disability (UDID) required</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Benefits (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={benefitsText}
                        onChange={(e) => setBenefitsText(e.target.value)}
                        placeholder="Subsidies of ₹30,000 to ₹78,000&#10;Up to 300 units free power"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Required Documents (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={documentsText}
                        onChange={(e) => setDocumentsText(e.target.value)}
                        placeholder="Electricity consumer bill&#10;Aadhaar Card of householder"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Application Steps (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={stepsText}
                        onChange={(e) => setStepsText(e.target.value)}
                        placeholder="Step 1: Register on portal&#10;Step 2: Submit feasibility request"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Portal URL
                      </label>
                      <input
                        type="url"
                        value={officialUrl}
                        onChange={(e) => setOfficialUrl(e.target.value)}
                        placeholder="https://pmsuryaghar.gov.in"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Source Gazette Title
                      </label>
                      <input
                        type="text"
                        value={sourceTitle}
                        onChange={(e) => setSourceTitle(e.target.value)}
                        placeholder="e.g. Operational Guidelines for PM Surya Ghar 2024"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    {editingSchemeId && (
                      <button
                        type="button"
                        onClick={resetSchemeForm}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#176B5B] hover:bg-[#105447] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{editingSchemeId ? 'Updating...' : 'Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>{editingSchemeId ? 'Update Scheme & Re-Index' : 'Publish & Index Scheme'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= VIEW: INGEST GAZETTE ================= */}
            {currentView === 'ingest' && (
              <div className="bg-white border border-[#DCE2E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ingest Raw Gazette Circular or Press Notification</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Paste official notification text directly, or upload a circular PDF. Paragraphs are automatically chunked and embedded into the vector store.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileUp className="w-4 h-4 text-[#176B5B] shrink-0" />
                    <span className="text-slate-700">Have a gazette PDF? Extract its text directly into this form.</span>
                  </div>
                  <label
                    htmlFor="gazette-pdf-upload"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shadow-2xs transition-colors shrink-0"
                  >
                    {isUploadingDocPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{isUploadingDocPdf ? 'Extracting...' : 'Extract from PDF'}</span>
                    <input
                      id="gazette-pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={isUploadingDocPdf}
                      onChange={handleDocPdfUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <form onSubmit={handleIngestDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="e.g. Gazette Notification No. 12/2025: Criteria Update"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Issuing Ministry / Department
                      </label>
                      <input
                        type="text"
                        value={docDept}
                        onChange={(e) => setDocDept(e.target.value)}
                        placeholder="e.g. Department of Social Justice and Empowerment"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jurisdiction
                      </label>
                      <select
                        value={docJurisdiction}
                        onChange={(e) => setDocJurisdiction(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Gazette / Circular URL
                      </label>
                      <input
                        type="url"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://egazette.gov.in/..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Document Text (Paste Gazette / Circular Content) *
                    </label>
                    <textarea
                      required
                      rows={10}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      placeholder="Paste the circular text here. Paragraphs will be automatically split and vectorized..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#176B5B] focus:bg-white leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Minimum 50 characters required.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || docContent.trim().length < 50}
                      className="px-6 py-2.5 rounded-xl bg-[#176B5B] hover:bg-[#105447] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Embedding Vectors...</span>
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

            {/* ================= VIEW: VECTOR ENGINE CORE ================= */}
            {currentView === 'engine' && (
              <div className="bg-white border border-[#DCE2E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Vector Intelligence Engine</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct inspection of semantic embeddings, vector index storage, and RAG retrieval parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Path</span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1 break-all">data/vector-store.json</div>
                    <span className="text-xs text-slate-500 mt-2 block">~99 MB on-disk JSON database</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Embeddings Model</span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                      {status?.embeddingModel || 'text-embedding-004'}
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold mt-2 block">
                      {status?.dimensions || 768} dimensions cosine index
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Index Count</span>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {status ? status.chunksCount.toLocaleString('en-IN') : '3,220'} chunks
                    </div>
                    <span className="text-xs text-slate-500 mt-2 block">Top-5 semantic similarity rank</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900">Re-index Entire Vector Store</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Re-indexing clears the vector store and re-generates embeddings across all 640+ schemes from scratch using your active AI API key. The system safely validates API availability before clearing.
                  </p>
                  <button
                    type="button"
                    onClick={handleReindex}
                    disabled={isReindexing}
                    className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />
                    <span>{isReindexing ? 'Re-indexing in Progress...' : 'Trigger Full Re-index'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
