import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Plus, Check, X, Users, ShoppingCart, FileText } from 'lucide-react';

const Procurement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requisitions');
  const [reqs, setReqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  
  // Requisition Form State
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const resReq = await api.get('/procurement');
      if (resReq.data.success) setReqs(resReq.data.data);

      const resVen = await api.get('/vendors');
      if (resVen.data.success) setVendors(resVen.data.data);

      const resItem = await api.get('/inventory');
      if (resItem.data.success) {
        setItems(resItem.data.data);
        if (resItem.data.data.length > 0) setItemId(resItem.data.data[0]._id);
      }
    } catch (err) {
      console.warn('Backend server down. Loading mock procurement data.');
      setReqs([
        { _id: 'pr-1', item: { name: 'Explosive ANFO' }, quantity: 100, estimatedCost: 150000, requestedBy: { name: 'Rajiv Kumar' }, status: 'Pending' },
        { _id: 'pr-2', item: { name: 'Mining Safety Kits' }, quantity: 150, estimatedCost: 225000, requestedBy: { name: 'Priyanka Sharma' }, status: 'Approved', approvedBy: { name: 'Aditya Vardhan' }, vendor: { companyName: 'Safety Equipments India' } }
      ]);
      setVendors([
        { _id: 'v1', companyName: 'Coal India Spares Ltd', contactPerson: 'Amit Sharma', gstNumber: '20AAACC1234F1Z1', phone: '+91 9431100223', address: 'Industrial Area, Ranchi' },
        { _id: 'v2', companyName: 'Bharat Explosives Ltd', contactPerson: 'Rajesh Singh', gstNumber: '20BBACD4567G2Z2', phone: '+91 6512540982', address: 'Gomia Area, Bokaro' }
      ]);
      setItems([
        { _id: 'i1', name: 'Explosive ANFO' }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!quantity || !cost) {
      setError('Please input quantity and estimated cost.');
      return;
    }

    try {
      const res = await api.post('/procurement', {
        item: itemId,
        quantity: Number(quantity),
        estimatedCost: Number(cost)
      });
      if (res.data.success) {
        setMsg('Purchase requisition submitted successfully!');
        setQuantity('');
        setCost('');
        setShowAddForm(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit requisition.');
    }
  };

  const handleApprove = async (id, status, vendorId) => {
    try {
      const res = await api.put(`/procurement/${id}/approve`, { status, vendor: vendorId });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to update procurement order: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const isStoreManager = user?.role === 'Admin' || user?.role === 'Inventory Manager';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Procurement & Vendors</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage vendor profiles, issue purchase orders, and monitor material requisitions pipeline.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel Request' : 'New Purchase Requisition'}
        </Button>
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* CREATE REQUISITION FORM */}
      {showAddForm && (
        <Card className="max-w-lg">
          <h2 className="font-bold text-sm mb-3">Requisition Purchase Form</h2>
          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Select Catalog Material</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
              >
                {items.map(i => (
                  <option key={i._id} value={i._id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Quantity Required</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Estimated Cost (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Submit Requisition</Button>
          </form>
        </Card>
      )}

      {/* TAB SELECTORS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`pb-3 px-6 text-xs font-bold transition-all ${
            activeTab === 'requisitions'
              ? 'border-b-2 border-ccl-primary text-ccl-primary dark:text-white dark:border-white font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Purchase Requisitions
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-6 text-xs font-bold transition-all ${
            activeTab === 'vendors'
              ? 'border-b-2 border-ccl-primary text-ccl-primary dark:text-white dark:border-white font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Certified Vendors Directory
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'requisitions' ? (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Item Requested</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Estimated Cost</th>
                <th className="py-2.5 px-3">Requested By</th>
                <th className="py-2.5 px-3">Approved By</th>
                <th className="py-2.5 pl-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((req) => (
                <tr key={req._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">{req.item?.name}</td>
                  <td className="py-3 px-3 text-right font-medium">{req.quantity}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">₹{req.estimatedCost?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{req.requestedBy?.name || 'Self'}</td>
                  <td className="py-3 px-3 text-slate-400">{req.approvedBy?.name || '--'}</td>
                  <td className="py-3 pl-3 text-center">
                    {req.status === 'Pending' && isStoreManager ? (
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleApprove(req._id, 'Approved', vendors[0]?._id)}
                          className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                          title="Approve Requisition"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => handleApprove(req._id, 'Rejected', null)}
                          className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                          title="Reject Requisition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-950'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Company Name</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">GST Number</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 pl-3">Registered Address</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-ccl-primary dark:text-blue-300">{v.companyName}</td>
                  <td className="py-3 px-3 font-bold">{v.contactPerson}</td>
                  <td className="py-3 px-3 text-[10px] font-mono text-slate-400">{v.gstNumber}</td>
                  <td className="py-3 px-3 text-slate-500">{v.phone}</td>
                  <td className="py-3 pl-3 text-slate-400 truncate max-w-xs">{v.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

    </div>
  );
};

export default Procurement;
