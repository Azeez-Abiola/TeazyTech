import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import {
  LayoutDashboard,
  FileText,
  Tag,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Posts', href: '/posts', icon: FileText },
    { name: 'Categories', href: '/categories', icon: Tag },
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] transition-colors duration-300">
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <LogOut className="h-8 w-8 text-[#e94235]" />
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
                className="flex-1 px-4 py-4 text-sm font-semibold text-[#e94235] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                onClick={confirmLogout}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Theme Toggle */}
      <div className="lg:pl-64 flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Sidebar */}
      <div className={`
        z-50 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col
        fixed inset-y-0 flex w-64 flex-col transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex min-h-0 flex-1 flex-col bg-[#1a1a1a] dark:bg-[#0f0f0f]">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 justify-between">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    reloadDocument={item.href === '/dashboard'}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isCurrentPath(item.href)
                        ? 'bg-[#e94235] text-white'
                        : 'text-gray-300 hover:bg-[#e94235] hover:text-white'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 bg-[#141414] dark:bg-[#0a0a0a] p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-[#e94235] hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-3 h-6 w-6 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
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