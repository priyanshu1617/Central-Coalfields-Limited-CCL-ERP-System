import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Truck, Plus, CheckCircle, Navigation, MapPin } from 'lucide-react';

const Dispatch = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDisp, setNewDisp] = useState({
    truckNumber: '', coalQuantity: '', destination: '', customer: '', invoiceNumber: '', gatePassNumber: ''
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dispatch');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server down. Loading mock dispatch history.');
      setLogs([
        { _id: 'd1', truckNumber: 'JH01EF-1234', coalQuantity: 25, destination: 'NTPC Kahalgaon Thermal Power Station', customer: 'NTPC Limited', invoiceNumber: 'INV-2025-0988', status: 'In Transit', gatePassNumber: 'GP-9921-2025', dispatchTime: '2025-05-19T10:15:00Z' },
        { _id: 'd2', truckNumber: 'JH02GH-5678', coalQuantity: 32, destination: 'DVC Bokaro Thermal Power Station', customer: 'Damodar Valley Corporation', invoiceNumber: 'INV-2025-0989', status: 'Delivered', gatePassNumber: 'GP-9922-2025', dispatchTime: '2025-05-19T08:30:00Z' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!newDisp.truckNumber || !newDisp.coalQuantity || !newDisp.destination || !newDisp.customer || !newDisp.invoiceNumber || !newDisp.gatePassNumber) {
      setError('Please fill in all details.');
      return;
    }

    try {
      const res = await api.post('/dispatch', {
        ...newDisp,
        coalQuantity: Number(newDisp.coalQuantity)
      });
      if (res.data.success) {
        setMsg('Dispatch log created successfully!');
        setNewDisp({ truckNumber: '', coalQuantity: '', destination: '', customer: '', invoiceNumber: '', gatePassNumber: '' });
        setShowAddForm(false);
        fetchDispatches();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log dispatch.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/dispatch/${id}`, { status });
      if (res.data.success) {
        fetchDispatches();
      }
    } catch (err) {
      alert('Failed to update dispatch status: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const isLogisticsStaff = user?.role === 'Admin' || user?.role === 'Production Manager' || user?.role === 'Inventory Manager';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Coal Dispatch Logistics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitor truck delivery pipelines, invoice bindings, and gate pass clearances.</p>
        </div>
        {isLogisticsStaff && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel Dispatch' : 'Log New Dispatch'}
          </Button>
        )}
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* CREATE DISPATCH FORM */}
      {showAddForm && (
        <Card className="max-w-lg">
          <h2 className="font-bold text-sm mb-3">Record Shipment Dispatch</h2>
          <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Truck Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JH01EF-1234"
                  value={newDisp.truckNumber}
                  onChange={(e) => setNewDisp({ ...newDisp, truckNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Coal Quantity (Tonnes)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25"
                  value={newDisp.coalQuantity}
                  onChange={(e) => setNewDisp({ ...newDisp, coalQuantity: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Customer Name</label>
              <input
                type="text"
                required
                placeholder="e.g. NTPC Limited"
                value={newDisp.customer}
                onChange={(e) => setNewDisp({ ...newDisp, customer: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Destination Address</label>
              <input
                type="text"
                required
                placeholder="e.g. NTPC Kahalgaon, Bihar"
                value={newDisp.destination}
                onChange={(e) => setNewDisp({ ...newDisp, destination: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Invoice Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2025-0988"
                  value={newDisp.invoiceNumber}
                  onChange={(e) => setNewDisp({ ...newDisp, invoiceNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Gate Pass Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GP-9921-2025"
                  value={newDisp.gatePassNumber}
                  onChange={(e) => setNewDisp({ ...newDisp, gatePassNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Create Dispatch Entry</Button>
          </form>
        </Card>
      )}

      {/* DISPATCH ACTIVE SHIPMENTS */}
      <Card className="overflow-x-auto">
        <h2 className="font-bold text-sm mb-4">Active Coal Shipments</h2>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
              <th className="py-2.5">Gate Pass & Invoice</th>
              <th className="py-2.5 px-3">Truck Plate</th>
              <th className="py-2.5 px-3 text-right">Coal Qty</th>
              <th className="py-2.5 px-3">Customer Destination</th>
              <th className="py-2.5 px-3">Dispatch Time</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((disp) => (
              <tr key={disp._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                <td className="py-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{disp.gatePassNumber}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{disp.invoiceNumber}</span>
                </td>
                <td className="py-3 px-3 font-bold text-ccl-primary dark:text-blue-300 flex items-center mt-1.5">
                  <Truck size={14} className="mr-1.5 text-slate-400 shrink-0" />
                  {disp.truckNumber}
                </td>
                <td className="py-3 px-3 text-right font-black text-slate-800 dark:text-slate-100">{disp.coalQuantity} t</td>
                <td className="py-3 px-3 text-slate-500 truncate max-w-xs" title={disp.destination}>
                  <div className="font-semibold">{disp.customer}</div>
                  <div className="text-[10px] text-slate-400 flex items-center"><MapPin size={10} className="mr-0.5" />{disp.destination}</div>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {new Date(disp.dispatchTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    disp.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-955'
                  }`}>
                    {disp.status}
                  </span>
                </td>
                <td className="py-3 pl-3 text-right">
                  {disp.status === 'In Transit' && isLogisticsStaff && (
                    <Button variant="outline" className="text-[10px] py-1 px-2.5 h-8 font-semibold" onClick={() => handleUpdateStatus(disp._id, 'Delivered')}>
                      Mark Delivered
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

    </div>
  );
};

export default Dispatch;
