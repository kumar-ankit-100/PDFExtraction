import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';

const Sidebar = ({ onWidthChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isCollapsed ? 80 : width);
    }
  }, [isCollapsed, width, onWidthChange]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 400) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const menuItems = [
    { icon: '📤', label: 'Upload', path: '/', color: 'cyan' },
    { icon: '📊', label: 'Results', path: '/results', color: 'blue' },
    { icon: '🕐', label: 'History', path: '/history', color: 'purple' },
    { icon: '🔄', label: 'Compare', path: '/compare', color: 'green' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-700/50 dark:border-slate-800/50 shadow-2xl transition-all duration-300 ease-in-out z-40 flex flex-col ${
          isCollapsed ? 'w-20' : ''
        }`}
        style={{ width: isCollapsed ? '80px' : `${width}px` }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="7" y1="8" x2="17" y2="8" strokeLinecap="round"/>
                    <line x1="7" y1="12" x2="17" y2="12" strokeLinecap="round"/>
                    <line x1="7" y1="16" x2="12" y2="16" strokeLinecap="round"/>
                    <circle cx="17" cy="17" r="3" fill="currentColor" stroke="none"/>
                    <path d="M15.5 17l1 1 2-2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Doc2Ledger</h2>
                  <p className="text-xs text-slate-400">AI Powered</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-slate-800/50 dark:bg-slate-900/50 hover:bg-slate-700/50 dark:hover:bg-slate-800/50 text-slate-300 transition-all duration-200 hover:scale-110"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* User Section */}
          <SignedIn>
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 dark:bg-slate-900/30 border border-slate-700/30 dark:border-slate-800/30 ${isCollapsed ? 'justify-center' : ''}`}>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-sm font-medium text-white truncate">Welcome back!</p>
                  <p className="text-xs text-slate-400">Manage your PDFs</p>
                </div>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-105`}>
                {!isCollapsed && <span className="animate-fade-in">Sign In</span>}
                {isCollapsed && <span>→</span>}
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <span className={`text-2xl transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
                {!isCollapsed && isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 dark:border-slate-800/50 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-4 px-4 py-3 rounded-xl bg-slate-800/30 dark:bg-slate-900/30 hover:bg-slate-700/50 dark:hover:bg-slate-800/50 text-slate-300 transition-all duration-200 group`}
            title="Toggle theme"
          >
            <div className="relative w-6 h-6">
              <svg className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="font-medium animate-fade-in">
                {theme === 'dark' ? 'Dark' : 'Light'} Mode
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="fixed top-0 h-screen w-1 cursor-col-resize z-50 hover:bg-cyan-500/50 transition-colors duration-200 group"
          style={{ left: `${width}px` }}
        >
          <div className="absolute inset-y-0 -left-1 -right-1"></div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
