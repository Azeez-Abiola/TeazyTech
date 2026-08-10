import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ui/ConfirmModal';
import axios from '../lib/api';
import {
  Mail, Trash2, X, Search, Download, Users, CalendarDays,
  AlertCircle, CheckCircle2, Loader2, Copy,
} from 'lucide-react';

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

/** Firestore timestamps arrive as { _seconds, _nanoseconds } over JSON. */
const toDate = (ts) => (ts?._seconds ? new Date(ts._seconds * 1000) : null);

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSubscribers = async () => {
    try {
      const res = await axios.get('/api/admin/newsletter', { withCredentials: true });
      setSubscribers(res.data);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      showToast('Could not load subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ open: false, id: null });
    try {
      await axios.delete(`/api/admin/newsletter/${encodeURIComponent(id)}`, { withCredentials: true });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      showToast('Subscriber removed');
    } catch {
      showToast('Failed to remove subscriber', 'error');
    }
  };

  const filtered = subscribers.filter(
    (s) => !search || s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const copyAll = async () => {
    if (!filtered.length) return;
    try {
      await navigator.clipboard.writeText(filtered.map((s) => s.email).join(', '));
      showToast(`Copied ${filtered.length} email${filtered.length === 1 ? '' : 's'}`);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const exportCsv = () => {
    if (!filtered.length) return;
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed'],
      ...filtered.map((s) => [
        s.email,
        s.status || 'subscribed',
        s.source || '',
        toDate(s.subscribedAt)?.toISOString() || '',
      ]),
    ];
    // Quote every field so commas inside a value can't shift the columns.
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const now = Date.now();
  const within = (days) =>
    subscribers.filter((s) => {
      const d = toDate(s.subscribedAt);
      return d && now - d.getTime() <= days * 24 * 60 * 60 * 1000;
    }).length;

  const stats = [
    {
      label: 'Total subscribers',
      value: subscribers.length,
      icon: Users,
      color: 'text-[#2F6FCC] dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-500/10',
    },
    {
      label: 'Last 7 days',
      value: within(7),
      icon: CalendarDays,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-500/10',
    },
    {
      label: 'Last 30 days',
      value: within(30),
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-500/10',
    },
  ];

  return (
    <Layout title="Newsletters">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal
        open={confirmModal.open}
        title="Remove subscriber?"
        message={`${confirmModal.id} will be removed from the newsletter list.`}
        confirmLabel="Yes, Remove"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletters</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Everyone who has subscribed through the resources page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="h-4 w-4" /> Copy emails
          </button>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FCC] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#2561b8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a] p-4 flex items-center gap-3"
            >
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

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#2F6FCC] focus:outline-none focus:ring-1 focus:ring-[#2F6FCC]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6FCC]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] py-16 text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {search ? 'No matching subscribers' : 'No subscribers yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? 'Try a different search term.'
              : 'Emails appear here as visitors subscribe from the resources page.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-[#161616]">
                <tr>
                  {['Email', 'Source', 'Subscribed', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((s) => {
                  const date = toDate(s.subscribedAt);
                  return (
                    <tr
                      key={s.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-[#2F6FCC]" />
                          </div>
                          <a
                            href={`mailto:${s.email}`}
                            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#2F6FCC] dark:hover:text-blue-400"
                          >
                            {s.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-[#2F6FCC] dark:text-blue-400">
                          {s.source || 'website'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {date ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setConfirmModal({ open: true, id: s.id })}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove subscriber"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminNewsletter;
