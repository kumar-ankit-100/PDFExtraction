import React, { useState } from 'react';

const ExcelSheetViewer = ({ data }) => {
  const [activeSheet, setActiveSheet] = useState(0);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold text-lg">No data to display</p>
        </div>
      </div>
    );
  }

  // Build sheets from the extracted data
  const sheets = buildSheets(data);

  if (sheets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold text-lg">No sheets available</p>
        </div>
      </div>
    );
  }

  const currentSheet = sheets[activeSheet];

  return (
    <div className="space-y-6">
      {/* Sheet Tabs */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 rounded-2xl shadow-md p-1">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {sheets.map((sheet, index) => (
            <button
              key={index}
              className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-200 shadow-md ${
                activeSheet === index
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105 shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-blue-50 hover:scale-102'
              }`}
              onClick={() => setActiveSheet(index)}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet Content */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
        {/* Sheet Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white">{currentSheet.name}</h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600">
              <tr>
                {currentSheet.headers.map((header, idx) => (
                  <th key={idx} className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wider border-r border-blue-400/30 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentSheet.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className={`hover:bg-blue-50 transition-colors duration-150 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4 text-sm text-slate-800 font-medium border-r border-slate-200 last:border-r-0">
                      {formatCellValue(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Build sheets from extracted data - ALWAYS show all sheets
function buildSheets(data) {
  const sheets = [];

  // Sheet 1: Doc Summary
  const docSummary = {
    'File Name': data.file_name || '—',
    'Upload Date': data.upload_date || '—',
    'Status': data.status || 'Completed',
    'Template': data.template_id || 'Accurate Extraction',
    'Total Pages': data.total_pages || '—',
    'Processing Time': data.processing_time || '—'
  };
  sheets.push({
    name: 'Doc Summary',
    headers: ['Field', 'Value'],
    rows: Object.entries(docSummary).map(([key, value]) => [key, value])
  });

  // Sheet 2: Portfolio Summary (Fund Summary)
  const fundSummary = data.preview_data?.fund_summary || data.extracted_data?.fund_summary || {};
  if (Object.keys(fundSummary).length > 0) {
    sheets.push({
      name: 'Portfolio Summary',
      headers: ['Field', 'Value'],
      rows: Object.entries(fundSummary).map(([key, value]) => [
        formatFieldName(key),
        value
      ])
    });
  } else {
    sheets.push({
      name: 'Portfolio Summary',
      headers: ['Field', 'Value'],
      rows: [['No data extracted', '—']]
    });
  }

  // Sheet 3: Schedule of Investments (Portfolio Companies)
  const companies = data.preview_data?.portfolio_companies_sample || 
                    data.extracted_data?.portfolio_companies || 
                    data.extracted_data?.schedule_of_investments || [];
  
  if (companies.length > 0) {
    const allKeys = new Set();
    companies.forEach(company => {
      Object.keys(company).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const rows = companies.map(company => 
      headers.map(header => company[header] ?? '—')
    );

    sheets.push({
      name: 'Schedule of Investments',
      headers: headers,
      rows: rows
    });
  } else {
    sheets.push({
      name: 'Schedule of Investments',
      headers: ['Company', 'Investment Type', 'Fair Value'],
      rows: [['No companies extracted', '—', '—']]
    });
  }

  // Sheet 4: Statement of Operations
  const operations = data.extracted_data?.statement_of_operations || [];
  if (operations.length > 0) {
    const allKeys = new Set();
    operations.forEach(period => {
      Object.keys(period).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const rows = operations.map(period => 
      headers.map(header => period[header] ?? '—')
    );

    sheets.push({
      name: 'Statement of Operations',
      headers: headers,
      rows: rows
    });
  } else {
    sheets.push({
      name: 'Statement of Operations',
      headers: ['Period', 'Total Income', 'Total Expenses', 'Net Income'],
      rows: [['No data extracted', '—', '—', '—']]
    });
  }

  // Sheet 5: Statement of Cash Flows
  const cashflows = data.extracted_data?.statement_of_cashflows || [];
  if (cashflows.length > 0) {
    const allKeys = new Set();
    cashflows.forEach(period => {
      Object.keys(period).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const rows = cashflows.map(period => 
      headers.map(header => period[header] ?? '—')
    );

    sheets.push({
      name: 'Statement of Cashflows',
      headers: headers,
      rows: rows
    });
  } else {
    sheets.push({
      name: 'Statement of Cashflows',
      headers: ['Period', 'Operating Activities', 'Investing Activities', 'Financing Activities'],
      rows: [['No data extracted', '—', '—', '—']]
    });
  }

  // Sheet 6: PCAP Statement
  const pcap = data.extracted_data?.pcap_statement || [];
  if (pcap.length > 0) {
    const allKeys = new Set();
    pcap.forEach(period => {
      Object.keys(period).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const rows = pcap.map(period => 
      headers.map(header => period[header] ?? '—')
    );

    sheets.push({
      name: 'PCAP Statement',
      headers: headers,
      rows: rows
    });
  } else {
    sheets.push({
      name: 'PCAP Statement',
      headers: ['Partner', 'Beginning Balance', 'Contributions', 'Distributions', 'Ending Balance'],
      rows: [['No data extracted', '—', '—', '—', '—']]
    });
  }

  // Sheet 7: Portfolio Company Profile
  sheets.push({
    name: 'Portfolio Company profile',
    headers: ['Company', 'Description', 'Website', 'Founded', 'Employees'],
    rows: [['Data not yet available', '—', '—', '—', '—']]
  });

  // Sheet 8: Portfolio Company Financials
  sheets.push({
    name: 'Portfolio Company Financials',
    headers: ['Company', 'Revenue', 'EBITDA', 'Net Income', 'Year'],
    rows: [['Data not yet available', '—', '—', '—', '—']]
  });

  // Sheet 9: Footnotes
  const footnotes = data.extracted_data?.footnotes || [];
  if (footnotes.length > 0) {
    sheets.push({
      name: 'Footnotes',
      headers: ['Number', 'Text'],
      rows: footnotes.map(fn => [fn.number || '—', fn.text || '—'])
    });
  } else {
    sheets.push({
      name: 'Footnotes',
      headers: ['Number', 'Text'],
      rows: [['No footnotes extracted', '—']]
    });
  }

  // Sheet 10: Reference Values
  sheets.push({
    name: 'Reference Values',
    headers: ['Metric', 'Definition', 'Formula'],
    rows: [
      ['DPI', 'Distributions to Paid-In Capital', 'Total Distributions / Total Paid-In Capital'],
      ['RVPI', 'Residual Value to Paid-In Capital', 'NAV / Total Paid-In Capital'],
      ['TVPI', 'Total Value to Paid-In Capital', '(Distributions + NAV) / Total Paid-In Capital'],
      ['IRR', 'Internal Rate of Return', 'Annualized effective compound return rate'],
      ['MOIC', 'Multiple on Invested Capital', 'Total Value / Invested Capital']
    ]
  });

  return sheets;
}

// Format field name to be more readable
function formatFieldName(fieldName) {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format cell value
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  
  if (typeof value === 'number') {
    // Format large numbers with commas
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return value;
  }
  
  return value;
}

export default ExcelSheetViewer;
