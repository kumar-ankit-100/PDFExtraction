import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import toast, { Toaster } from 'react-hot-toast';
import NavigationPanel from './components/NavigationPanel';
import BottomBar from './components/BottomBar';
import LandingView from './components/LandingView';
import DocumentUploader from './components/DocumentUploader';
import ExtractionProcessor from './components/ExtractionProcessor';
import OutputDisplay from './components/OutputDisplay';
import RecordsArchive from './components/RecordsArchive';
import DataComparison from './components/DataComparison';
import { uploadFiles } from './services/api';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFilename, setOutputFilename] = useState(null);
  const [error, setError] = useState(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'upload';
    if (path === '/processing') return 'processing';
    if (path === '/results') return 'results';
    if (path === '/history') return 'history';
    if (path === '/compare') return 'compare';
    if (path === '/compare-output') return 'compare';
    return 'upload';
  };

  const currentPage = getCurrentPage();

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    setError(null);
    if (files.length > 0) {
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} selected`);
    }
  };

  const handleProgressComplete = (progress) => {
    if (progress === 100) {
      setProcessingComplete(true);
      toast.success('Extraction completed successfully! 🎉');
      // Wait a moment at 100% before showing results
      setTimeout(() => {
        navigate('/results');
      }, 800);
    }
  };

  const handleStartExtraction = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one PDF file');
      setError('Please select at least one PDF file');
      return;
    }

    setIsProcessing(true);
    toast.loading('Starting extraction...', { id: 'extraction' });
    setError(null);
    setProcessingComplete(false);

    try {
      // The new backend returns results immediately (synchronous)
      const response = await uploadFiles(selectedFiles, 'fund_report_v1');
      
      if (response.success) {
        // Store the output filename
        setOutputFilename(response.output_file);
        toast.success('Extraction completed successfully! 🎉', { id: 'extraction' });
        setIsProcessing(false);
        // Navigate to results page after successful extraction
        setTimeout(() => {
          navigate('/results');
        }, 500);
      } else {
        throw new Error(response.message || 'Extraction failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed. Please try again.';
      toast.error(errorMessage, { id: 'extraction' });
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleStartNew = () => {
    navigate('/');
    setSelectedFiles([]);
    setOutputFilename(null);
    setError(null);
    setProcessingComplete(false);
    setIsProcessing(false);
    toast.success('Ready for new extraction');
  };

  const handleNavigateHistory = () => {
    navigate('/history');
  };

  const handleNavigateCompare = () => {
    navigate('/compare');
    toast.success('Select two Excel files to compare');
  };

  const handleCompareOutput = () => {
    navigate('/compare-output');
    toast.success('Select expected output file to compare');
  };

  const handleBackToResults = () => {
    navigate('/results');
  };

  const handleViewHistoryFile = (filename) => {
    setOutputFilename(filename);
    navigate('/results');
    toast.success('Loading extraction results');
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: 'white',
            },
          },
        }}
      />
      
      {/* Show LandingView when signed out */}
      <SignedOut>
        <LandingView />
      </SignedOut>

      {/* Show main content with navigation panel when signed in */}
      <SignedIn>
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 overflow-hidden">
          <NavigationPanel onWidthChange={setSidebarWidth} />
          
          <main 
            className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
            style={{ marginLeft: `${sidebarWidth}px` }}
          >
            <div className="min-h-screen p-6 md:p-8 lg:p-12 animate-fade-in">
              <Routes>
            {/* Upload Page */}
            <Route path="/" element={
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Page Header with Financial Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl shadow-2xl p-10 text-center">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                      Financial Data Extraction
                    </h1>
                    <p className="text-xl text-cyan-50 max-w-3xl mx-auto font-medium">
                      Transform your PDF financial reports into structured Excel data with AI-powered precision
                    </p>
                  </div>
                </div>

                {/* Upload Card */}
                <div className="bg-white dark:bg-slate-800 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-10 shadow-2xl shadow-slate-300/50 dark:shadow-slate-950/50 animate-scale-in">
                  <DocumentUploader
                    onFilesSelected={handleFilesSelected}
                    disabled={isProcessing}
                    isProcessing={isProcessing}
                  />

                  <button
                    onClick={handleStartExtraction}
                    disabled={selectedFiles.length === 0 || isProcessing}
                    className="w-full mt-8 group relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-bold text-lg px-12 py-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center justify-center gap-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="relative z-10 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="relative z-10">Start AI Extraction</span>
                  </button>
                </div>

                {/* Feature Cards with Financial Icons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-black text-2xl mb-2">Financial Precision</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">Extract portfolio data, valuations, and metrics with 99%+ accuracy</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="font-black text-2xl mb-2">Multi-Sheet Output</h3>
                      <p className="text-emerald-100 text-sm leading-relaxed">Organized data across 10+ sheets including statements and schedules</p>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-700 rounded-2xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="font-black text-2xl mb-2">Secure & Compliant</h3>
                      <p className="text-purple-100 text-sm leading-relaxed">Bank-level encryption and compliance with financial data standards</p>
                    </div>
                  </div>
                </div>
              </div>
            } />

            {/* Processing Page */}
            <Route path="/processing" element={
              <ExtractionProcessor 
                fileName={selectedFiles[0]?.name} 
                onProgressUpdate={handleProgressComplete}
              />
            } />

            {/* Results Page */}
            <Route path="/results" element={
              <OutputDisplay 
                filename={outputFilename} 
                onStartNew={handleStartNew}
                onCompare={handleCompareOutput}
              />
            } />

            {/* History Page */}
            <Route path="/history" element={
              <RecordsArchive onViewFile={handleViewHistoryFile} />
            } />

            {/* Compare XLSX Page (Dual mode - from header) */}
            <Route path="/compare" element={
              <DataComparison mode="dual" />
            } />

            {/* Compare Output Page (Single mode - from results) */}
            <Route path="/compare-output" element={
              <DataComparison 
                mode="single" 
                outputFile={outputFilename}
                onBack={handleBackToResults}
              />
            } />

            {/* Catch all other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </div>
          </main>
        </div>
      </SignedIn>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}

export default App;
