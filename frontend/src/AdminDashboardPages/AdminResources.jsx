import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAuth } from '../Context/AuthContext';
import axios from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinaryUpload';
import {
  BookOpen, Plus, Trash2, Edit2, X, Upload, FileText,
  ExternalLink, AlertCircle, CheckCircle2, Loader2, Search,
  Tag, DollarSign, Eye, EyeOff, Image as ImageIcon, Paperclip,
  ShoppingBag, CreditCard, Star
} from 'lucide-react';

const CATEGORIES = [
  { id: 'guides', label: 'Guides & Tutorials' },
  { id: 'tools', label: 'Tools & Templates' },
  { id: 'webinars', label: 'Webinars' },
  { id: 'research', label: 'Research & Case Studies' },
];

const FILE_TYPES = '.pdf,.doc,.docx,.zip,.pptx,.xlsx';
const THUMB_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const emptyForm = {
  title: '',
  description: '',
  category: 'guides',
  price: '',
  status: 'published',
  isFree: false,
  featured: false,
};

/* ─────────────────────────────────────────
   Toast helper
───────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const isOk = toast.type === 'success';
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-white text-sm font-medium transition-all animate-in slide-in-from-bottom-4 duration-300 ${isOk ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {isOk ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Upload progress ring
───────────────────────────────────────── */
function UploadRing({ pct }) {
  const r = 20, c = 2 * Math.PI * r;
  return (
    <svg width="52" height="52" className="rotate-[-90deg]">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke="#2F6FCC" strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s' }} />
      <text x="26" y="32" textAnchor="middle" fontSize="11" fill="#374151"
        className="rotate-90 origin-center" style={{ transform: 'rotate(90deg)', transformOrigin: '26px 26px' }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────
   Resource Modal (create / edit)
───────────────────────────────────────── */
function ResourceModal({ mode, resource, onClose, onSaved }) {
  const [form, setForm] = useState(mode === 'edit' ? {
    title: resource.title,
    description: resource.description,
    category: resource.category,
    price: Number(resource.price) === 0 ? '' : resource.price,
    status: resource.status,
    isFree: Number(resource.price) === 0,
    featured: Boolean(resource.featured),
  } : { ...emptyForm });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(resource?.thumbnailUrl || null);
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [savePhase, setSavePhase] = useState('idle'); // idle | uploading | saving
  const [errors, setErrors] = useState({});
  const thumbRef = useRef();
  const fileRef = useRef();
  const errorRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickThumb = e => {
    const f = e.target.files[0];
    if (!f) return;
    const extOk = /\.(jpe?g|png|webp|gif)$/i.test(f.name);
    if (!THUMB_TYPES.includes(f.type) && !extOk) {
      setErrors(prev => ({
        ...prev,
        thumb: 'Thumbnail must be JPG, PNG, WEBP, or GIF. HEIC/iPhone photos are not supported — convert or screenshot first.',
      }));
      return;
    }
    setErrors(prev => ({ ...prev, thumb: undefined }));
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  const pickFile = e => {
    const f = e.target.files[0];
    if (f) setResourceFile(f);
  };

  const MAX_FILE_BYTES = 10 * 1024 * 1024; // Cloudinary free-plan raw file cap

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.isFree && (form.price === '' || isNaN(Number(form.price)) || Number(form.price) <= 0)) {
      e.price = 'Enter a valid price for paid resources';
    }
    if (mode === 'create' && !resourceFile) e.file = 'Please attach a resource file';
    if (resourceFile && resourceFile.size > MAX_FILE_BYTES) {
      e.file = `File is too large (${(resourceFile.size / (1024 * 1024)).toFixed(1)}MB) — the maximum upload size is 10MB`;
    }
    if (thumbnailFile && thumbnailFile.size > MAX_FILE_BYTES) {
      e.file = 'Thumbnail is too large — the maximum upload size is 10MB';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSavePhase('uploading');
    setUploadPct(0);
    try {
      let fileUrl = mode === 'edit' ? resource.fileUrl : null;
      let thumbnailUrl = mode === 'edit' ? resource.thumbnailUrl : null;

      const uploads = [];

      if (resourceFile) {
        uploads.push(
          uploadToCloudinary(resourceFile, {
            kind: 'resource',
            onProgress: (e) => {
              if (e.total) {
                setUploadPct(Math.round((e.loaded * 100) / e.total));
              }
            },
          }).then((url) => { fileUrl = url; }),
        );
      }

      if (thumbnailFile) {
        uploads.push(
          uploadToCloudinary(thumbnailFile, { kind: 'resource-thumbnail' })
            .then((url) => { thumbnailUrl = url; }),
        );
      }

      if (uploads.length) {
        await Promise.all(uploads);
      }

      if (mode === 'create' && !fileUrl) {
        setErrors({ submit: 'Please attach a resource file' });
        setSaving(false);
        setSavePhase('idle');
        setUploadPct(0);
        return;
      }

      setSavePhase('saving');
      setUploadPct(100);

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        price: form.isFree ? 0 : Number(form.price),
        featured: form.featured,
        ...(fileUrl ? { fileUrl } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      };

      if (mode === 'create') {
        await axios.post('/api/admin/resources', payload, {
          withCredentials: true,
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await axios.patch(`/api/admin/resources/${resource.id}`, payload, {
          withCredentials: true,
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      onSaved(mode === 'create' ? 'Resource created!' : 'Resource updated!');
    } catch (err) {
      const message = err.code === 'ECONNABORTED'
        ? 'Upload timed out. Check your connection and try again.'
        : err.response?.data?.error?.message
          || err.response?.data?.error
          || 'Save failed. Please try again.';
      setErrors({ submit: message });
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 0);
    } finally {
      setSaving(false);
      setUploadPct(0);
      setSavePhase('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Add New Resource' : 'Edit Resource'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errors.submit && (
            <div
              ref={errorRef}
              className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image</label>
            <div
              onClick={() => thumbRef.current.click()}
              className="relative flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-[#2F6FCC] transition-colors"
              style={{ minHeight: '140px' }}
            >
              {thumbnailPreview
                ? <img src={thumbnailPreview} alt="preview" className="w-full h-36 object-cover" />
                : (
                  <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Click to upload thumbnail</span>
                  </div>
                )
              }
              <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" className="hidden" onChange={pickThumb} />
            </div>
            {errors.thumb && <p className="mt-1 text-xs text-red-500">{errors.thumb}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
              placeholder="e.g. Complete Guide to EdTech Integration"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all resize-none"
              placeholder="Describe what this resource includes and who it's for…"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Free resource</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Toggle on for free downloads. Toggle off to set a price.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isFree}
                onClick={() => set('isFree', !form.isFree)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${form.isFree ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-1 ${form.isFree ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {!form.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₦)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">₦</span>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] pl-7 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
                    placeholder="2500"
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Featured resource</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Highlight on the public Resources page. You can feature multiple resources.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.featured}
                onClick={() => set('featured', !form.featured)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${form.featured ? 'bg-[#2F6FCC]' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-1 ${form.featured ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Category + legacy price row removed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-[#2F6FCC] outline-none"
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div className="flex gap-3">
              {['published', 'draft'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium border transition-colors capitalize ${
                    form.status === s
                      ? s === 'published'
                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource File * {mode === 'edit' && <span className="text-gray-400 font-normal">(leave empty to keep current)</span>}
            </label>
            <div
              onClick={() => fileRef.current.click()}
              className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 px-4 py-4 cursor-pointer hover:border-[#2F6FCC] transition-colors"
            >
              {saving && uploadPct > 0
                ? <UploadRing pct={uploadPct} />
                : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <Paperclip className="h-5 w-5 text-[#2F6FCC]" />
                  </div>
              }
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {resourceFile ? resourceFile.name : mode === 'edit' ? 'Click to replace file' : 'Click to attach file'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, PPTX, XLSX, ZIP — max 10MB</p>
              </div>
              <input ref={fileRef} type="file" accept={FILE_TYPES} className="hidden" onChange={pickFile} />
            </div>
            {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}
            {mode === 'edit' && resource.fileUrl && !resourceFile && (
              <a href={resource.fileUrl} target="_blank" rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#2F6FCC] hover:underline">
                <ExternalLink className="h-3 w-3" /> View current file
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 dark:border-gray-800 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#2F6FCC] py-2.5 text-sm font-semibold text-white hover:bg-[#2561b8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {savePhase === 'saving' ? 'Saving…' : `Uploading… ${uploadPct}%`}</>
              : mode === 'create' ? 'Create Resource' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main AdminResources Page
───────────────────────────────────────── */
const AdminResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | { mode:'edit', resource }
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, title: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchResources = async () => {
    try {
      const res = await axios.get('/api/admin/resources', { withCredentials: true });
      setResources(res.data);
    } catch {
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // Fetch purchases too
    axios.get('/api/admin/purchases', { withCredentials: true })
      .then(r => setPurchases(r.data || []))
      .catch(() => {});
  }, []);

  const openDeleteModal = (resource) => {
    setConfirmModal({ open: true, id: resource.id, title: resource.title });
  };

  const handleDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null, title: '' });
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/resources/${id}`, { withCredentials: true });
      setResources(r => r.filter(x => x.id !== id));
      showToast('Resource deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (msg) => {
    setModal(null);
    fetchResources();
    showToast(msg);
  };

  const toggleFeatured = async (resource) => {
    try {
      await axios.patch(`/api/admin/resources/${resource.id}`, {
        featured: !resource.featured,
      }, { withCredentials: true });
      showToast(
        resource.featured ? 'Removed from featured section' : 'Set as featured resource',
      );
      fetchResources();
    } catch {
      showToast('Failed to update featured status', 'error');
    }
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || r.category === filterCat;
    return matchSearch && matchCat;
  });

  const catLabel = id => CATEGORIES.find(c => c.id === id)?.label || id;

  const statusBadge = s => s === 'published'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';

  return (
    <Layout title="Resources">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Resource?"
        message={`"${confirmModal.title}" will be permanently deleted and users will no longer be able to purchase it.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null, title: '' })}
      />

      {modal === 'create' && (
        <ResourceModal mode="create" onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.mode === 'edit' && (
        <ResourceModal mode="edit" resource={modal.resource} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage paid & free resources for educators.
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FCC] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#2561b8] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {/* Stats strip */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Total', value: resources.length, icon: BookOpen, color: 'text-[#2F6FCC] dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
          { label: 'Published', value: resources.filter(r => r.status === 'published').length, icon: Eye, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10' },
          { label: 'Drafts', value: resources.filter(r => r.status === 'draft').length, icon: EyeOff, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
          { label: 'Free', value: resources.filter(r => Number(r.price) === 0).length, icon: Tag, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10' },
          { label: 'Featured', value: resources.filter(r => r.featured).length, icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a] p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] pl-9 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:border-[#2F6FCC] outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6FCC]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No resources yet</h3>
          <p className="mt-1 text-sm text-gray-500">Click "Add Resource" to upload your first resource.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#161616]">
              <tr>
                {['Resource', 'Category', 'Price', 'Featured', 'Status', 'File', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.map(r => (
                <tr key={r.id} className="group hover:bg-gray-50/50 dark:hover:bg-[#1f1f1f] transition-colors">
                  {/* Resource */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {r.thumbnailUrl
                        ? <img src={r.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        : <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-[#2F6FCC]" />
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{r.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.description}</p>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-[#2F6FCC] dark:text-blue-400">
                      <Tag className="h-3 w-3" />
                      {catLabel(r.category)}
                    </span>
                  </td>
                  {/* Price */}
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {Number(r.price) === 0
                        ? <span className="text-green-600 dark:text-green-400">Free</span>
                        : <>₦{Number(r.price).toLocaleString()}</>
                      }
                    </span>
                  </td>
                  {/* Featured */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(r)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        r.featured
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:text-amber-600'
                      }`}
                      title={r.featured ? 'Remove from featured' : 'Set as featured'}
                    >
                      <Star className={`h-3.5 w-3.5 ${r.featured ? 'fill-current' : ''}`} />
                      {r.featured ? 'Featured' : 'Set'}
                    </button>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  {/* File */}
                  <td className="px-5 py-4">
                    {r.fileUrl
                      ? <a href={r.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#2F6FCC] hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ mode: 'edit', resource: r })}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-[#2F6FCC] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(r)}
                        disabled={deleting === r.id}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        {deleting === r.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Purchases Tracking Card ─────────────────────── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#2F6FCC]" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Purchase Tracking</h3>
          <span className="ml-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-bold text-[#2F6FCC] dark:text-blue-400">
            {purchases.length} total
          </span>
        </div>

        {/* Revenue summary strip */}
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₦${purchases.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString()}`, icon: CreditCard, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10' },
            { label: 'Purchases', value: purchases.length, icon: ShoppingBag, color: 'text-[#2F6FCC] dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
            { label: 'Guides', value: purchases.filter(p => p.resourceCategory === 'guides').length, icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10' },
            { label: 'Webinars', value: purchases.filter(p => p.resourceCategory === 'webinars').length, icon: Eye, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a] p-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] py-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No purchases yet</p>
            <p className="mt-1 text-xs text-gray-500">Once users purchase resources, they will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-[#161616]">
                  <tr>
                    {['Buyer Email', 'Resource', 'Category', 'Amount', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {purchases.slice(0, 20).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{p.email}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{p.resourceTitle}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-[#2F6FCC] dark:text-blue-400 capitalize">
                          {p.resourceCategory}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-green-700 dark:text-green-400">
                        ₦{Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {p.purchasedAt?._seconds
                          ? new Date(p.purchasedAt._seconds * 1000).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminResources;
