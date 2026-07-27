import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Package, AlertTriangle, AlertCircle, Plus, X, Search } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  
  // Add item form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '', category: 'Spare Parts', stockQuantity: '', reorderLevel: '', barcode: '', unit: 'pcs'
  });
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock inventory list.');
      setItems([
        { _id: 'i1', name: 'High Speed Diesel', category: 'Diesel', stockQuantity: 45000, reorderLevel: 10000, barcode: 'DSL-00982-HSD', unit: 'liters', supplier: { companyName: 'Bharat Petroleum' } },
        { _id: 'i2', name: 'Explosive ANFO', category: 'Explosives', stockQuantity: 120, reorderLevel: 150, barcode: 'EXP-ANFO-7762', unit: 'kg', supplier: { companyName: 'Bharat Explosives Ltd' } },
        { _id: 'i3', name: 'Excavator Bucket Teeth PC-1255', category: 'Spare Parts', stockQuantity: 24, reorderLevel: 10, barcode: 'SPR-EXC-BUCKET', unit: 'pcs', supplier: { companyName: 'Coal India Spares Ltd' } },
        { _id: 'i4', name: 'Mining Safety Kits (Helmet, Vest)', category: 'PPE Kits', stockQuantity: 80, reorderLevel: 100, barcode: 'PPE-KIT-HEAVY', unit: 'pcs', supplier: { companyName: 'Safety Equipments India' } }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setError('');

    if (!newMaterial.name || !newMaterial.stockQuantity || !newMaterial.reorderLevel) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.post('/inventory', {
        ...newMaterial,
        stockQuantity: Number(newMaterial.stockQuantity),
        reorderLevel: Number(newMaterial.reorderLevel)
      });
      if (res.data.success) {
        setItems([...items, res.data.data]);
        setShowAddModal(false);
        setNewMaterial({ name: '', category: 'Spare Parts', stockQuantity: '', reorderLevel: '', barcode: '', unit: 'pcs' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item.');
    }
  };

  const isStoreManager = user?.role === 'Admin' || user?.role === 'Inventory Manager';

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === '' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inventory & Stores</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage spare parts, bulk explosives reserves, diesel levels, and safety stocks.</p>
        </div>
        {isStoreManager && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-1" /> Add Stock Material
          </Button>
        )}
      </div>

      {/* FILTER PANEL */}
      <Card className="flex flex-col sm:flex-row gap-4 py-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search material description or barcodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-ccl-navy/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary"
          />
        </div>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy text-xs py-2 px-3 rounded-lg focus:outline-none w-full sm:w-48"
        >
          <option value="">All Categories</option>
          <option value="Spare Parts">Spare Parts</option>
          <option value="Explosives">Explosives</option>
          <option value="Diesel">Diesel</option>
          <option value="Lubricants">Lubricants</option>
          <option value="PPE Kits">PPE Kits</option>
          <option value="Tools">Tools</option>
        </select>
      </Card>

      {/* LOW STOCK BANNER ALERT */}
      {items.some(i => i.stockQuantity < i.reorderLevel) && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl flex items-center space-x-2 border border-red-100">
          <AlertCircle size={16} className="shrink-0" />
          <span><strong>Low Inventory Alerts:</strong> Explosives or PPE kit levels are below safety buffers. Dispatch requests to procurement!</span>
        </div>
      )}

      {/* STORES CATALOG TABLE */}
      <Card className="overflow-x-auto">
        <h2 className="font-bold text-sm mb-4">Central Store Catalog</h2>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
              <th className="py-2.5">Item Description</th>
              <th className="py-2.5 px-3">Barcode</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">In-Stock Quantity</th>
              <th className="py-2.5 px-3 text-right">Reorder Threshold</th>
              <th className="py-2.5 px-3">Supplier Vendor</th>
              <th className="py-2.5 pl-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400">No stock materials logged.</td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stockQuantity < item.reorderLevel;
                return (
                  <tr key={item._id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">{item.name}</td>
                    <td className="py-3 px-3 text-[10px] text-slate-400 font-mono">{item.barcode || '--'}</td>
                    <td className="py-3 px-3 text-slate-500">{item.category}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-800 dark:text-slate-100">
                      {item.stockQuantity?.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{item.reorderLevel?.toLocaleString()} {item.unit}</td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-xs">{item.supplier?.companyName || 'Corporate Logistics'}</td>
                    <td className="py-3 pl-3 text-center">
                      {isLowStock ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-955 dark:text-red-200 text-[10px] font-extrabold flex items-center justify-center space-x-1 w-20 mx-auto">
                          <AlertTriangle size={10} />
                          <span>LOW</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 text-[10px] font-bold flex items-center justify-center w-20 mx-auto">
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* ADD INVENTORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg mb-2 text-ccl-primary dark:text-white">Register Store Material</h2>
            <p className="text-xs text-slate-400 mb-4 border-b pb-2">Create details and barcode for stocks item catalog.</p>

            {error && <div className="p-2 mb-3 bg-red-50 text-red-500 text-xs rounded text-center">{error}</div>}

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Material Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ammonium Nitrate Explosive"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Spare Parts</option>
                    <option>Explosives</option>
                    <option>Diesel</option>
                    <option>Lubricants</option>
                    <option>PPE Kits</option>
                    <option>Tools</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Measurement Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pcs, kg, liters"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Opening Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={newMaterial.stockQuantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, stockQuantity: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Safety Buffer / Reorder Level</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={newMaterial.reorderLevel}
                    onChange={(e) => setNewMaterial({ ...newMaterial, reorderLevel: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Barcode Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. EXP-ANFO-12"
                  value={newMaterial.barcode}
                  onChange={(e) => setNewMaterial({ ...newMaterial, barcode: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Submit Registration</Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
