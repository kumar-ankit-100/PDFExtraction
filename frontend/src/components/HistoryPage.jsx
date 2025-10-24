import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getExtractionHistory, downloadFile } from '../services/api';

const HistoryPage = ({ onViewFile }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExtractionHistory();
      setHistory(data.results || []);
      if (data.results && data.results.length > 0) {
        toast.success(`Loaded ${data.results.length} extraction${data.results.length > 1 ? 's' : ''}`);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      const errorMsg = 'Failed to load extraction history. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      toast.loading('Preparing download...', { id: 'download' });
      await downloadFile(filename);
      toast.success('Download started!', { id: 'download' });
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file. Please try again.', { id: 'download' });
    }
  };

  const handleView = (filename) => {
    if (onViewFile) {
      onViewFile(filename);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    return `${seconds.toFixed(2)}s`;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-slate-800 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="inline-block relative">
            <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-300 text-xl font-semibold">Loading portfolio history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-slate-800 flex items-center justify-center">
        <div className="max-w-md bg-gradient-to-br from-red-600 to-rose-600 rounded-3xl shadow-2xl p-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Error Loading History</h3>
            <p className="text-white/90 text-lg">{error}</p>
          </div>
          <button 
            className="w-full px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white text-white rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            onClick={fetchHistory}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-[2.5rem] shadow-2xl p-10 border-b-4 border-cyan-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">Financial Extraction History</h1>
            <p className="text-lg text-cyan-200 font-semibold">
              View and manage all your portfolio extraction records
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-slate-800 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-700 dark:border-slate-600 p-16 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-[2rem]">
              <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">No History Yet</h3>
              <p className="text-lg text-slate-300">Upload and extract your first financial document to build your history</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[2rem] shadow-xl p-8 text-center">
                <div className="absolute top-4 right-4 opacity-20">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-5xl font-black text-white mb-3 drop-shadow-lg">{history.length}</div>
                <div className="text-white/90 font-semibold text-lg">Total Extractions</div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2rem] shadow-xl p-8 text-center">
                <div className="absolute top-4 right-4 opacity-20">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-5xl font-black text-white mb-3 drop-shadow-lg">
                  {(history.reduce((sum, item) => sum + (item.processing_time || 0), 0) / history.length).toFixed(2)}s
                </div>
                <div className="text-white/90 font-semibold text-lg">Avg Processing Time</div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-800 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-700 dark:border-slate-600 overflow-hidden">
              <div className="overflow-x-auto bg-slate-800 dark:bg-slate-900">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-4 border-cyan-500">
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Document</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Data Points</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">AI Model</th>
                      <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-slate-700 dark:border-slate-600 hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-slate-800 dark:bg-slate-900' : 'bg-slate-750 dark:bg-slate-800/50'}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-slate-200 dark:text-slate-200 font-bold text-sm">{item.original_filename || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-300 dark:text-slate-400 text-sm font-semibold">{formatDate(item.extraction_timestamp)}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {formatTime(item.processing_time)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-300 dark:text-slate-400 text-sm font-bold">{(item.total_characters_extracted || 0).toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {item.gemini_model_used?.replace('gemini-', '') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              onClick={() => handleView(item.excel_filename)}
                              title="View Excel file"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              onClick={() => handleDownload(item.excel_filename)}
                              title="Download Excel file"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-slate-800 dark:bg-slate-900 rounded-[2rem] shadow-2xl border-2 border-slate-700 dark:border-slate-600 p-6">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="text-slate-200 font-bold text-lg">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
