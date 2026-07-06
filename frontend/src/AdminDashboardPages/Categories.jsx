import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ui/ConfirmModal';
import {
  Plus, Edit2, Trash2, Save, X, Tag, BookOpen,
  Search, Loader2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editedCategory, setEditedCategory] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [addingLoading, setAddingLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, categoryId: null, name: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/admin/categories`, {
          withCredentials: true
        });
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditedCategory({
      name: category.name,
      description: category.description,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!editedCategory.name.trim()) return;
    setSavingId(id);
    try {
      await axios.put(`/api/admin/categories/${id}`,
        editedCategory,
        { withCredentials: true }
      );
      setCategories(categories.map(cat =>
        cat.id === id
          ? { ...cat, ...editedCategory }
          : cat
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Error updating category:', err);
    } finally {
      setSavingId(null);
    }
  };

  const openDeleteModal = (category) => {
    setConfirmModal({ open: true, categoryId: category.id, name: category.name });
  };

  const deleteCategory = async () => {
    const id = confirmModal.categoryId;
    setConfirmModal({ open: false, categoryId: null, name: '' });
    try {
      await axios.delete(`/api/admin/categories/${id}`, { withCredentials: true });
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Cannot delete category because it has active blog posts assigned to it.');
    }
  };

  const startAddingCategory = () => {
    setIsAdding(true);
    setNewCategory({ name: '', description: '' });
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return;
    setAddingLoading(true);
    try {
      const response = await axios.post(`/api/admin/categories`,
        newCategory,
        { withCredentials: true }
      );
      setCategories([...categories, response.data]);
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setAddingLoading(false);
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Manage Categories">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[#2F6FCC]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Categories">
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Category?"
        message={`"${confirmModal.name}" will be permanently deleted. Make sure no posts are using this category.`}
        confirmLabel="Yes, Delete"
        onConfirm={deleteCategory}
        onCancel={() => setConfirmModal({ open: false, categoryId: null, name: '' })}
      />
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your technology articles by theme and subject matter.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={startAddingCategory}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FCC] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#2561b8] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {/* Add New Category Card */}
      {isAdding && (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 transition-all duration-300 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#2F6FCC]" />
              New Category Details
            </h3>
            <button onClick={() => setIsAdding(false)} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-[#242424]">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#2F6FCC]"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Description</label>
              <input
                type="text"
                placeholder="Brief summary of topics covered in this category"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#2F6FCC]"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424]"
            >
              Cancel
            </button>
            <button
              onClick={addCategory}
              disabled={addingLoading || !newCategory.name.trim()}
              className="rounded-xl bg-[#2F6FCC] text-white px-5 py-2 text-sm font-semibold hover:bg-[#2561b8] disabled:opacity-50 flex items-center gap-1.5"
            >
              {addingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] pl-9 pr-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
        />
      </div>

      {/* Grid or Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] py-16 text-center">
          <Tag className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">Add a new category above to organize your blog posts.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-[#161616]">
                <tr>
                  {['Category Name', 'Description', 'Post Count', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1f1f1f] transition-colors">
                    {/* Name column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          className="w-full max-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#2F6FCC]"
                          value={editedCategory.name}
                          onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/10">
                            <Tag className="h-4 w-4 text-[#2F6FCC]" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{category.name}</span>
                        </div>
                      )}
                    </td>
                    {/* Description column */}
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#2F6FCC]"
                          value={editedCategory.description}
                          onChange={(e) => setEditedCategory({ ...editedCategory, description: e.target.value })}
                        />
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed block max-w-md truncate">
                          {category.description || <em className="text-gray-300 dark:text-gray-600 font-normal">No description provided</em>}
                        </span>
                      )}
                    </td>
                    {/* Post Count column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-semibold text-[#2F6FCC] dark:text-blue-400">
                        <BookOpen className="h-3 w-3" />
                        {category.postCount || 0} {category.postCount === 1 ? 'post' : 'posts'}
                      </span>
                    </td>
                    {/* Actions column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === category.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(category.id)}
                            disabled={savingId === category.id || !editedCategory.name.trim()}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-500 transition-colors"
                          >
                            {savingId === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(category)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-[#2F6FCC] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className={`rounded-lg p-1.5 text-gray-400 transition-colors ${
                              category.postCount > 0
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500'
                            }`}
                            disabled={category.postCount > 0}
                            title={category.postCount > 0 ? "Cannot delete category with posts" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info notice */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4 transition-colors">
        <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-normal">
          Categories that have active blog posts assigned to them cannot be deleted. You must first delete or edit those posts to point to another category before deleting this category.
        </p>
      </div>
    </Layout>
  );
};

export default Categories;