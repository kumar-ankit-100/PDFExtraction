import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Extractor
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              AI-powered PDF data extraction tool that converts unstructured documents 
              into clean, structured Excel spreadsheets.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200">
                🤖 AI-Powered
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200">
                ⚡ Fast
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200">
                🔒 Secure
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <a href="/history" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </a>
              </li>
              <li>
                <a href="/health" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  API Status
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Powered By</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-2xl">⚛️</span>
                <span className="text-sm font-medium">React</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-2xl">🐍</span>
                <span className="text-sm font-medium">FastAPI</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-2xl">🤖</span>
                <span className="text-sm font-medium">Google Gemini</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Need Help?</h4>
            <div className="space-y-3">
              <a href="mailto:support@pdfextractor.com" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">support@pdfextractor.com</span>
              </a>
              <a href="https://github.com" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} PDF Extractor. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#privacy" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="text-slate-600">•</span>
            <a href="#terms" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200">
              Terms of Service
            </a>
            <span className="text-slate-600">•</span>
            <a href="#cookies" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
