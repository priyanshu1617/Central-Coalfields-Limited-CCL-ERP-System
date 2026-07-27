import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { DollarSign, Landmark, Plus, FileText, Download } from 'lucide-react';

const Finance = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transaction form state
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Salaries');
  const [amount, setAmount] = useState('');
  const [costCenter, setCostCenter] = useState('North Karanpura Mine');
  const [desc, setDesc] = useState('');

  // Payslip form state
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [payslipMonth, setPayslipMonth] = useState('May 2025');

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const resFin = await api.get('/finance');
      if (resFin.data.success) setLogs(resFin.data.data);

      const resEmp = await api.get('/employees');
      if (resEmp.data.success) {
        setEmployees(resEmp.data.data);
        if (resEmp.data.data.length > 0) setSelectedEmpId(resEmp.data.data[0]._id);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock financial reports.');
      setLogs([
        { _id: 'f1', type: 'Revenue', category: 'Coal Sales', amount: 4500000, date: '2025-05-18', costCenter: 'North Karanpura Mine', description: 'Invoice payment received from NTPC' },
        { _id: 'f2', type: 'Expense', category: 'Fuel Cost', amount: 280000, date: '2025-05-17', costCenter: 'Ranchi HQ Logistics', description: 'Diesel bulk purchase' },
        { _id: 'f3', type: 'Expense', category: 'Equipment Purchase', amount: 15000000, date: '2025-05-01', costCenter: 'West Bokaro Mine', description: 'Acquisition of new rig' }
      ]);
      setEmployees([
        { _id: 'e1', name: 'Rajiv Kumar', employeeId: 'CCL003' },
        { _id: 'e2', name: 'Vikash Kumar', employeeId: 'CCL008' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!amount || !category) {
      setError('Please input amount and category.');
      return;
    }

    try {
      const res = await api.post('/finance', { type, category, amount: Number(amount), costCenter, description: desc });
      if (res.data.success) {
        setMsg('Financial ledger logged successfully!');
        setAmount('');
        setDesc('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post transaction.');
    }
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll/payslip', { employeeId: selectedEmpId, month: payslipMonth });
      
      // Open payslip HTML in a new print-ready window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(res.data);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      alert('Failed to generate payslip: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const isFinanceOfficer = user?.role === 'Admin' || user?.role === 'Finance Manager' || user?.role === 'HR';

  // Calculations
  const revenueSum = logs.filter(l => l.type === 'Revenue').reduce((acc, curr) => acc + curr.amount, 0);
  const expenseSum = logs.filter(l => l.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = revenueSum - expenseSum;

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Finance & Payroll Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Record cash flows, expense cost centers, and generate employee salary payslips.</p>
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* THREE P&L SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</span>
          <div className="text-2xl font-black mt-2">₹{revenueSum.toLocaleString()}</div>
          <span className="text-[9px] text-slate-400">Total May logs sales</span>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Operating Expenses</span>
          <div className="text-2xl font-black mt-2">₹{expenseSum.toLocaleString()}</div>
          <span className="text-[9px] text-slate-400">Machinery, wages, diesel</span>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Net Balance</span>
          <div className={`text-2xl font-black mt-2 ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            ₹{netIncome.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400">Cost margin ratio</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEDGER POST & PAYROLL COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* LEDGER POST FORM */}
          {isFinanceOfficer && (
            <Card>
              <h2 className="font-bold text-sm mb-3">Record Transaction</h2>
              <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Flow Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                      <option>Expense</option>
                      <option>Revenue</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                      <option>Coal Sales</option>
                      <option>Salaries</option>
                      <option>Fuel Cost</option>
                      <option>Equipment Purchase</option>
                      <option>Safety Gear</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Amount (INR)</label>
                  <input type="number" required placeholder="e.g. 280000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Cost Center</label>
                  <select value={costCenter} onChange={(e) => setCostCenter(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                    <option>Ranchi HQ</option>
                    <option>North Karanpura Mine</option>
                    <option>South Karanpura Mine</option>
                    <option>West Bokaro Mine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Description</label>
                  <input type="text" placeholder="e.g. Diesel refill..." value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent" />
                </div>

                <Button type="submit" className="w-full">Log Transaction</Button>
              </form>
            </Card>
          )}

          {/* PAYROLL CREATOR CARD */}
          <Card>
            <h2 className="font-bold text-sm mb-3">Payslip Generator</h2>
            <form onSubmit={handleGeneratePayslip} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Select Employee</label>
                <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Salary Month</label>
                <select value={payslipMonth} onChange={(e) => setPayslipMonth(e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                  <option>May 2025</option>
                  <option>June 2025</option>
                  <option>July 2025</option>
                </select>
              </div>

              <Button type="submit" variant="outline" className="w-full text-blue-500 border-blue-200">
                <FileText size={16} className="mr-1" /> Compile & Print Payslip
              </Button>
            </form>
          </Card>

        </div>

        {/* LEDGER TRANSACTIONS HISTORY */}
        <Card className="lg:col-span-2 overflow-x-auto h-fit">
          <h2 className="font-bold text-sm mb-4">Financial Ledger Sheets</h2>
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Date</th>
                <th className="py-2.5 px-3">Flow</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Cost Center</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 pl-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                  <td className="py-3 font-semibold">
                    {new Date(log.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.type === 'Revenue' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-955'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold">{log.category}</td>
                  <td className="py-3 px-3 text-slate-500">{log.costCenter}</td>
                  <td className="py-3 px-3 text-right font-black text-slate-800 dark:text-slate-100">
                    ₹{log.amount?.toLocaleString()}
                  </td>
                  <td className="py-3 pl-3 text-slate-400 truncate max-w-xs">{log.description || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

      </div>

    </div>
  );
};

export default Finance;
