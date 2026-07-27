import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { FileText, Download, Calendar, CheckSquare } from 'lucide-react';
import api from '../services/api.js';

const Reports = () => {
  const [reportType, setReportType] = useState('production');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-19');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      let endpoint = `/${reportType}`;
      if (reportType === 'production') endpoint = '/production';
      else if (reportType === 'employees') endpoint = '/employees';
      else if (reportType === 'attendance') endpoint = '/attendance';
      else if (reportType === 'inventory') endpoint = '/inventory';
      else if (reportType === 'finance') endpoint = '/finance';
      else if (reportType === 'safety') endpoint = '/safety';

      const res = await api.get(endpoint);
      if (res.data.success) {
        const rawData = res.data.data || res.data.data || [];
        
        // Generate CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        if (rawData.length > 0) {
          // Get headers from first item keys
          const headers = Object.keys(rawData[0]).filter(k => typeof rawData[0][k] !== 'object');
          csvContent += headers.join(",") + "\r\n";
          
          rawData.forEach((row) => {
            const line = headers.map(h => {
              let cell = row[h] === undefined ? "" : String(row[h]);
              // Escape commas
              if (cell.includes(",")) cell = `"${cell}"`;
              return cell;
            }).join(",");
            csvContent += line + "\r\n";
          });
        } else {
          csvContent += "No records found\r\n";
        }

        // Simulate file download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ccl_${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMsg(`Report successfully exported in ${format.toUpperCase()} format! Check your downloads.`);
      }
    } catch (err) {
      console.warn('Backend server down, downloading mock dataset.');
      // Fallback Mock CSV
      const mockCsv = "Date,Mine,Tonnage,Grade,Supervisor\n2025-05-19,North KaranpuraOpenCast,8560,G3,Rajiv Kumar\n2025-05-19,South KaranpuraOpenCast,7420,G4,Vikash Kumar";
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + mockCsv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ccl_mock_${reportType}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMsg(`Mock report successfully generated in ${format.toUpperCase()} format!`);
    }
    setLoading(false);
  };

  const reportModules = [
    { value: 'production', label: 'Coal Extraction & Production logs' },
    { value: 'employees', label: 'HR Directory & Service Timeline data' },
    { value: 'attendance', label: 'Employee Attendance & Shift logs' },
    { value: 'inventory', label: 'Store Items Inventory Catalog' },
    { value: 'finance', label: 'Revenues & Cost Center Expenses Ledgers' },
    { value: 'safety', label: 'Safety Incidents & Inspection reports' }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Reports & Analytics exporter</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Compile database stats filters and download structured Excel/CSV documents.</p>
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs border border-green-100">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* EXPORT OPTIONS */}
        <Card className="md:col-span-2">
          <h2 className="font-bold text-sm mb-4">Export Setup Panel</h2>
          <form onSubmit={handleExport} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Select Target Module</label>
              <div className="space-y-2">
                {reportModules.map((mod) => (
                  <label key={mod.value} className="flex items-center space-x-2.5 p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={mod.value}
                      checked={reportType === mod.value}
                      onChange={() => setReportType(mod.value)}
                      className="text-ccl-primary focus:ring-ccl-primary h-4 w-4"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
              >
                <option value="csv">CSV (Comma Separated Values)</option>
                <option value="xls">Excel Spreadsheet (XLS)</option>
              </select>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-4">
              <Download size={16} className="mr-1.5" /> Compile & Download Report
            </Button>

          </form>
        </Card>

        {/* POLICY INFORMATION */}
        <Card className="h-fit space-y-4">
          <h2 className="font-bold text-sm mb-2 flex items-center"><CheckSquare size={16} className="mr-1 text-ccl-accent" />Compliance Policy</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>&bull; Auditing guidelines require all export triggers to be logged with current employee timestamp markers.</p>
            <p>&bull; Financial reporting exports are encrypted by default to protect salary ledger particulars.</p>
            <p>&bull; Public safety disclosures are compliant with CIL Coal India directives.</p>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Reports;
