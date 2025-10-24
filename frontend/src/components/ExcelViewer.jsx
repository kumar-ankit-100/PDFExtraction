import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const ExcelViewer = ({ filename }) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/preview/${filename}`);
        
        if (!response.ok) {
          throw new Error('Failed to load Excel file');
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        
        // Load first sheet by default
        if (wb.SheetNames.length > 0) {
          loadSheet(wb, 0);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading Excel file:', err);
        setError(err.message || 'Failed to load Excel file');
        setLoading(false);
      }
    };

    if (filename) {
      loadExcelFile();
    }
  }, [filename]);

  const loadSheet = (wb, sheetIndex) => {
    const sheetName = wb.SheetNames[sheetIndex];
    const worksheet = wb.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    setSheetData(jsonData);
    setActiveSheet(sheetIndex);
  };

  const handleSheetChange = (index) => {
    if (workbook) {
      loadSheet(workbook, index);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        </div>
        <p className="text-slate-700 text-xl font-semibold">Loading Excel preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl shadow-xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-700 font-semibold text-lg">{error}</p>
      </div>
    );
  }

  if (!workbook || sheetNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sheet Tabs */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-blue-50 to-cyan-50 rounded-2xl shadow-lg p-1 border border-slate-200">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-transparent">
          {sheetNames.map((name, index) => (
            <button
              key={index}
              className={`px-6 py-3.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 shadow-md ${
                activeSheet === index
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white scale-105 shadow-xl shadow-cyan-500/30'
                  : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:scale-102 hover:shadow-lg'
              }`}
              onClick={() => handleSheetChange(index)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Sheet Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 p-6 border-b-4 border-cyan-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{sheetNames[activeSheet]}</h3>
              <p className="text-cyan-200 text-sm font-semibold mt-1">Sheet {activeSheet + 1} of {sheetNames.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-slate-50 dark:bg-slate-900">
          <table className="w-full border-collapse">
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 sticky top-0 z-10' : `hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors duration-200 ${rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                  {row.map((cell, cellIndex) => {
                    const CellTag = rowIndex === 0 ? 'th' : 'td';
                    return (
                      <CellTag 
                        key={cellIndex}
                        className={`px-6 py-4 border-r ${
                          rowIndex === 0 
                            ? 'text-left text-sm font-black text-white uppercase tracking-wider border-r-slate-600/50 last:border-r-0 shadow-md'
                            : 'text-sm text-slate-800 dark:text-slate-200 font-semibold border-r-slate-200 dark:border-r-slate-700 last:border-r-0'
                        }`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : <span className="text-slate-400">—</span>}
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-800 dark:via-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-lg p-6 border-2 border-slate-200 dark:border-slate-700">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">
              Current Sheet: <span className="text-cyan-700 dark:text-cyan-400 font-black text-base">{sheetNames[activeSheet]}</span>
            </p>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">
              Total Rows: <span className="text-blue-700 dark:text-blue-400 font-black text-base">{sheetData.length}</span>
            </p>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">
              Sheet {activeSheet + 1} / {sheetNames.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
