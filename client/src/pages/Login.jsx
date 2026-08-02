import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { AlertCircle, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <Card className="p-8 shadow-xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-ccl-navyLight/80 backdrop-blur-md">
      
      {/* Brand Label */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-black text-ccl-primary dark:text-white tracking-tight">
          CCL ERP Gateway
        </h2>
        <p className="text-xs text-slate-400">
          Enterprise Resource Planning Portal &bull; Secure Auth
        </p>
      </div>

      {/* Warning Box */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg text-xs border border-red-100 dark:border-red-900/30">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Government Email / Account ID
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail size={14} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@ccl.gov.in"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Authorization Key
            </label>
            <span className="text-[10px] text-ccl-accent hover:underline cursor-pointer">
              Forgot Key?
            </span>
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
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-ccl-primary text-slate-700 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full py-2.5 mt-2 shadow-lg shadow-ccl-primary/20"
        >
          Verify Credentials & Enter
        </Button>

      </form>

      <div className="text-center mt-4">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-ccl-primary dark:text-ccl-accent font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>

      {/* Setup instructions helper for standard reviewer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-1">
        <p className="font-bold uppercase text-slate-500">Developer Demo Credentials:</p>
        <p>&bull; Mine Manager: <span className="font-semibold text-slate-600 dark:text-slate-200">manager@ccl.gov.in</span> (Pass: <span className="font-semibold text-slate-600 dark:text-slate-200">ccl12345</span>)</p>
        <p>&bull; Safety Officer: <span className="font-semibold text-slate-600 dark:text-slate-200">safety@ccl.gov.in</span> (Pass: <span className="font-semibold text-slate-600 dark:text-slate-200">ccl12345</span>)</p>
        <p>&bull; HR Manager: <span className="font-semibold text-slate-600 dark:text-slate-200">hr@ccl.gov.in</span> (Pass: <span className="font-semibold text-slate-600 dark:text-slate-200">ccl12345</span>)</p>
      </div>

    </Card>
  );
};

export default Login;
