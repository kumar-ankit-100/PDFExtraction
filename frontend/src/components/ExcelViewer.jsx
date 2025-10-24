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
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 rounded-2xl shadow-md p-1">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {sheetNames.map((name, index) => (
            <button
              key={index}
              className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-200 shadow-md ${
                activeSheet === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-purple-50 hover:scale-102'
              }`}
              onClick={() => handleSheetChange(index)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet Content */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
        {/* Sheet Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white">{sheetNames[activeSheet]}</h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600' : `hover:bg-purple-50 transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  {row.map((cell, cellIndex) => {
                    const CellTag = rowIndex === 0 ? 'th' : 'td';
                    return (
                      <CellTag 
                        key={cellIndex}
                        className={`px-6 py-4 border-r ${
                          rowIndex === 0 
                            ? 'text-left text-sm font-black text-white uppercase tracking-wider border-r-pink-400/30 last:border-r-0'
                            : 'text-sm text-slate-800 font-medium border-r-slate-200 last:border-r-0'
                        }`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : '—'}
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
      <div className="bg-gradient-to-r from-slate-100 via-purple-50 to-slate-100 rounded-2xl shadow-md p-5 border-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            Showing sheet: <span className="text-purple-700 font-black">{sheetNames[activeSheet]}</span>
            {' '}• <span className="text-slate-900 font-bold">{sheetData.length}</span> rows
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
