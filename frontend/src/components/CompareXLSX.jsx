import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const CompareXLSX = ({ mode = 'dual', outputFile = null, onBack }) => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(0);

  // Normalize value for comparison - treat empty, null, 0, "Not found", "Null" as equivalent
  const normalizeValue = (value) => {
    if (value === null || value === undefined) return null;
    
    const strValue = String(value).trim().toLowerCase();
    
    // List of values to consider as "empty"
    const emptyValues = ['', '0', 'not found', 'null', 'n/a', 'na', 'none', '-'];
    
    if (emptyValues.includes(strValue)) {
      return null;
    }
    
    return value;
  };

  // Check if two values are equivalent
  const areValuesEquivalent = (val1, val2) => {
    const norm1 = normalizeValue(val1);
    const norm2 = normalizeValue(val2);
    
    // Both are considered "empty"
    if (norm1 === null && norm2 === null) return true;
    
    // One is empty and other is not
    if (norm1 === null || norm2 === null) return false;
    
    // Compare as strings (case insensitive)
    return String(norm1).toLowerCase().trim() === String(norm2).toLowerCase().trim();
  };

  const handleFileChange = (event, fileNumber) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidType) {
        toast.error(`Invalid file type. Please upload only Excel files (.xlsx or .xls)`, {
          duration: 4000,
          icon: '📊'
        });
        // Clear the file input
        event.target.value = '';
        return;
      }

      // Validate file size (max 10MB for Excel files)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File is too large. Maximum size is 10MB.`, {
          duration: 4000,
          icon: '⚠️'
        });
        // Clear the file input
        event.target.value = '';
        return;
      }

      if (fileNumber === 1) {
        setFile1(file);
      } else {
        setFile2(file);
      }
      setError(null);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheets = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            sheets[sheetName] = jsonData;
          });
          
          resolve({
            sheetNames: workbook.SheetNames,
            sheets: sheets
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const fetchOutputFile = async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${filename}`);
      if (!response.ok) throw new Error('Failed to fetch output file');
      return await response.blob();
    } catch (err) {
      throw new Error('Could not load output file: ' + err.message);
    }
  };

  const compareSheets = (sheet1Data, sheet2Data) => {
    const maxRows = Math.max(sheet1Data.length, sheet2Data.length);
    const maxCols = Math.max(
      ...sheet1Data.map(row => row.length),
      ...sheet2Data.map(row => row.length)
    );

    const comparison = [];
    let differences = 0;
    let matches = 0;

    for (let i = 0; i < maxRows; i++) {
      const row1 = sheet1Data[i] || [];
      const row2 = sheet2Data[i] || [];
      const compRow = [];

      for (let j = 0; j < maxCols; j++) {
        const val1 = row1[j] !== undefined ? row1[j] : '';
        const val2 = row2[j] !== undefined ? row2[j] : '';
        
        const isEqual = areValuesEquivalent(val1, val2);
        
        if (!isEqual) {
          differences++;
        } else {
          matches++;
        }

        compRow.push({
          value1: val1,
          value2: val2,
          isEqual: isEqual,
          isDifferent: !isEqual
        });
      }

      comparison.push(compRow);
    }

    return {
      data: comparison,
      stats: {
        totalCells: maxRows * maxCols,
        matches,
        differences,
        accuracy: maxRows * maxCols > 0 ? ((matches / (maxRows * maxCols)) * 100).toFixed(2) : 0
      }
    };
  };

  const handleCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      let data1, data2;

      if (mode === 'single') {
        // Compare mode from results page - one file selected, one is output
        if (!file1 || !outputFile) {
          throw new Error('Please select an expected output file');
        }

        // Read selected file
        data1 = await readExcelFile(file1);

        // Fetch and read output file
        const outputBlob = await fetchOutputFile(outputFile);
        const outputFileObj = new File([outputBlob], outputFile);
        data2 = await readExcelFile(outputFileObj);

      } else {
        // Dual mode from header - both files need to be selected
        if (!file1 || !file2) {
          throw new Error('Please select both Excel files');
        }

        data1 = await readExcelFile(file1);
        data2 = await readExcelFile(file2);
      }

      // Compare all sheets
      const allComparisons = {};
      const allSheets = new Set([...data1.sheetNames, ...data2.sheetNames]);

      allSheets.forEach(sheetName => {
        const sheet1 = data1.sheets[sheetName] || [];
        const sheet2 = data2.sheets[sheetName] || [];
        allComparisons[sheetName] = compareSheets(sheet1, sheet2);
      });

      setComparison({
        sheetNames: Array.from(allSheets),
        sheets: allComparisons,
        file1Name: file1.name,
        file2Name: mode === 'single' ? outputFile : file2.name
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonTable = () => {
    if (!comparison) return null;

    // Calculate overall statistics across all sheets
    const overallStats = {
      totalCells: 0,
      matches: 0,
      differences: 0,
      accuracy: 0
    };

    Object.values(comparison.sheets).forEach(sheet => {
      overallStats.totalCells += sheet.stats.totalCells;
      overallStats.matches += sheet.stats.matches;
      overallStats.differences += sheet.stats.differences;
    });

    overallStats.accuracy = overallStats.totalCells > 0 
      ? ((overallStats.matches / overallStats.totalCells) * 100).toFixed(2) 
      : 0;

    // Sort sheets by accuracy in decreasing order
    const sortedSheetNames = [...comparison.sheetNames].sort((a, b) => {
      const accuracyA = parseFloat(comparison.sheets[a].stats.accuracy);
      const accuracyB = parseFloat(comparison.sheets[b].stats.accuracy);
      return accuracyB - accuracyA; // Descending order
    });

    const currentSheetName = sortedSheetNames[selectedSheet];
    const currentSheetStats = comparison.sheets[currentSheetName].stats;
    const accuracyPercent = parseFloat(currentSheetStats.accuracy);

    return (
      <div className="space-y-6 animate-slide-in">
        {/* Overall Comparison Stats */}
        <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Overall Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <div className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">MATCHES</div>
              <div className="text-4xl font-black text-green-600 dark:text-green-500">{overallStats.matches}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">DIFFERENCES</div>
              <div className="text-4xl font-black text-red-600 dark:text-red-500">{overallStats.differences}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
              <div className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">ACCURACY</div>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-500">{overallStats.accuracy}%</div>
            </div>
          </div>
        </div>

        {/* Sheet Comparison Slider */}
        <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Sheet Comparison
            </h3>
          </div>

          {/* Sheet Tabs - Horizontal Scrollable */}
          <div className="relative bg-gradient-to-r from-slate-100 via-purple-50 to-slate-100 dark:from-slate-900/50 dark:via-purple-900/20 dark:to-slate-900/50 p-1">
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
              {sortedSheetNames.map((sheetName, index) => {
                const sheetStats = comparison.sheets[sheetName].stats;
                const sheetAccuracy = parseFloat(sheetStats.accuracy);
                
                return (
                  <button
                    key={sheetName}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 shadow-md ${
                      selectedSheet === index
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/50'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-600 hover:scale-102'
                    }`}
                    onClick={() => setSelectedSheet(index)}
                  >
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${selectedSheet === index ? 'text-white' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{sheetName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Sheet Details */}
          <div className="p-8 space-y-6 animate-fade-in">
            {/* Sheet Name Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{currentSheetName}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Sheet {selectedSheet + 1} of {sortedSheetNames.length}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSheet(Math.max(0, selectedSheet - 1))}
                  disabled={selectedSheet === 0}
                  className={`p-3 rounded-xl font-bold transition-all duration-200 ${
                    selectedSheet === 0
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedSheet(Math.min(sortedSheetNames.length - 1, selectedSheet + 1))}
                  disabled={selectedSheet === sortedSheetNames.length - 1}
                  className={`p-3 rounded-xl font-bold transition-all duration-200 ${
                    selectedSheet === sortedSheetNames.length - 1
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Matches */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wide">Matches</div>
                <div className="text-3xl font-black text-green-600 dark:text-green-500">{currentSheetStats.matches}</div>
              </div>

              {/* Differences */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-rose-400 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1 uppercase tracking-wide">Differences</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-500">{currentSheetStats.differences}</div>
              </div>

              {/* Total Fields */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Fields</div>
                <div className="text-3xl font-black text-slate-600 dark:text-slate-300">{currentSheetStats.totalCells}</div>
              </div>

              {/* Accuracy */}
              <div className={`bg-gradient-to-br border-2 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200 ${
                accuracyPercent >= 90 
                  ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                  : accuracyPercent >= 75
                  ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                    accuracyPercent >= 90 
                      ? 'bg-green-500'
                      : accuracyPercent >= 75
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className={`text-xs font-bold mb-1 uppercase tracking-wide ${
                  accuracyPercent >= 90 
                    ? 'text-green-700 dark:text-green-400'
                    : accuracyPercent >= 75
                    ? 'text-yellow-700 dark:text-yellow-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>Accuracy</div>
                <div className={`text-3xl font-black ${
                  accuracyPercent >= 90 
                    ? 'text-green-600 dark:text-green-500'
                    : accuracyPercent >= 75
                    ? 'text-yellow-600 dark:text-yellow-500'
                    : 'text-red-600 dark:text-red-500'
                }`}>{currentSheetStats.accuracy}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
            {mode === 'single' ? 'Validate Financial Data' : 'Compare Excel Reports'}
          </h2>
          <p className="text-xl text-indigo-50 max-w-2xl mx-auto font-medium">
            {mode === 'single' 
              ? 'Upload your expected output to validate extraction accuracy'
              : 'Upload two Excel files to perform a detailed comparison analysis'
            }
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className={`grid grid-cols-1 ${mode === 'dual' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl shadow-lg p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <label className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {mode === 'single' ? 'Expected Output File' : 'First Excel File'}
            </label>
            <div className="relative">
              <input
                type="file"
                id="file1"
                onChange={(e) => handleFileChange(e, 1)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".xlsx,.xls"
              />
              <div className={`flex items-center gap-3 px-5 py-4 border-2 border-dashed rounded-xl transition-all duration-300 ${
                file1 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20' 
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/50 hover:shadow-lg'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  file1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {file1 ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`block text-sm font-bold ${file1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {file1 ? '✓ File Selected' : 'Click to upload file'}
                  </span>
                  <span className={`block text-xs truncate ${file1 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-500'}`}>
                    {file1 ? file1.name : 'Supports .xlsx and .xls formats'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {mode === 'dual' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-2xl shadow-lg p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <label className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Second Excel File
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file2"
                  onChange={(e) => handleFileChange(e, 2)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".xlsx,.xls"
                />
                <div className={`flex items-center gap-3 px-5 py-4 border-2 border-dashed rounded-xl transition-all duration-300 ${
                  file2 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-slate-800/50 hover:shadow-lg'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    file2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {file2 ? (
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`block text-sm font-bold ${file2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {file2 ? '✓ File Selected' : 'Click to upload file'}
                    </span>
                    <span className={`block text-xs truncate ${file2 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-500'}`}>
                      {file2 ? file2.name : 'Supports .xlsx and .xls formats'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'single' && outputFile && (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl shadow-lg p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <label className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Extracted Output
              </label>
              <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-800/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-400">Ready for comparison</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-500 truncate">{outputFile}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 p-5 rounded-xl animate-slide-in shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-red-900 dark:text-red-300 font-bold text-base">Validation Error</p>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Repositioned with Financial Theme */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
        <button
          onClick={handleCompare}
          disabled={loading || !file1 || (mode === 'dual' && !file2)}
          className={`group relative overflow-hidden px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
            loading || !file1 || (mode === 'dual' && !file2)
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105'
          }`}
        >
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          <svg className="relative z-10 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="relative z-10">{loading ? 'Analyzing...' : 'Compare Files'}</span>
        </button>
        {onBack && (
          <button 
            onClick={onBack} 
            className="px-8 py-5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            ← Back to Results
          </button>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && renderComparisonTable()}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48);
        }
      `}</style>
    </div>
  );
};

export default CompareXLSX;
