import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../Context/AuthContext';
import { FileText, Tag, Clock, Eye, BarChart3, Calendar } from 'lucide-react';
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  const getCategoryCounts = () => {
    const counts = {};
    recentPosts.forEach(post => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  const categoryPosts = getCategoryCounts();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/admin/posts`, {
          withCredentials: true
        });
        setRecentPosts(response.data);
        const activities = [
          ...response.data.slice(0, 3).map(post => ({
            type: 'post',
            icon: <FileText className="w-3 h-3 text-blue-800" />,
            color: 'blue',
            title: post.status === 'published' ? 'New post published' : 'Draft post created',
            description: `"${post.title}" in ${post.category} category`,
            timeAgo: post.timeAgo
          })),
          {
            type: 'category',
            icon: <Tag className="w-3 h-3 text-green-800" />,
            color: 'green',
            title: 'Categories updated',
            description: `${getCategoryCounts().length} active categories`,
            timeAgo: ""
          },
          {
            type: 'views',
            icon: <Eye className="w-3 h-3 text-purple-800" />,
            color: 'purple',
            title: 'Blog traffic',
            description: `Total views: ${user?.total_views || 0}`,
            timeAgo: ""
          }
        ];
        setRecentActivities(activities.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?.total_views]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e94235]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
        <p className="text-gray-600">Here's what's happening with your blog today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-800">{user?.total_posts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Tag className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-semibold text-gray-800">{categoryPosts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Eye className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-800">{user?.total_views}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#e94235] text-white">
            <h3 className="text-lg font-medium">Recent Posts</h3>
          </div>
          <div className="p-6">
            {recentPosts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <li key={post?.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500"> {new Date(post.published_date).toLocaleDateString()}</p>
                          <span className="mx-2 text-gray-300">•</span>
                          <Tag className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{post.category}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs rounded-full ${post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">What are you waiting for {user?.name}? Create your first post!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#e94235] text-white">
            <h3 className="text-lg font-medium">Posts by Category</h3>
          </div>
          <div className="p-6">
            {categoryPosts.length > 0 ? (
              <ul className="space-y-4">
                {categoryPosts.map((category) => (
                  <li key={category.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600 capitalize">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count} {category.count === 1 ? 'post' : 'posts'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#e94235] h-2.5 rounded-full"
                        style={{ width: `${(category.count / user?.total_posts) * 100}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Tag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories yet</h3>
                <p className="mt-1 text-sm text-gray-500">Hey {user?.name}, add some categories to organize your posts!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-[#e94235] text-white">
          <h3 className="text-lg font-medium">Recent Activity</h3>
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <ol className="border-l border-gray-200">
              {recentActivities.map((activity, index) => (
                <li key={index} className="mb-6 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 bg-${activity.color}-100 rounded-full -left-3 ring-8 ring-white`}>
                    {activity.icon}
                  </span>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="justify-between items-center mb-3 sm:flex">
                      <time className="mb-1 text-xs font-normal text-gray-500 sm:order-last sm:mb-0">
                        {activity.timeAgo}
                      </time>
                      <div className="text-sm font-semibold text-gray-900">{activity.title}</div>
                    </div>
                    <div className="text-sm font-normal text-gray-600">
                      {activity.description}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating posts and categories</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;