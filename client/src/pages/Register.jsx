import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { AlertCircle, Lock, Mail, User, Briefcase, Hash, Building, CheckCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Mining Operations');
  const [designation, setDesignation] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Live validation helpers
  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-slate-200 w-0', textColor: 'text-slate-400' };
    if (pass.length < 6) return { label: 'Weak (Must be 6+ chars)', color: 'bg-red-500 w-1/3', textColor: 'text-red-500' };
    
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    const varietyCount = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length;

    if (pass.length >= 8 && varietyCount === 3) {
      return { label: 'Strong', color: 'bg-emerald-500 w-full', textColor: 'text-emerald-500' };
    }
    return { label: 'Medium', color: 'bg-amber-500 w-2/3', textColor: 'text-amber-500' };
  };

  const strength = getPasswordStrength(password);
  const isEmailValid = email ? email.toLowerCase().endsWith('@ccl.gov.in') : false;
  const isEmpIdValid = employeeId ? /^ccl\d+$/i.test(employeeId) : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !employeeId || !department || !designation) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isEmailValid) {
      setError('Please use a valid official email ending in @ccl.gov.in');
      return;
    }

    if (!isEmpIdValid) {
      setError('Employee ID must follow standard formatting: starting with "CCL" followed by digits (e.g. CCL108)');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        employeeId: employeeId.toUpperCase(),
        department,
        designation,
        role: 'Employee' // Default role for self-registration
      });

      setLoading(false);
      if (res.data.success) {
        setSuccess('Registration successful! Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Card className="p-8 shadow-xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-ccl-navyLight/80 backdrop-blur-md max-w-md w-full mx-auto transform transition-all duration-300 hover:shadow-2xl">
      
      {/* Brand Label */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-black text-ccl-primary dark:text-white tracking-tight">
          CCL ERP Registration
        </h2>
        <p className="text-xs text-slate-400">
          Create a new Government Employee account
        </p>
      </div>

      {/* Message Boxes */}
      {error && (
        <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg text-xs border border-red-100 dark:border-red-900/30 animate-pulse">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 mb-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User size={14} />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vikash Kumar"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100 transition-colors duration-200"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Government Email
            </label>
            {email && (
              <span className={`text-[9px] font-semibold ${isEmailValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isEmailValid ? 'Valid Domain' : 'Must end with @ccl.gov.in'}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail size={14} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikash@ccl.gov.in"
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${email && !isEmailValid ? 'border-amber-400 focus:ring-amber-400' : 'border-slate-200 dark:border-slate-800 focus:ring-ccl-primary'} bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 text-slate-700 dark:text-slate-100 transition-all duration-200`}
              required
            />
          </div>
        </div>

        {/* Employee ID */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Employee ID (CCL Ref)
            </label>
            {employeeId && (
              <span className={`text-[9px] font-semibold ${isEmpIdValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isEmpIdValid ? 'Format OK' : 'Must be e.g. CCL108'}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Hash size={14} />
            </span>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="CCL108"
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${employeeId && !isEmpIdValid ? 'border-amber-400 focus:ring-amber-400' : 'border-slate-200 dark:border-slate-800 focus:ring-ccl-primary'} bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 text-slate-700 dark:text-slate-100 transition-all duration-200`}
              required
            />
          </div>
        </div>

        {/* Department Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Department
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Building size={14} />
            </span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100 appearance-none transition-colors duration-200"
              required
            >
              <option value="Mining Operations">Mining Operations</option>
              <option value="Administration">Administration</option>
              <option value="Safety & Security">Safety & Security</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Inventory Control">Inventory Control</option>
            </select>
          </div>
        </div>

        {/* Designation Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Designation / Job Title
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Briefcase size={14} />
            </span>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Mining Engineer"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100 transition-colors duration-200"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Password (Authorization Key)
            </label>
            {password && (
              <span className={`text-[9px] font-bold ${strength.textColor}`}>
                {strength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock size={14} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100 transition-colors duration-200"
              required
            />
          </div>
          {/* Password Strength Progress Bar */}
          {password && (
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mt-1.5">
              <div className={`h-full transition-all duration-300 ${strength.color}`}></div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full py-2.5 mt-4 shadow-lg shadow-ccl-primary/20 hover:scale-[1.01] transition-transform duration-150"
        >
          Create Account & Verify
        </Button>

      </form>

      {/* Redirect back to Login */}
      <div className="text-center mt-4">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-ccl-primary dark:text-ccl-accent font-semibold hover:underline">
            Login Here
          </Link>
        </p>
      </div>

    </Card>
  );
};

export default Register;
