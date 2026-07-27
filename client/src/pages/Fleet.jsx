import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Wrench, Truck, ShieldAlert, Plus, CheckCircle2, AlertCircle, Fuel, X } from 'lucide-react';

const Fleet = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('machinery');
  const [equipment, setEquipment] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fuel logging form states
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fuelQty, setFuelQty] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const resEq = await api.get('/equipment');
      if (resEq.data.success) setEquipment(resEq.data.data);

      const resVeh = await api.get('/vehicles');
      if (resVeh.data.success) {
        setVehicles(resVeh.data.data);
        if (resVeh.data.data.length > 0) setSelectedVehicleId(resVeh.data.data[0]._id);
      }
    } catch (err) {
      console.warn('Backend server down. Loading mock fleet details.');
      setEquipment([
        { _id: '1', name: 'Komatsu PC-1250', regNumber: 'EQ-EXC-001', model: 'Excavator', status: 'Running', runningHours: 4200, fuelConsumption: 45, nextServiceDate: '2026-08-15' },
        { _id: '2', name: 'Caterpillar 777D', regNumber: 'EQ-DMP-001', model: 'Dumper', status: 'Running', runningHours: 5800, fuelConsumption: 38, nextServiceDate: '2026-08-20' },
        { _id: '3', name: 'Sandvik DR412i', regNumber: 'EQ-DRL-001', model: 'Drill', status: 'Idle', runningHours: 1900, fuelConsumption: 25, nextServiceDate: '2026-09-01' },
        { _id: '4', name: 'Liebherr LTM 1050', regNumber: 'EQ-CRN-001', model: 'Crane', status: 'Maintenance', runningHours: 2400, fuelConsumption: 20, nextServiceDate: '2026-07-22' }
      ]);
      setVehicles([
        { _id: 'v1', regNumber: 'JH01EF-1234', model: 'Tata Signa 4825.TK', driver: { name: 'Vikash Kumar' }, status: 'Active', gpsStatus: 'Online', fuelLogs: [] },
        { _id: 'v2', regNumber: 'HR55K-9921', model: 'Ashok Leyland U-4019', driver: { name: 'Sunil Verma' }, status: 'Maintenance', gpsStatus: 'Offline', fuelLogs: [] }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogFuel = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!fuelQty || !fuelCost) {
      setError('Please fill in fuel quantity and cost.');
      return;
    }

    try {
      const res = await api.post(`/vehicles/${selectedVehicleId}/fuel`, {
        quantity: Number(fuelQty),
        cost: Number(fuelCost)
      });
      if (res.data.success) {
        setMsg('Fuel log saved successfully!');
        setFuelQty('');
        setFuelCost('');
        setShowFuelModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log fuel details.');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Running' || status === 'Active') return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    if (status === 'Maintenance') return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Fleet & Heavy Equipment Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track industrial excavators dozers runtimes and manage logistics drivers logs.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowFuelModal(true)} variant="outline">
            <Fuel size={16} className="mr-1.5" /> Log Vehicle Fuel
          </Button>
        </div>
      </div>

      {/* ERROR WIDGETS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* TAB SELECTOR */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('machinery')}
          className={`pb-3 px-6 text-xs font-bold transition-all ${
            activeTab === 'machinery'
              ? 'border-b-2 border-ccl-primary text-ccl-primary dark:text-white dark:border-white font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Heavy Mining Machinery
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-6 text-xs font-bold transition-all ${
            activeTab === 'fleet'
              ? 'border-b-2 border-ccl-primary text-ccl-primary dark:text-white dark:border-white font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Logistics Transport Fleet
        </button>
      </div>

      {/* TAB CONTENT VIEWPORTS */}
      {activeTab === 'machinery' ? (
        <Card className="overflow-x-auto">
          <h2 className="font-bold text-sm mb-4">Assigned Pit Heavy Equipments</h2>
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Reg Number</th>
                <th className="py-2.5 px-3">Equipment Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Running Hours</th>
                <th className="py-2.5 px-3 text-right">Fuel Rate</th>
                <th className="py-2.5 px-3">Next Service</th>
                <th className="py-2.5 pl-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-ccl-primary dark:text-blue-300">{eq.regNumber}</td>
                  <td className="py-3 px-3 font-bold">{eq.name}</td>
                  <td className="py-3 px-3 text-slate-500">{eq.model}</td>
                  <td className="py-3 px-3 text-right font-medium">{eq.runningHours} hrs</td>
                  <td className="py-3 px-3 text-right text-slate-500">{eq.fuelConsumption} L/h</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(eq.nextServiceDate).toLocaleDateString()}</td>
                  <td className="py-3 pl-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(eq.status)}`}>
                      {eq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <h2 className="font-bold text-sm mb-4">Corporate Vehicles Fleet</h2>
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Plate Number</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Assigned Driver</th>
                <th className="py-2.5 px-3">GPS Track</th>
                <th className="py-2.5 pl-3 text-center">Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((veh) => (
                <tr key={veh._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-ccl-primary dark:text-blue-300">{veh.regNumber}</td>
                  <td className="py-3 px-3 font-bold">{veh.model}</td>
                  <td className="py-3 px-3 text-slate-500">{veh.driver?.name || 'Unassigned'}</td>
                  <td className="py-3 px-3">
                    <span className={`h-2 w-2 rounded-full inline-block mr-1.5 ${veh.gpsStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] font-semibold">{veh.gpsStatus || 'Offline'}</span>
                  </td>
                  <td className="py-3 pl-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(veh.status)}`}>
                      {veh.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* FUEL LOGGING MODAL */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowFuelModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg mb-2 text-ccl-primary dark:text-white">Record Fuel Refill</h2>
            <p className="text-xs text-slate-400 mb-4 border-b pb-2">Log diesel costs and quantities for logistical assets.</p>

            <form onSubmit={handleLogFuel} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Select Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                >
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.regNumber} - {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Liters filled</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 180"
                    value={fuelQty}
                    onChange={(e) => setFuelQty(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Total Cost (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 16200"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setShowFuelModal(false)}>Cancel</Button>
                <Button type="submit">Save Fuel Receipt</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fleet;
