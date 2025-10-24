import React, { useEffect, useState } from 'react';
import { getJobStatus } from '../services/api';
import ExcelSheetViewer from './ExcelSheetViewer';

const DataPreview = ({ jobId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('excel'); // 'excel' or 'table'

  console.log('DataPreview rendered with jobId:', jobId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for job:', jobId);
        
        // Use status endpoint which now includes preview_data
        const status = await getJobStatus(jobId);
        console.log('Status received:', status);
        
        // Set data from either preview_data or extracted_data
        const dataToShow = {
          preview_data: status.preview_data,
          extracted_data: status.extracted_data,
          template_id: status.template_id || 'Unknown'
        };
        
        console.log('Data to show:', dataToShow);
        setData(dataToShow);
        setError(null);
      } catch (err) {
        console.error('Error fetching extraction results:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load extraction results');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading extracted data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-6xl">⚠️</div>
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!data || (!data.extracted_data && !data.preview_data)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-6xl">⚠️</div>
        <p className="text-amber-600 dark:text-amber-400 font-bold">No extracted data found</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The extraction may still be processing or no data was extracted from the PDF.
        </p>
      </div>
    );
  }

  const renderDataTable = () => {
    // Support both extracted_data (array) and preview_data (object)
    let extractedItems;
    let displayFormat = 'standard';
    
    if (data.preview_data) {
      // Handle preview_data format from accurate extraction
      // This has fund_summary and portfolio_companies_sample
      displayFormat = 'enhanced';
      extractedItems = [data.preview_data];
    } else if (Array.isArray(data.extracted_data)) {
      extractedItems = data.extracted_data;
    } else if (data.extracted_data) {
      extractedItems = [data.extracted_data];
    } else {
      extractedItems = [];
    }
    
    if (extractedItems.length === 0) {
      return <p className="text-center text-slate-600 dark:text-slate-400">No data to display</p>;
    }
    
    // Enhanced display for accurate extraction
    if (displayFormat === 'enhanced' && extractedItems[0].fund_summary) {
      return renderEnhancedPreview(extractedItems[0]);
    }
    
    // For vertical display, we'll show Field | Value for each record
    return (
      <div className="space-y-6">
        {extractedItems.map((item, itemIndex) => (
          <div key={itemIndex} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {extractedItems.length > 1 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Record {itemIndex + 1}
                  {item._source_file && (
                    <span className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                      📄 {item._source_file}
                    </span>
                  )}
                </h4>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Field</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {Object.entries(item).map(([key, value]) => {
                    // Skip internal fields that start with underscore
                    if (key.startsWith('_')) return null;
                    
                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                          {key.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                          {formatCellValue(value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEnhancedPreview = (previewData) => {
    const { fund_summary, portfolio_companies_sample, portfolio_companies_count, source_file, extraction_method } = previewData;
    
    return (
      <div className="space-y-6">
        {source_file && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <strong className="text-blue-900 dark:text-blue-300">Source File:</strong>{' '}
            <span className="text-blue-700 dark:text-blue-400">{source_file}</span>
          </div>
        )}
        {extraction_method && (
          <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <strong className="text-purple-900 dark:text-purple-300">Extraction Method:</strong>{' '}
            <span className="text-purple-700 dark:text-purple-400">{extraction_method}</span>
          </div>
        )}
        
        {/* Fund Summary Section */}
        {fund_summary && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Fund Summary ({Object.keys(fund_summary).length} fields extracted)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Field</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {Object.entries(fund_summary).map(([key, value]) => (
                    <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        {formatCellValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Portfolio Companies Section */}
        {portfolio_companies_sample && portfolio_companies_sample.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                Portfolio Companies ({portfolio_companies_count || portfolio_companies_sample.length} total, showing {portfolio_companies_sample.length} sample)
              </h4>
            </div>
            <div className="p-6 space-y-4">
              {portfolio_companies_sample.map((company, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h5 className="text-md font-bold text-slate-900 dark:text-white">
                      Company {idx + 1}: {company.Company || 'Unnamed'}
                    </h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {Object.entries(company).map(([key, value]) => {
                          if (value === null || value === undefined) return null;
                          return (
                            <tr key={key} className="hover:bg-white dark:hover:bg-slate-800 transition-colors duration-150">
                              <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{key}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{formatCellValue(value)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-400 dark:text-slate-500">—</span>;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Extracted Data Preview
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {data.extracted_data && Array.isArray(data.extracted_data) && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                {data.extracted_data.length} Record{data.extracted_data.length !== 1 ? 's' : ''}
              </span>
            )}
            {data.preview_data && (
              <>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full">
                  {data.preview_data.portfolio_companies_count || 0} Companies
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                  {Object.keys(data.preview_data.fund_summary || {}).length} Fund Fields
                </span>
              </>
            )}
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">
              Template: {data.template_id || 'Accurate Extraction'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
          <button 
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
              viewMode === 'excel'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-600'
            }`}
            onClick={() => setViewMode('excel')}
          >
            📊 Excel View
          </button>
          <button 
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-600'
            }`}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </button>
        </div>
      
        <div className="p-6">
          {viewMode === 'excel' ? (
            <ExcelSheetViewer data={data} />
          ) : (
            renderDataTable()
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
