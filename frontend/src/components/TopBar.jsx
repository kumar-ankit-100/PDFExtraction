import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Header = ({ currentPage, onNavigateHome, onNavigateHistory, onNavigateCompare }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    onNavigateHome();
  };

  const handleHistoryClick = () => {
    setMobileMenuOpen(false);
    onNavigateHistory();
  };

  const handleCompareClick = () => {
    setMobileMenuOpen(false);
    onNavigateCompare();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-cyan-900/90 backdrop-blur-xl shadow-lg border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4 cursor-pointer transition-transform hover:-translate-y-0.5" onClick={handleHomeClick}>
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-2xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:rotate-6">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-extrabold text-white tracking-tight">PDF Extractor</h1>
              <p className="text-xs text-cyan-200/80 font-medium">AI-Powered Data Extraction</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                currentPage === 'upload' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
              onClick={handleHomeClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                currentPage === 'history' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
              onClick={handleHistoryClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                currentPage === 'compare' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
              onClick={handleCompareClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Compare
            </button>

            {/* Theme Toggle */}
            <button 
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-white ml-2"
              onClick={toggleTheme} 
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 ml-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="scale-110">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-full border-2 border-cyan-400 hover:border-cyan-300 transition-all cursor-pointer hover:scale-110"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 flex flex-col gap-2 pb-4 animate-slide-down">
            <button 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                currentPage === 'upload' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/80'
              }`}
              onClick={handleHomeClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            
            <button 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                currentPage === 'history' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/80'
              }`}
              onClick={handleHistoryClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            
            <button 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                currentPage === 'compare' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/80'
              }`}
              onClick={handleCompareClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Compare
            </button>

            <div className="flex items-center gap-3 mt-2">
              <button 
                className="flex-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
                onClick={toggleTheme}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex-1 flex justify-center">
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </nav>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;
