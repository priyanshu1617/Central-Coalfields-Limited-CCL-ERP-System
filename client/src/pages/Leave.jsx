import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Calendar, Plus, Check, X, AlertTriangle } from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server down, falling back to mock leaves history.');
      setLeaves([
        {
          _id: 'leave-1',
          employee: { name: 'Vikash Kumar', employeeId: 'CCL008', department: 'Mining Operations' },
          leaveType: 'Earned Leave',
          startDate: '2025-06-01',
          endDate: '2025-06-10',
          reason: 'Visiting hometown for family marriage function',
          status: 'Approved'
        },
        {
          _id: 'leave-2',
          employee: user || { name: 'Rajiv Kumar', employeeId: 'CCL003', department: 'Mining Operations' },
          leaveType: 'Sick Leave',
          startDate: '2025-05-20',
          endDate: '2025-05-22',
          reason: 'Fever and medical checkup',
          status: 'Pending'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!startDate || !endDate || !reason) {
      setError('Please fill in all details.');
      return;
    }

    try {
      const res = await api.post('/leaves', { leaveType, startDate, endDate, reason });
      if (res.data.success) {
        setMsg('Leave request submitted successfully!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/leaves/${id}/status`, { status });
      if (res.data.success) {
        fetchLeaves();
      }
    } catch (err) {
      alert('Failed to update leave request status: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const isHR = user?.role === 'Admin' || user?.role === 'HR';
  
  // Calculate balances
  const balances = { casual: 8, sick: 12, earned: 24 };

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Leave Management Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Request vacation, medical, or casual leave and monitor review pipelines.</p>
      </div>

      {/* FEEDBACK STATUS */}
      {msg && (
        <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs">
          {msg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* LEAVE BALANCE TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Casual Leave Balance</span>
          <div className="text-2xl font-black mt-2">{balances.casual} Days</div>
          <span className="text-[9px] text-slate-400">Reset on Jan 1st</span>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sick Leave Balance</span>
          <div className="text-2xl font-black mt-2">{balances.sick} Days</div>
          <span className="text-[9px] text-slate-400">Paid medical leave</span>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Earned Leave Balance</span>
          <div className="text-2xl font-black mt-2">{balances.earned} Days</div>
          <span className="text-[9px] text-slate-400">Accumulated balance</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEAVE APPLY FORM CARD */}
        <Card className="lg:col-span-1">
          <h2 className="font-bold text-sm mb-4">Request Leave</h2>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
              >
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Maternity/Paternity Leave</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Justification / Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                placeholder="Brief description of emergency or vacation plans..."
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-ccl-primary"
                required
              ></textarea>
            </div>

            <Button type="submit" className="w-full">
              Submit Request
            </Button>

          </form>
        </Card>

        {/* LEAVE HISTORY LISTS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* HR APPROVAL TABLE */}
          {isHR && (
            <Card className="overflow-x-auto">
              <h2 className="font-bold text-sm mb-3 text-ccl-primary dark:text-white">Pending Team Approvals</h2>
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="py-2">Employee</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Duration</th>
                    <th className="py-2 px-2">Reason</th>
                    <th className="py-2 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.filter(l => l.status === 'Pending').length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-400">No pending leave requests.</td>
                    </tr>
                  ) : (
                    leaves.filter(l => l.status === 'Pending').map((l) => (
                      <tr key={l._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <div className="font-semibold">{l.employee?.name}</div>
                          <span className="text-[10px] text-slate-400">{l.employee?.employeeId}</span>
                        </td>
                        <td className="py-2.5 px-2 font-medium">{l.leaveType}</td>
                        <td className="py-2.5 px-2 text-[10px]">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-2 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                        <td className="py-2.5 pl-2 text-right space-x-1.5 flex justify-end">
                          <button
                            onClick={() => handleUpdateStatus(l._id, 'Approved')}
                            className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(l._id, 'Rejected')}
                            className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          )}

          {/* GENERAL LEAVE HISTORY */}
          <Card className="overflow-x-auto">
            <h2 className="font-bold text-sm mb-3">Leave Activity Log</h2>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-2">Employee</th>
                  <th className="py-2 px-2">Leave Category</th>
                  <th className="py-2 px-2">Date range</th>
                  <th className="py-2 px-2">Reason</th>
                  <th className="py-2 pl-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-400">No leave requests found.</td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id} className="border-b border-slate-50 dark:border-slate-850">
                      <td className="py-2.5">
                        <div className="font-semibold">{l.employee?.name || 'Self'}</div>
                        <span className="text-[10px] text-slate-400">{l.employee?.employeeId || user?.employeeId}</span>
                      </td>
                      <td className="py-2.5 px-2 font-medium">{l.leaveType}</td>
                      <td className="py-2.5 px-2 text-[10px] text-slate-500">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                      <td className="py-2.5 pl-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                          l.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Leave;
