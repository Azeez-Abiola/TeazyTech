import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { PlusCircle, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
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
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/admin/categories/${id}`, {
          withCredentials: true
        });
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Cannot delete category with posts');
      }
    }
  };

  const startAddingCategory = () => {
    setIsAdding(true);
    setNewCategory({ name: '', description: '' });
  };

  const cancelAddingCategory = () => {
    setIsAdding(false);
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const response = await axios.post(`/api/admin/categories`,
        newCategory,
        { withCredentials: true }
      );

      setCategories([...categories, response.data]);
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  if (loading) {
    return (
      <Layout title="Manage Categories">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e94235]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Categories">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Blog Categories</h2>
        <button
          onClick={startAddingCategory}
          className="inline-flex items-center px-4 py-2 bg-[#e94235] text-white rounded-lg hover:bg-[#d23c30] transition-colors duration-300"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-[#e94235]/20 focus:border-[#e94235]"
                      placeholder="Category name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-[#e94235]/20 focus:border-[#e94235]"
                      placeholder="Category description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={addCategory}
                        className="text-green-600 hover:text-green-800 p-1"
                        disabled={!newCategory.name.trim()}
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={cancelAddingCategory}
                        className="text-gray-600 hover:text-gray-800 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-[#e94235]/20 focus:border-[#e94235]"
                        value={editedCategory.name}
                        onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-[#e94235]" />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-[#e94235]/20 focus:border-[#e94235]"
                        value={editedCategory.description}
                        onChange={(e) => setEditedCategory({ ...editedCategory, description: e.target.value })}
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{category.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {category.postCount || 0} posts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === category.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => saveEdit(category.id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          disabled={!editedCategory.name.trim()}
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-800 p-1"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={category.postCount > 0}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {categories.length === 0 && !isAdding && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Categories with posts cannot be deleted. You must first reassign or delete all posts in that category.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;