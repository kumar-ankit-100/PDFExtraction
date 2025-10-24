import React, { useEffect, useState } from 'react';
import { getJobStatus } from '../services/api';

const ExtractionProgress = ({ jobId, onComplete, onError }) => {
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!jobId || !polling) return;

    const pollStatus = async () => {
      try {
        const data = await getJobStatus(jobId);
        setStatus(data);

        if (data.status === 'completed') {
          setPolling(false);
          onComplete(data);
        } else if (data.status === 'failed') {
          setPolling(false);
          onError(data.errors);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setPolling(false);
        onError([error.message]);
      }
    };

    // Poll immediately
    pollStatus();

    // Then poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId, polling, onComplete, onError]);

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Initializing extraction...</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'completed':
        return (
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-scale-in">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'processing':
        return 'Extracting data...';
      case 'completed':
        return 'Extraction completed!';
      case 'failed':
        return 'Extraction failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
        <div className="flex flex-col items-center space-y-6">
          {getStatusIcon()}
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{getStatusText()}</h3>

          <div className="w-full space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Files processed: <strong className="text-slate-900 dark:text-white">{status.files_processed}</strong> / <strong className="text-slate-900 dark:text-white">{status.total_files}</strong>
            </p>
            
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out rounded-full shadow-lg shadow-blue-500/50"
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            
            <p className="text-3xl font-black text-center text-blue-600 dark:text-blue-400">{status.progress.toFixed(0)}%</p>
          </div>
        </div>

        {status.errors && status.errors.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Errors:</h4>
            <ul className="space-y-1">
              {status.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 dark:text-red-400">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractionProgress;
