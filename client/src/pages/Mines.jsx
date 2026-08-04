import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Landmark, Flame, Plus, Edit2, X } from 'lucide-react';

const Mines = () => {
  const { user } = useAuth();
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMine, setEditMine] = useState(null);
  const [error, setError] = useState('');

  // New Mine Form State
  const [newMine, setNewMine] = useState({
    name: '', area: '', status: 'Operational', targetOutput: '', dailyOutput: 0, safetyStatus: 'Safe'
  });

  const fetchMines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mines');
      if (res.data.success) {
        setMines(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock mines data.');
      setMines([
        { _id: '1', name: 'North Karanpura', area: 'Karanpura Area', status: 'Operational', targetOutput: 270000, dailyOutput: 8560, safetyStatus: 'Safe', supervisor: { name: 'Rajiv Kumar' } },
        { _id: '2', name: 'South Karanpura', area: 'Karanpura Area', status: 'Operational', targetOutput: 240000, dailyOutput: 7420, safetyStatus: 'Safe', supervisor: { name: 'Vikash Kumar' } },
        { _id: '3', name: 'West Bokaro', area: 'Bokaro Area', status: 'Operational', targetOutput: 180000, dailyOutput: 5230, safetyStatus: 'Warning', supervisor: { name: 'Sunil Verma' } },
        { _id: '4', name: 'East Bokaro', area: 'Bokaro Area', status: 'Operational', targetOutput: 120000, dailyOutput: 3520, safetyStatus: 'Critical', supervisor: { name: 'Rajiv Kumar' } },
        { _id: '5', name: 'Ramgarh', area: 'Ramgarh Area', status: 'Operational', targetOutput: 90000, dailyOutput: 2810, safetyStatus: 'Safe', supervisor: { name: 'Vikash Kumar' } }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMines();
  }, []);

  const handleCreateMine = async (e) => {
    e.preventDefault();
    setError('');
    if (!newMine.name || !newMine.area || !newMine.targetOutput) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.post('/mines', {
        ...newMine,
        targetOutput: Number(newMine.targetOutput),
        dailyOutput: Number(newMine.dailyOutput || 0)
      });
      if (res.data.success) {
        setMines([...mines, res.data.data]);
        setShowAddModal(false);
        setNewMine({ name: '', area: '', status: 'Operational', targetOutput: '', dailyOutput: 0, safetyStatus: 'Safe' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create mine.');
    }
  };

  const handleOpenEdit = (mine) => {
    setEditMine({ ...mine });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdateMine = async (e) => {
    e.preventDefault();
    setError('');
    if (!editMine.name || !editMine.area || !editMine.targetOutput) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.put(`/mines/${editMine._id}`, {
        ...editMine,
        targetOutput: Number(editMine.targetOutput),
        dailyOutput: Number(editMine.dailyOutput || 0)
      });
      if (res.data.success) {
        setMines(mines.map(m => m._id === editMine._id ? res.data.data : m));
        setShowEditModal(false);
        setEditMine(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mine pit.');
    }
  };

  const getSafetyBadge = (status) => {
    if (status === 'Safe') return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    if (status === 'Warning') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
  };

  const getStatusBadge = (status) => {
    if (status === 'Operational') return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    if (status === 'Maintenance') return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  const isManager = user?.role === 'Admin' || user?.role === 'Mine Manager';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Mine Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track operations, production targets, machinery allotments, and safety ratings.</p>
        </div>
        {isManager && (
          <Button onClick={() => { setError(''); setShowAddModal(true); }}>
            <Plus size={16} className="mr-1" /> Add Mine Pits
          </Button>
        )}
      </div>

      {/* MINES CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mines.map((mine) => {
          const ach = ((mine.dailyOutput / (mine.targetOutput / 30)) * 100).toFixed(1);
          return (
            <Card key={mine._id} className="flex flex-col justify-between space-y-4 relative group" hoverEffect>
              
              {/* Card Title */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center">
                    <Landmark size={16} className="text-ccl-primary dark:text-blue-400 mr-1.5 shrink-0" />
                    {mine.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{mine.area}</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(mine.status)}`}>
                    {mine.status}
                  </span>
                  {isManager && (
                    <button
                      onClick={() => handleOpenEdit(mine)}
                      title="Edit Mine Details"
                      className="p-1 rounded text-slate-400 hover:text-ccl-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Targets and achievements */}
              <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Monthly Target</span>
                  <span className="font-bold">{mine.targetOutput?.toLocaleString()} t</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Daily Output</span>
                  <span className="font-bold">{mine.dailyOutput?.toLocaleString()} t</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold">Daily Achievement Rate</span>
                  <span className="font-bold text-ccl-accent">{ach}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-ccl-accent h-full transition-all duration-500"
                    style={{ width: `${Math.min(Number(ach), 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer specs */}
              <div className="flex justify-between items-center text-[10px] pt-1">
                <div className="text-slate-500 dark:text-slate-400">
                  Supervisor: <span className="font-bold">{mine.supervisor?.name || 'Rajiv Kumar'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center ${getSafetyBadge(mine.safetyStatus)}`}>
                  <Flame size={10} className="mr-0.5" />
                  {mine.safetyStatus} Safety
                </span>
              </div>

            </Card>
          );
        })}
      </div>

      {/* ADD MINE PIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg mb-2 text-ccl-primary dark:text-white">Register Mine Pit</h2>
            <p className="text-xs text-slate-400 mb-4 border-b pb-2">Record a new geographic extraction zone.</p>

            {error && (
              <div className="p-2 mb-3 bg-red-50 text-red-500 text-xs rounded text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateMine} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Mine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Karanpura Open-Cast"
                  value={newMine.name}
                  onChange={(e) => setNewMine({ ...newMine, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Geographic Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karanpura Area"
                  value={newMine.area}
                  onChange={(e) => setNewMine({ ...newMine, area: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Monthly Target (Tonnes)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 240000"
                    value={newMine.targetOutput}
                    onChange={(e) => setNewMine({ ...newMine, targetOutput: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Daily Output (Tonnes)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={newMine.dailyOutput}
                    onChange={(e) => setNewMine({ ...newMine, dailyOutput: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Safety Status</label>
                  <select
                    value={newMine.safetyStatus}
                    onChange={(e) => setNewMine({ ...newMine, safetyStatus: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Safe</option>
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Mine Operations Status</label>
                  <select
                    value={newMine.status}
                    onChange={(e) => setNewMine({ ...newMine, status: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Operational</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Register Mine</Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT MINE PIT MODAL */}
      {showEditModal && editMine && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg mb-2 text-ccl-primary dark:text-white">Edit Mine Pit Details</h2>
            <p className="text-xs text-slate-400 mb-4 border-b pb-2">Update targets, status, and output for {editMine.name}</p>

            {error && (
              <div className="p-2 mb-3 bg-red-50 text-red-500 text-xs rounded text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateMine} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Mine Name</label>
                <input
                  type="text"
                  required
                  value={editMine.name || ''}
                  onChange={(e) => setEditMine({ ...editMine, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Geographic Area</label>
                <input
                  type="text"
                  required
                  value={editMine.area || ''}
                  onChange={(e) => setEditMine({ ...editMine, area: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Monthly Target (Tonnes)</label>
                  <input
                    type="number"
                    required
                    value={editMine.targetOutput || ''}
                    onChange={(e) => setEditMine({ ...editMine, targetOutput: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Daily Output (Tonnes)</label>
                  <input
                    type="number"
                    required
                    value={editMine.dailyOutput || ''}
                    onChange={(e) => setEditMine({ ...editMine, dailyOutput: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Safety Status</label>
                  <select
                    value={editMine.safetyStatus || 'Safe'}
                    onChange={(e) => setEditMine({ ...editMine, safetyStatus: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Safe</option>
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Mine Operations Status</label>
                  <select
                    value={editMine.status || 'Operational'}
                    onChange={(e) => setEditMine({ ...editMine, status: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Operational</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Mines;
