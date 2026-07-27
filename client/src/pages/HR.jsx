import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Users, UserPlus, Search, ShieldCheck, Mail, Briefcase, Plus, Calendar, Trash2, X } from 'lucide-react';

const HR = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '', email: '', employeeId: '', department: 'Mining Operations',
    designation: '', baseSalary: '', role: 'Employee', password: 'ccl12345'
  });
  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server down, loading mock directory.');
      // Mock employees data
      setEmployees([
        { _id: '1', name: 'Aditya Vardhan', email: 'admin@ccl.gov.in', role: 'Admin', employeeId: 'CCL001', department: 'Administration', designation: 'General Manager', status: 'Active', baseSalary: 120000, timeline: [{ date: '2024-01-10', event: 'Promotion', details: 'Promoted to General Manager' }] },
        { _id: '2', name: 'Priyanka Sharma', email: 'hr@ccl.gov.in', role: 'HR', employeeId: 'CCL002', department: 'Human Resources', designation: 'HR Manager', status: 'Active', baseSalary: 75000, timeline: [{ date: '2024-03-15', event: 'Joined', details: 'Joined CCL Ranchi HQ' }] },
        { _id: '3', name: 'Rajiv Kumar', email: 'manager@ccl.gov.in', role: 'Mine Manager', employeeId: 'CCL003', department: 'Mining Operations', designation: 'Senior Mine Manager', status: 'Active', baseSalary: 95000, timeline: [{ date: '2024-08-01', event: 'Promotion', details: 'Promoted to Senior Mine Manager' }], emergencyContact: { name: 'Sunita Devi', relation: 'Spouse', phone: '+91 9876543210' } },
        { _id: '4', name: 'Vikash Kumar', email: 'vikash.kumar@ccl.gov.in', role: 'Employee', employeeId: 'CCL008', department: 'Mining Operations', designation: 'Mining Sirdar', status: 'Active', baseSalary: 45000, timeline: [{ date: '2025-01-05', event: 'Joining', details: 'Joined North Karanpura Team' }] },
        { _id: '5', name: 'Sunil Verma', email: 'sunil.verma@ccl.gov.in', role: 'Employee', employeeId: 'CCL009', department: 'Mining Operations', designation: 'Mining Sirdar', status: 'Active', baseSalary: 42000, timeline: [{ date: '2025-05-18', event: 'Joining', details: 'Joined North Karanpura Team' }] }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEmp.name || !newEmp.email || !newEmp.employeeId || !newEmp.designation) {
      setFormError('Please fill all required fields.');
      return;
    }

    try {
      const res = await api.post('/employees', newEmp);
      if (res.data.success) {
        setEmployees([...employees, res.data.data]);
        setShowAddModal(false);
        setNewEmp({
          name: '', email: '', employeeId: '', department: 'Mining Operations',
          designation: '', baseSalary: '', role: 'Employee', password: 'ccl12345'
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating employee.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        setEmployees(employees.filter(e => e._id !== id));
        if (selectedEmployee?._id === id) setSelectedEmployee(null);
      }
    } catch (err) {
      alert('Failed to delete employee: ' + (err.response?.data?.message || 'Unauthorized'));
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === '' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const isHR = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">HR & Employee Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage government mining credentials, designations, and profiles.</p>
        </div>
        
        {isHR && (
          <Button onClick={() => setShowAddModal(true)} className="shadow-md">
            <UserPlus size={16} className="mr-1.5" />
            Add Employee Profile
          </Button>
        )}
      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <Card className="flex flex-col sm:flex-row gap-4 py-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, ID, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-ccl-navy/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary"
          />
        </div>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy text-xs py-2 px-3 rounded-lg focus:outline-none w-full sm:w-48"
        >
          <option value="">All Departments</option>
          <option value="Administration">Administration</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Mining Operations">Mining Operations</option>
          <option value="Finance & Accounts">Finance & Accounts</option>
          <option value="Safety & Security">Safety & Security</option>
        </select>
      </Card>

      {/* MAIN CONTENT AREA: GRID DIRECTORY & DETAIL DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EMPLOYEES TABLE LIST */}
        <Card className="lg:col-span-2 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Employee Details</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">No employees match filters.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer ${selectedEmployee?._id === emp._id ? 'bg-blue-50/40 dark:bg-blue-900/5' : ''}`}
                  >
                    <td className="py-3 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-ccl-primary font-bold flex items-center justify-center border border-slate-300 dark:border-slate-800 select-none">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.employeeId} &bull; {emp.designation}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{emp.department}</td>
                    <td className="py-3 px-3">
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-1"></span>
                      <span className="text-[10px] font-semibold">{emp.status}</span>
                    </td>
                    <td className="py-3 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {isHR && emp.email !== currentUser.email && (
                        <button
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* PROFILE WORKSPACE DRAWER */}
        <Card className="lg:col-span-1 flex flex-col justify-between min-h-[400px]">
          {selectedEmployee ? (
            <div className="space-y-6">
              
              {/* Profile Card Header */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <div className="h-16 w-16 mx-auto rounded-full bg-ccl-primary text-white font-bold flex items-center justify-center text-2xl border-2 border-ccl-accent select-none shadow-md">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-extrabold text-base mt-3 text-slate-800 dark:text-slate-100">{selectedEmployee.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedEmployee.employeeId} &bull; {selectedEmployee.designation}</p>
              </div>

              {/* Core particulars */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                  <Mail size={14} className="text-slate-400" />
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                  <Briefcase size={14} className="text-slate-400" />
                  <span>{selectedEmployee.department} &bull; ₹{selectedEmployee.baseSalary?.toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Timeline list */}
              <div>
                <h4 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2">Service Timeline</h4>
                {selectedEmployee.timeline && selectedEmployee.timeline.length > 0 ? (
                  <div className="space-y-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                    {selectedEmployee.timeline.map((event, idx) => (
                      <div key={idx} className="relative text-xs">
                        <span className="absolute -left-[13px] top-1 h-2 w-2 rounded-full bg-ccl-accent"></span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{event.event}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{event.details} &bull; {new Date(event.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">No service history records logged.</p>
                )}
              </div>

              {/* Emergency Contacts */}
              {selectedEmployee.emergencyContact && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-ccl-navy/30 border border-slate-100 dark:border-slate-800 text-xs">
                  <h4 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-1">Emergency Contact</h4>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relation})</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedEmployee.emergencyContact.phone}</div>
                </div>
              )}

            </div>
          ) : (
            <div className="my-auto text-center p-6 text-slate-400">
              <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-800 mb-2" />
              <p className="text-xs">Select an employee from the directory to review their detailed timeline and service portfolio.</p>
            </div>
          )}
        </Card>

      </div>

      {/* ADD EMPLOYEE FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg text-ccl-primary dark:text-white mb-2">Create Employee Profile</h2>
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Record official mining sirdar and managers identities.</p>

            {formError && (
              <div className="p-2 mb-3 rounded bg-red-50 text-red-500 text-xs text-center border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Employee ID (e.g. CCL042)</label>
                  <input
                    type="text"
                    required
                    value={newEmp.employeeId}
                    onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Official Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mining Sirdar"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Administration</option>
                    <option>Human Resources</option>
                    <option>Mining Operations</option>
                    <option>Finance & Accounts</option>
                    <option>Safety & Security</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Base Salary (INR)</label>
                  <input
                    type="number"
                    value={newEmp.baseSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, baseSalary: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">System Role</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navy"
                  >
                    <option>Employee</option>
                    <option>HR</option>
                    <option>Mine Manager</option>
                    <option>Production Manager</option>
                    <option>Finance Manager</option>
                    <option>Inventory Manager</option>
                    <option>Safety Officer</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Login Key / Password</label>
                  <input
                    type="text"
                    value={newEmp.password}
                    onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 font-mono"
                  />
                </div>

              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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

export default HR;
