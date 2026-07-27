import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const AuthLayout = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans ${darkMode ? 'dark bg-ccl-navy text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Industrial Hero Cover */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-tr from-[#001730] to-[#002D62] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ccl-accent/10 via-transparent to-transparent"></div>
          
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 z-10">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-ccl-primary font-bold text-xl shadow-lg">
              C
            </div>
            <div>
              <h2 className="font-extrabold tracking-wide text-lg">Central Coalfields Limited</h2>
              <p className="text-xs text-slate-300">A Subsidiary of Coal India Limited</p>
            </div>
          </div>

          {/* Core Message */}
          <div className="my-auto z-10 max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Production-Grade <br />
              <span className="text-ccl-accent">Coal ERP System</span>
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Managing mine operations, fleet tracking, inventory safety reserves, human resources payroll, and logistical dispatches for Coal India enterprises.
            </p>
            
            <div className="flex space-x-6 mt-8">
              <div>
                <div className="text-2xl font-bold text-ccl-accent">340+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Active Fleet</div>
              </div>
              <div className="border-l border-slate-700 h-10"></div>
              <div>
                <div className="text-2xl font-bold text-ccl-accent">1.25M</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Tonnes extracted</div>
              </div>
              <div className="border-l border-slate-700 h-10"></div>
              <div>
                <div className="text-2xl font-bold text-ccl-accent">0%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Incident Quarters</div>
              </div>
            </div>
          </div>

          {/* Footer copyright */}
          <div className="z-10 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Central Coalfields Limited. Government of India Enterprise.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex items-center justify-center p-6 md:p-12 bg-white dark:bg-ccl-navy">
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
