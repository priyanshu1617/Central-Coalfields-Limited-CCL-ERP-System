import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { LogIn, LogOut, Clock, Calendar, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState('General');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/attendance');
      if (res.data.success) {
        setLogs(res.data.data);
        
        // Find if user checked in today
        const today = new Date().toDateString();
        const personalToday = res.data.data.find(
          log => log.employee?._id === user?._id && new Date(log.date).toDateString() === today
        );
        if (personalToday) {
          setTodayRecord(personalToday);
          setIsCheckedIn(!!personalToday.checkIn && !personalToday.checkOut);
        }
      }
    } catch (err) {
      console.warn('Backend server not connected. Falling back to mock attendance logs.');
      // Mock logs
      const mockLogs = [
        {
          _id: 'att-1',
          employee: user || { name: 'Rajiv Kumar', employeeId: 'CCL003', department: 'Mining Operations' },
          date: new Date().toISOString(),
          checkIn: '08:45 AM',
          checkOut: '',
          shift: 'General',
          workingHours: 0,
          overtime: 0,
          status: 'Present'
        },
        {
          _id: 'att-2',
          employee: { name: 'Vikash Kumar', employeeId: 'CCL008', department: 'Mining Operations' },
          date: new Date().toISOString(),
          checkIn: '07:55 AM',
          checkOut: '04:15 PM',
          shift: 'Morning',
          workingHours: 8.33,
          overtime: 0.33,
          status: 'Present'
        }
      ];
      setLogs(mockLogs);
      const personalToday = mockLogs.find(
        log => log.employee?._id === user?._id || log.employee?.employeeId === user?.employeeId
      );
      if (personalToday) {
        setTodayRecord(personalToday);
        setIsCheckedIn(!!personalToday.checkIn && !personalToday.checkOut);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const handleCheckIn = async () => {
    setError('');
    setMsg('');
    try {
      const res = await api.post('/attendance/checkin', { shift });
      if (res.data.success) {
        setMsg('Successfully checked in for today!');
        fetchAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in.');
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMsg('');
    try {
      const res = await api.post('/attendance/checkout');
      if (res.data.success) {
        setMsg('Successfully checked out. Working hours updated!');
        fetchAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out.');
    }
  };

  const isHR = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Attendance & Shift Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track check-in/out stamps, shifts logs, and working times.</p>
      </div>

      {/* ERROR / CONFIRMATION WIDGETS */}
      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl flex items-center space-x-2 border border-red-100">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {msg && (
        <div className="p-3 bg-green-50 text-green-600 text-xs rounded-xl flex items-center space-x-2 border border-green-100">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* CHECKIN INTERACTIVE BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Gate-Punch Widget */}
        <Card className="flex flex-col justify-between md:col-span-1 min-h-[220px]">
          <div>
            <h2 className="font-bold text-sm mb-1 flex items-center"><Clock size={16} className="text-ccl-accent mr-1.5" />Punch Card</h2>
            <p className="text-[10px] text-slate-400">Record gate entries for the Ranchi HQ or assigned Mines.</p>
          </div>

          <div className="my-6">
            {!isCheckedIn ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Select Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option value="General">General (09:00 AM - 05:30 PM)</option>
                    <option value="Morning">Morning Shift (06:00 AM - 02:00 PM)</option>
                    <option value="Evening">Evening Shift (02:00 PM - 10:00 PM)</option>
                    <option value="Night">Night Shift (10:00 PM - 06:00 AM)</option>
                  </select>
                </div>
                <Button onClick={handleCheckIn} className="w-full" variant="success">
                  <LogIn size={16} className="mr-1.5" /> Check In Gate
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-blue-50/50 dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 text-xs">
                  <p className="text-[10px] text-slate-400">Checked in today at:</p>
                  <p className="text-lg font-black text-ccl-primary dark:text-blue-300 mt-1">{todayRecord?.checkIn || '08:45 AM'}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Shift: {todayRecord?.shift || 'General'}</p>
                </div>
                <Button onClick={handleCheckOut} className="w-full" variant="danger">
                  <LogOut size={16} className="mr-1.5" /> Check Out Gate
                </Button>
              </div>
            )}
          </div>

          <p className="text-[9px] text-slate-400 text-center">
            Punches are geo-tagged &bull; IP Logged
          </p>
        </Card>

        {/* User stats summary */}
        <Card className="flex flex-col justify-between md:col-span-1 min-h-[220px]">
          <div>
            <h2 className="font-bold text-sm mb-4">Your Summary (May 2025)</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-ccl-navy/30 border border-slate-100 dark:border-slate-800/80">
                <span className="text-xl font-extrabold block">19</span>
                <span className="text-[10px] text-slate-400">Days Present</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-ccl-navy/30 border border-slate-100 dark:border-slate-800/80">
                <span className="text-xl font-extrabold block">0</span>
                <span className="text-[10px] text-slate-400">Days Absent</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-ccl-navy/30 border border-slate-100 dark:border-slate-800/80">
                <span className="text-xl font-extrabold block">152 hrs</span>
                <span className="text-[10px] text-slate-400">Total Worked</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-ccl-navy/30 border border-slate-100 dark:border-slate-800/80">
                <span className="text-xl font-extrabold block">14.5 hrs</span>
                <span className="text-[10px] text-slate-400">Total Overtime</span>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 text-center">
            Overtime adds 150% base rate to payroll.
          </p>
        </Card>

        {/* Shift Guidelines alerts */}
        <Card className="flex flex-col justify-between md:col-span-1 min-h-[220px]">
          <div>
            <h2 className="font-bold text-sm mb-3">Shift Policy Guidelines</h2>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-normal">
              <p>&bull; Attendance must be punched within 15 minutes of shift start, otherwise flagged as <span className="font-semibold text-orange-500">Late</span>.</p>
              <p>&bull; Night Shift employees are entitled to specialized medical and safety allowances.</p>
              <p>&bull; Overtime must be authorized by the designated Mine Manager or Department Supervisor.</p>
            </div>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl flex items-center space-x-2 text-[10px] text-orange-600 dark:text-orange-300">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Monsoon safety shifts in effect.</span>
          </div>
        </Card>
      </div>

      {/* ATTENDANCE HISTORY LIST */}
      <Card className="overflow-x-auto">
        <h2 className="font-bold text-sm mb-4">{isHR ? 'All Employee Gate Punches' : 'Your Punch History'}</h2>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
              <th className="py-2.5">Date</th>
              {isHR && <th className="py-2.5 px-3">Employee</th>}
              <th className="py-2.5 px-3">Shift</th>
              <th className="py-2.5 px-3">Check-In</th>
              <th className="py-2.5 px-3">Check-Out</th>
              <th className="py-2.5 px-3 text-right">Work Hours</th>
              <th className="py-2.5 px-3 text-right">Overtime</th>
              <th className="py-2.5 pl-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={isHR ? 8 : 7} className="py-6 text-center text-slate-400">No attendance records logged.</td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3 font-semibold">
                    {new Date(log.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  {isHR && (
                    <td className="py-3 px-3">
                      <div className="font-semibold">{log.employee?.name}</div>
                      <div className="text-[10px] text-slate-400">{log.employee?.employeeId} &bull; {log.employee?.department}</div>
                    </td>
                  )}
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.shift}</td>
                  <td className="py-3 px-3 text-green-600 font-semibold">{log.checkIn || '--'}</td>
                  <td className="py-3 px-3 text-red-500 font-semibold">{log.checkOut || '--'}</td>
                  <td className="py-3 px-3 text-right font-medium">{log.workingHours || '--'} hrs</td>
                  <td className="py-3 px-3 text-right text-slate-400">{log.overtime || '--'} hrs</td>
                  <td className="py-3 pl-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

    </div>
  );
};

export default Attendance;
