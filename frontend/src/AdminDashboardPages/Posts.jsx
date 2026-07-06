import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ui/ConfirmModal';
import axios from 'axios';
import {
  Plus, Search, Edit2, Trash2, Eye, Calendar,
  Filter, Tag, CheckCircle2, FileText, AlertCircle, Loader2
} from 'lucide-react';

const CATEGORY_COLORS = {
  guides: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/30',
  tools: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200/30',
  webinars: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200/30',
  research: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200/30',
};

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, postId: null, title: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          axios.get("/api/admin/posts", { withCredentials: true }),
          axios.get("/api/admin/categories", { withCredentials: true })
        ]);
        setPosts(postsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch dashboard data");
        console.error("Error fetching posts or categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || post.category === categoryFilter;
    const matchesStatus = !statusFilter || post.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openDeleteModal = (post) => {
    setConfirmModal({ open: true, postId: post.id, title: post.title });
  };

  const handleDelete = async () => {
    const postId = confirmModal.postId;
    setConfirmModal({ open: false, postId: null, title: '' });
    setDeletingId(postId);
    try {
      await axios.delete(`/api/admin/posts/${postId}`, { withCredentials: true });
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const getCatClass = (cat) => {
    const clean = String(cat).toLowerCase().trim();
    return CATEGORY_COLORS[clean] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  if (loading) {
    return (
      <Layout title="Manage Posts">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[#2F6FCC]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Posts">
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Post?"
        message={`"${confirmModal.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, postId: null, title: '' })}
      />
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Header & New Button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, publish, and manage all your classroom technology articles.
          </p>
        </div>
        <Link
          to="/posts/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FCC] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#2561b8] transition-colors"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-[#2F6FCC] dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
          { label: 'Published', value: posts.filter(p => p.status === 'published').length, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10' },
          { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, icon: Edit2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
          { label: 'Total Views', value: posts.reduce((acc, p) => acc + (p.views || 0), 0), icon: Eye, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-4 flex items-center gap-3">
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

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4 text-[#2F6FCC]" />
          <h3 className="text-sm font-semibold">Filter Results</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:border-[#2F6FCC] outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c?.id} value={c?.name}>{c?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:border-[#2F6FCC] outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No posts found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-[#161616]">
                <tr>
                  {['Post details', 'Category', 'Date', 'Status', 'Views', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1f1f1f] transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                          <img
                            className="h-full w-full object-cover"
                            src={post.thumbnail || "/default-blog-thumbnail.png"}
                            alt=""
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-blog-thumbnail.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[280px]">{post.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[280px] mt-0.5">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${getCatClass(post.category)}`}>
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.published_date || 'Not set'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    {/* Views */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <Eye className="h-3.5 w-3.5" />
                        {Number(post.views || 0).toLocaleString()}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-[#2F6FCC] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(post)}
                          disabled={deletingId === post.id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Posts;