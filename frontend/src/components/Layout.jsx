import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import {
  LayoutDashboard,
  FileText,
  Tag,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Bell,
  BarChart3,
  BookOpen
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Posts', href: '/posts', icon: FileText },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Resources', href: '/resources-admin', icon: BookOpen },
  ];

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#121212] transition-colors duration-300">
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                <LogOut className="h-8 w-8 text-[#2F6FCC]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to log out of your session? You will need to sign in again to access the dashboard.
              </p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                className="flex-1 px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors border-r border-gray-100 dark:border-gray-800"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                No, Keep me in
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-4 text-sm font-semibold text-[#2F6FCC] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                onClick={confirmLogout}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        z-50 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col
        fixed inset-y-0 flex w-64 flex-col transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center justify-between px-5">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <img
                  src={isDarkMode ? '/images/logo/teazy-tech-logo-icon-light.png' : '/images/logo/teazy-tech-logo-icon.png'}
                  alt="Teazy Tech logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Teazy Tech
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-5 px-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] py-2 pl-9 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-[#2F6FCC] focus:outline-none focus:ring-2 focus:ring-[#2F6FCC]/20 transition-all"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 space-y-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isCurrentPath(item.href);
                return (
                  <Link
                    key={item.name}
                    reloadDocument={item.href === '/dashboard'}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${active
                        ? 'bg-blue-50 text-[#2F6FCC] dark:bg-blue-500/10 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#242424] dark:hover:text-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile footer */}
          <div className="flex flex-shrink-0 items-center gap-3 border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6FCC] text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#2F6FCC] dark:hover:bg-[#242424] transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="lg:pl-64 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-colors duration-300">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-x-2">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
