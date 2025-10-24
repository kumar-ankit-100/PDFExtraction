import React from 'react';
import { downloadResult } from '../services/api';

const DownloadButton = ({ jobId, disabled }) => {
  const handleDownload = () => {
    window.location.href = downloadResult(jobId);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
        disabled
          ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105'
      }`}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      <svg
        className="relative z-10 w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
      </svg>
      <span className="relative z-10">Download Excel File</span>
    </button>
  );
};

export default DownloadButton;
