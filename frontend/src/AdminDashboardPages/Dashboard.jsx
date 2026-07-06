import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import {
  FileText,
  Tag,
  Eye,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
} from 'lucide-react';
import axios from 'axios';
import OverviewChart from './OverviewChart';

const parseDate = (post) => {
  const d = new Date(post.published_date || post.created_at || post.createdAt);
  return isNaN(d) ? null : d;
};

const RANGE_OPTIONS = [
  { months: 3, label: 'Last 3 months' },
  { months: 6, label: 'Last 6 months' },
  { months: 12, label: 'Last 12 months' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthsBack, setMonthsBack] = useState(6);
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/admin/posts`, {
          withCredentials: true,
        });
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const publishedCount = posts.filter((p) => p.status === 'published').length;

  // Posts bucketed into the selected range of calendar months for the overview chart
  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString('en', { month: 'short' }),
        published: 0,
        drafts: 0,
      });
    }
    posts.forEach((post) => {
      const d = parseDate(post);
      if (!d) return;
      const bucket = buckets.find(
        (b) => b.year === d.getFullYear() && b.month === d.getMonth(),
      );
      if (!bucket) return;
      if (post.status === 'published') bucket.published += 1;
      else bucket.drafts += 1;
    });
    return buckets;
  }, [posts, monthsBack]);

  // Real month-over-month change in posts (no fabricated numbers)
  const thisMonth = monthlyData[monthlyData.length - 1] || { published: 0, drafts: 0 };
  const lastMonth = monthlyData[monthlyData.length - 2] || { published: 0, drafts: 0 };
  const postsThisMonth = thisMonth.published + thisMonth.drafts;
  const postsLastMonth = lastMonth.published + lastMonth.drafts;
  const postsDelta =
    postsLastMonth > 0
      ? Math.round(((postsThisMonth - postsLastMonth) / postsLastMonth) * 100)
      : null;

  const categories = useMemo(() => {
    const counts = {};
    posts.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const stats = [
    {
      label: 'Total Posts',
      value: user?.total_posts ?? posts.length,
      icon: FileText,
      iconBg: 'bg-blue-100 dark:bg-blue-500/10',
      iconColor: 'text-[#2F6FCC] dark:text-blue-400',
      delta: postsDelta,
      deltaNote:
        postsDelta === null ? `${postsThisMonth} this month` : 'vs last month',
    },
    {
      label: 'Published',
      value: publishedCount,
      icon: CheckCircle2,
      iconBg: 'bg-green-100 dark:bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      delta: null,
      deltaNote: `${posts.length - publishedCount} drafts`,
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: Tag,
      iconBg: 'bg-amber-100 dark:bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      delta: null,
      deltaNote: 'active categories',
    },
    {
      label: 'Total Views',
      value: user?.total_views || 0,
      icon: Eye,
      iconBg: 'bg-purple-100 dark:bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      delta: null,
      deltaNote: 'live',
      href: '/analytics',
    },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2F6FCC]"></div>
        </div>
      </Layout>
    );
  }

  const maxCategoryCount = Math.max(1, ...categories.map((c) => c.count));

  return (
    <Layout title="Dashboard">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome back, {user?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Here's what's happening with your blog today.
          </p>
        </div>
        <div ref={rangeRef} className="relative">
          <button
            type="button"
            onClick={() => setRangeOpen((o) => !o)}
            className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all dark:bg-[#1a1a1a] dark:text-gray-300 ${
              rangeOpen
                ? 'border-[#2F6FCC] ring-2 ring-[#2F6FCC]/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4 text-[#2F6FCC]" />
            {RANGE_OPTIONS.find((o) => o.months === monthsBack)?.label}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${rangeOpen ? 'rotate-180' : ''}`} />
          </button>

          {rangeOpen && (
            <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-800 dark:bg-[#1a1a1a]">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  type="button"
                  onClick={() => {
                    setMonthsBack(option.months);
                    setRangeOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    option.months === monthsBack
                      ? 'font-semibold text-[#2F6FCC] dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#242424]'
                  }`}
                >
                  {option.label}
                  {option.months === monthsBack && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const negative = stat.delta !== null && stat.delta < 0;
          const card = (
            <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </span>
                  {stat.label}
                </span>
                {stat.href && <ArrowRight className="h-4 w-4 text-gray-300" />}
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs">
                {stat.delta !== null && (
                  <span className={`flex items-center gap-0.5 font-semibold ${negative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {negative ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(stat.delta)}%
                  </span>
                )}
                <span className="text-gray-400 dark:text-gray-500">{stat.deltaNote}</span>
              </p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} to={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* Overview chart */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overview</h3>
        </div>
        <OverviewChart data={monthlyData} isDark={isDarkMode} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a]">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Posts</h3>
            <Link
              to="/posts"
              className="text-sm font-medium text-[#2F6FCC] hover:underline dark:text-blue-400"
            >
              View all
            </Link>
          </div>
          <div className="px-6 py-2">
            {posts.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.slice(0, 5).map((post) => (
                  <li key={post?.id} className="flex items-center gap-4 py-3.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-[#2F6FCC] dark:bg-blue-500/10 dark:text-blue-400">
                      {(post.title || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {post.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500 capitalize">
                        {post.category}
                        {post.published_date &&
                          ` · ${new Date(post.published_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                      }`}
                    >
                      {post.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No posts yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  What are you waiting for {user?.name}? Create your first post!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a]">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Categories</h3>
            <Link
              to="/categories"
              className="text-sm font-medium text-[#2F6FCC] hover:underline dark:text-blue-400"
            >
              Manage
            </Link>
          </div>
          <div className="px-6 py-2">
            {categories.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.name} className="py-3.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.count} {category.count === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-[#2F6FCC] dark:bg-blue-500"
                        style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <Tag className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No categories yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Hey {user?.name}, add some categories to organize your posts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
