import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { ShieldAlert, AlertTriangle, Plus, Check, X, ShieldCheck } from 'lucide-react';

const Safety = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [mineId, setMineId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const resInc = await api.get('/safety');
      if (resInc.data.success) setIncidents(resInc.data.data);

      const resMines = await api.get('/mines');
      if (resMines.data.success) {
        setMines(resMines.data.data);
        if (resMines.data.data.length > 0) setMineId(resMines.data.data[0]._id);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock safety incident logs.');
      setIncidents([
        { _id: 's1', title: 'Low stock alert: Explosive items in North Karanpura', description: 'ANFO stock fell below safety margins.', severity: 'Medium', status: 'Reported', mine: { name: 'North Karanpura' }, reportedBy: { name: 'Sanjeev Nayan' }, date: '2025-05-19' },
        { _id: 's2', title: 'Overdue Dumper Maintenance', description: 'Ashok Leyland has exceeded running runtime hours.', severity: 'Low', status: 'Under Investigation', mine: { name: 'South Karanpura' }, reportedBy: { name: 'Sanjeev Nayan' }, date: '2025-05-19' }
      ]);
      setMines([
        { _id: '1', name: 'North Karanpura' },
        { _id: '2', name: 'South Karanpura' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!title || !desc) {
      setError('Please fill in title and description.');
      return;
    }

    try {
      const res = await api.post('/safety/report', { title, description: desc, severity, mine: mineId });
      if (res.data.success) {
        setMsg('Incident reported successfully. Safety alerts dispatched!');
        setTitle('');
        setDesc('');
        setShowAddForm(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file report.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/safety/${id}/status`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to update incident: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const isSafetyOfficer = user?.role === 'Admin' || user?.role === 'Safety Officer' || user?.role === 'Mine Manager';

  const getSeverityColor = (sev) => {
    if (sev === 'Critical') return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
    if (sev === 'High') return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
    if (sev === 'Medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-955';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Safety & Inspections Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">File incident report files, review hazard locations, and audit security compliance.</p>
        </div>
        {isSafetyOfficer && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel Report' : 'File Incident Report'}
          </Button>
        )}
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* CREATE INCIDENT REPORT */}
      {showAddForm && (
        <Card className="max-w-lg">
          <h2 className="font-bold text-sm mb-3">Incident Requisition Slip</h2>
          <form onSubmit={handleReportIncident} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Incident Headline</label>
              <input type="text" required placeholder="e.g. Water logging in pit pit 2B" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Select Mine Site</label>
                <select value={mineId} onChange={(e) => setMineId(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                  {mines.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Hazard Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Detailed Observation</label>
              <textarea required rows="3" placeholder="Describe the safety hazard, any equipment damaged, and immediate containment measures taken..." value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent" />
            </div>

            <Button type="submit" className="w-full">Dispatch Incident Alert</Button>
          </form>
        </Card>
      )}

      {/* SUMMARY STATS & INCIDENTS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Safety compliance score card */}
        <Card className="lg:col-span-1 h-fit space-y-4">
          <h2 className="font-bold text-sm mb-2">Safety Audit Summary</h2>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center space-x-3.5">
            <ShieldCheck size={28} className="text-green-600 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-400 uppercase">Compliance Score</div>
              <div className="text-2xl font-black text-green-600">98.4%</div>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl flex items-center space-x-3.5">
            <AlertTriangle size={28} className="text-orange-500 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-400 uppercase">Active Incidents</div>
              <div className="text-2xl font-black text-orange-500">{incidents.filter(i => i.status !== 'Resolved').length}</div>
            </div>
          </div>
        </Card>

        {/* Safety Incidents Table */}
        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="font-bold text-sm mb-4">Reported Incidents log</h2>
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Incident Info</th>
                <th className="py-2.5 px-3">Mine Location</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-slate-400">No safety incidents reported.</td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                    <td className="py-3 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{inc.title}</div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5" title={inc.description}>{inc.description}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-ccl-primary dark:text-blue-300">{inc.mine?.name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-500">{inc.status}</td>
                    <td className="py-3 pl-3 text-right">
                      {inc.status !== 'Resolved' && user?.role === 'Safety Officer' && (
                        <div className="flex justify-end space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(inc._id, 'Under Investigation')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 py-1 px-2 rounded border font-semibold text-slate-700"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(inc._id, 'Resolved')}
                            className="text-[10px] bg-green-50 hover:bg-green-100 py-1 px-2 rounded border border-green-200 font-semibold text-green-600"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

      </div>

    </div>
  );
};

export default Safety;
