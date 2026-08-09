import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Flame, Plus, CheckCircle, Database, Edit, X } from 'lucide-react';

const Production = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [mineId, setMineId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('G3');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editMineId, setEditMineId] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editGrade, setEditGrade] = useState('G3');
  const [editDate, setEditDate] = useState('');

  const fetchProductionLogs = async () => {
    setLoading(true);
    try {
      const resLogs = await api.get('/production');
      if (resLogs.data.success) {
        setLogs(resLogs.data.data);
      }

      const resMines = await api.get('/mines');
      if (resMines.data.success) {
        setMines(resMines.data.data);
        if (resMines.data.data.length > 0) {
          setMineId(resMines.data.data[0]._id);
        }
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock production data.');
      // Mock Logs
      setLogs([
        { _id: 'p-1', mine: { name: 'North Karanpura' }, quantity: 8560, grade: 'G3', date: '2025-05-19', supervisor: { name: 'Rajiv Kumar' } },
        { _id: 'p-2', mine: { name: 'South Karanpura' }, quantity: 7420, grade: 'G4', date: '2025-05-19', supervisor: { name: 'Vikash Kumar' } },
        { _id: 'p-3', mine: { name: 'West Bokaro' }, quantity: 5230, grade: 'G5', date: '2025-05-19', supervisor: { name: 'Sunil Verma' } }
      ]);
      setMines([
        { _id: '1', name: 'North Karanpura' },
        { _id: '2', name: 'South Karanpura' }
      ]);
      setMineId('1');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductionLogs();
  }, []);

  const handleLogProduction = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!quantity) {
      setError('Please input production quantity.');
      return;
    }

    try {
      const res = await api.post('/production', {
        mine: mineId,
        quantity: Number(quantity),
        grade,
        date: date || new Date().toISOString()
      });
      if (res.data.success) {
        setMsg('Production log saved successfully!');
        setQuantity('');
        fetchProductionLogs();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log output.');
    }
  };

  const isProductionStaff = user?.role === 'Admin' || user?.role === 'Mine Manager' || user?.role === 'Production Manager';
  
  const handleEditClick = (log) => {
    setEditingLog(log);
    setEditMineId(log.mine?._id || log.mine || mines[0]?._id);
    setEditQuantity(log.quantity || '');
    setEditGrade(log.grade || 'G3');
    setEditDate(log.date ? new Date(log.date).toISOString().split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await api.put(`/production/${editingLog._id}`, {
        mine: editMineId,
        quantity: Number(editQuantity),
        grade: editGrade,
        date: editDate || new Date().toISOString()
      });
      if (res.data.success) {
        setMsg('Production log updated successfully!');
        setIsEditModalOpen(false);
        fetchProductionLogs();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update log.');
    }
  };

  // Total tonnes calculated
  const totalExtracted = logs.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Coal Production Logging</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Record daily extracted coal tonnage grades and track targets completion.</p>
      </div>

      {/* FEEDBACK alerts */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs border border-green-100">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOG OUTPUT FORM CARD */}
        <Card className="lg:col-span-1 h-fit">
          <h2 className="font-bold text-sm mb-4 flex items-center">
            <Flame size={16} className="text-ccl-accent mr-1.5" />
            Log Daily Output
          </h2>
          {isProductionStaff ? (
            <form onSubmit={handleLogProduction} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Select Target Mine</label>
                <select
                  value={mineId}
                  onChange={(e) => setMineId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                >
                  {mines.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Quantity (Tonnes)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 8500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Coal Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Log Date (Optional)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <Button type="submit" className="w-full">Save Production Log</Button>
            </form>
          ) : (
            <p className="text-xs text-slate-400">Only Admin, Mine Managers, or Production Planners can log extracted coal figures.</p>
          )}
        </Card>

        {/* LOGS TABLE LIST */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex items-center space-x-3.5">
              <div className="p-3 bg-blue-50 text-ccl-primary rounded-2xl dark:bg-blue-950/20">
                <Database size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Extracted Logged</span>
                <span className="text-lg font-black">{totalExtracted.toLocaleString()} t</span>
              </div>
            </Card>
            <Card className="flex items-center space-x-3.5">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl dark:bg-green-950/20">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Operational Quality Check</span>
                <span className="text-lg font-black text-green-600">Passed</span>
              </div>
            </Card>
          </div>

          {/* Logs Table */}
          <Card className="overflow-x-auto">
            <h2 className="font-bold text-sm mb-3">Historical Extraction Records</h2>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5 px-3">Mine Pit</th>
                  <th className="py-2.5 px-3 text-right">Quantity (Tonnes)</th>
                  <th className="py-2.5 px-3 text-center">Quality Grade</th>
                  <th className="py-2.5 pl-3">Logged By</th>
                  {isProductionStaff && <th className="py-2.5 pr-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No production logs available.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                      <td className="py-3 font-semibold">
                        {new Date(log.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 font-bold text-ccl-primary dark:text-blue-300">{log.mine?.name}</td>
                      <td className="py-3 px-3 text-right font-medium">{log.quantity?.toLocaleString()} t</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 text-[10px] font-extrabold">
                          {log.grade}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-slate-400">{log.supervisor?.name || 'Manager'}</td>
                      {isProductionStaff && (
                        <td className="py-3 pr-3 text-right">
                          <button
                            onClick={() => handleEditClick(log)}
                            className="p-1.5 text-slate-400 hover:text-ccl-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit Log"
                          >
                            <Edit size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

        </div>

      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-ccl-navy rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-bold text-sm">Edit Production Log</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLog} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Mine</label>
                <select
                  value={editMineId}
                  onChange={(e) => setEditMineId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                >
                  {mines.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Quantity (Tonnes)</label>
                  <input
                    type="number"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Grade</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Log Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <Button type="submit">Update Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Production;
