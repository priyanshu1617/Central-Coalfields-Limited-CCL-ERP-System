import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { ShieldAlert, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
      <Card className="max-w-md text-center p-8 space-y-6">
        <div className="mx-auto h-16 w-16 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-full flex items-center justify-center text-red-500 shadow-sm animate-bounce">
          <ShieldAlert size={32} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight">Security Alert: Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your active employee account privilege level is insufficient to bypass security checks for this module. Please coordinate with the IT Systems administrator or HR department if this is an error.
          </p>
        </div>

        <Button onClick={() => navigate('/')} className="w-full">
          <Home size={16} className="mr-1.5" /> Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default Unauthorized;
