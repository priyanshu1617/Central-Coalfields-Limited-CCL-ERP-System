import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import api from '../services/api.js';
import { User, Lock, Eye, Sun, Moon } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure your user profile, dark mode theme preferences, and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PROFILE CARD */}
        <Card className="md:col-span-1 space-y-6">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-20 w-20 mx-auto rounded-full bg-ccl-primary text-white font-bold flex items-center justify-center text-3xl border-2 border-ccl-accent select-none shadow-md">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RK'}
            </div>
            <h3 className="font-extrabold text-base mt-3 text-slate-800 dark:text-slate-100">{user?.name || 'Rajiv Kumar'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user?.designation || 'Senior Mine Manager'}</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Employee ID</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.employeeId || 'CCL003'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Government Email</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email || 'manager@ccl.gov.in'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Department / Cost Center</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.department || 'Mining Operations'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">System Privilege Role</span>
              <span className="font-bold text-ccl-accent">{user?.role || 'Mine Manager'}</span>
            </div>
            {user?.baseSalary && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Base Salary Grade</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">₹{user.baseSalary.toLocaleString()}/month</span>
              </div>
            )}
          </div>
        </Card>

        {/* SECURITY & SECURITY MODIFICATIONS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* THEME SELECTOR CARD */}
          <Card>
            <h2 className="font-bold text-sm mb-4">Display & Themes</h2>
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Interface Mode</p>
                <p className="text-[10px] text-slate-400">Switch between dark blue metallic mode and clean paper mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {darkMode ? (
                  <>
                    <Sun size={14} className="text-orange-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-ccl-primary" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* CHANGE PASSWORD CARD */}
          <Card>
            <h2 className="font-bold text-sm mb-4 flex items-center">
              <Lock size={16} className="text-ccl-accent mr-1.5" />
              Update Authentication Key
            </h2>

            {error && (
              <div className="p-2 mb-3 bg-red-50 text-red-500 text-xs rounded text-center border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-2 mb-3 bg-green-50 text-green-600 text-xs rounded text-center border border-green-100">
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Current Key / Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-ccl-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">New Key / Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-ccl-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Confirm New Key</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-ccl-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t dark:border-slate-800">
                <Button type="submit" loading={loading}>
                  Change Key
                </Button>
              </div>

            </form>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Settings;
