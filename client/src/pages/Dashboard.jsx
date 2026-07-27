import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Users, Wrench, Truck, AlertTriangle, RefreshCw, ChevronRight,
  Activity, CheckCircle, Flame, Calendar, Info, Clock, Play, ShieldAlert
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [stats, setStats] = useState({
    coalProductionToday: 28540,
    manpowerPresent: 4562,
    equipmentRunning: 342,
    totalDespatch: 24870,
    safetyIncidentsThisMonth: 7,
    activeMinesCount: 5,
    lowStockAlertsCount: 2,
    totalRevenue: 4500000
  });
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resStats = await api.get('/dashboard/stats');
      if (resStats.data.success) {
        setStats(resStats.data.stats);
      }

      const resMines = await api.get('/mines');
      if (resMines.data.success) {
        setMines(resMines.data.data.slice(0, 5));
      }
    } catch (err) {
      console.warn('Backend server not fully running yet, displaying mock stats.');
      // Mock Mines
      setMines([
        { name: 'North Karanpura', status: 'Operational', dailyOutput: 8560, targetOutput: 9000 },
        { name: 'South Karanpura', status: 'Operational', dailyOutput: 7420, targetOutput: 8000 },
        { name: 'West Bokaro', status: 'Operational', dailyOutput: 5230, targetOutput: 6000 },
        { name: 'East Bokaro', status: 'Operational', dailyOutput: 3520, targetOutput: 4000 },
        { name: 'Ramgarh', status: 'Operational', dailyOutput: 2810, targetOutput: 3000 }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Mock Production Trend Area Chart Data (May 1 to May 19)
  const productionTrendData = [
    { day: '1 May', output: 12000 },
    { day: '3 May', output: 25000 },
    { day: '5 May', output: 30000 },
    { day: '8 May', output: 28000 },
    { day: '10 May', output: 35000 },
    { day: '12 May', output: 42000 },
    { day: '15 May', output: 38000 },
    { day: '17 May', output: 33000 },
    { day: '19 May', output: 43000 }
  ];

  // Donut Chart Data: Production by Area
  const pieData = [
    { name: 'North Karanpura', value: 30.2, color: '#002D62' },
    { name: 'South Karanpura', value: 24.5, color: '#005bb7' },
    { name: 'West Bokaro', value: 18.7, color: '#0083ff' },
    { name: 'East Bokaro', value: 12.4, color: '#4da6ff' },
    { name: 'Ramgarh', value: 8.6, color: '#FF7F32' },
    { name: 'Others', value: 5.6, color: '#b3b3b3' }
  ];

  const quickAccess = [
    { label: 'Employee Directory', path: '/hr', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-200', icon: Users },
    { label: 'Mark Attendance', path: '/attendance', color: 'text-green-600 bg-green-50 dark:bg-green-900/10 border-green-200', icon: Clock },
    { label: 'Mine Status', path: '/mines', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-200', icon: TrendingUp },
    { label: 'Equipment List', path: '/fleet', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/10 border-purple-200', icon: Wrench },
    { label: 'Stock Overview', path: '/inventory', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/10 border-teal-200', icon: Truck },
    { label: 'Safety Report', path: '/safety', color: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200', icon: AlertTriangle },
    { label: 'Shift Schedule', path: '/attendance', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200', icon: Calendar },
    { label: 'Notices', path: '/circulars', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/10 border-sky-200', icon: Info }
  ];

  const recentActivities = [
    { text: 'Coal production report for North Karanpura submitted.', author: 'by Vikash Kumar', time: '10:30 AM', icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' },
    { text: 'Equipment Komatsu PC-1250 was serviced.', author: 'by Equipment Team', time: '09:15 AM', icon: Wrench, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { text: 'Safety inspection completed at Block 2B.', author: 'by Safety Officer', time: 'Yesterday', icon: ShieldAlert, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { text: 'New employee Sunil Verma joined as Mining Sirdar.', author: 'by HR Department', time: 'Yesterday', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' }
  ];

  const calculateAchievement = (actual, target) => {
    return ((actual / target) * 100).toFixed(2);
  };

  const getAchievementColor = (pct) => {
    if (pct >= 90) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    if (pct >= 80) return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      
      {/* GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {user?.name || 'Rajiv Kumar'}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role || 'Mine Manager'} Dashboard</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-ccl-navyLight text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-ccl-primary">
            <option>19 May 2025, Monday</option>
            <option>Yesterday</option>
            <option>Current Week</option>
          </select>
          <Button onClick={fetchDashboardData} variant="outline" className="h-9">
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 5 METRIC WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Coal Production Today */}
        <Card className="border-l-4 border-l-ccl-primary flex flex-col justify-between" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Coal Production</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-ccl-primary dark:text-blue-300">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{stats.coalProductionToday.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400">Tonnes Today</p>
          </div>
          <div className="text-[10px] font-semibold text-green-500 mt-2 flex items-center">
            <span>&uarr; 12.5% vs yesterday</span>
          </div>
        </Card>

        {/* Manpower Present */}
        <Card className="border-l-4 border-l-green-500 flex flex-col justify-between" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Manpower Present</span>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-300">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{stats.manpowerPresent.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400">Employees Today</p>
          </div>
          <div className="text-[10px] font-semibold text-green-500 mt-2 flex items-center">
            <span>&uarr; 5.3% vs yesterday</span>
          </div>
        </Card>

        {/* Equipment Running */}
        <Card className="border-l-4 border-l-ccl-accent flex flex-col justify-between" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Equipment Running</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950 text-ccl-accent dark:text-orange-300">
              <Wrench size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{stats.equipmentRunning}</div>
            <p className="text-[10px] text-slate-400">Active Units</p>
          </div>
          <div className="text-[10px] font-semibold text-green-500 mt-2 flex items-center">
            <span>&uarr; 3.1% vs yesterday</span>
          </div>
        </Card>

        {/* Total Despatch */}
        <Card className="border-l-4 border-l-purple-500 flex flex-col justify-between" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Despatch</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-500 dark:text-purple-300">
              <Truck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{stats.totalDespatch.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400">Tonnes Despatched</p>
          </div>
          <div className="text-[10px] font-semibold text-green-500 mt-2 flex items-center">
            <span>&uarr; 8.7% vs yesterday</span>
          </div>
        </Card>

        {/* Safety Incidents */}
        <Card className="border-l-4 border-l-red-500 flex flex-col justify-between" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Safety Incidents</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-300">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">0{stats.safetyIncidentsThisMonth}</div>
            <p className="text-[10px] text-slate-400">This Month</p>
          </div>
          <div className="text-[10px] font-semibold text-red-500 mt-2 flex items-center">
            <span>&darr; 22% vs last month</span>
          </div>
        </Card>
      </div>

      {/* MIDDLE SECTION: CHARTS & QUICK ACCESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production Area Chart (Month Trend) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Coal Production (This Month)</h2>
              <span className="text-[10px] text-slate-400">Tonnes</span>
            </div>
            <select className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-ccl-navy text-[10px] py-1 px-2.5 rounded-lg">
              <option>Tonnes</option>
              <option>Volume (m³)</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#002D62" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#002D62" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="output" stroke="#002D62" strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart: Production by Area & Quick Access */}
        <div className="space-y-6">
          
          {/* Donut Chart */}
          <Card>
            <h2 className="font-bold text-sm mb-3">Production by Area (This Month)</h2>
            <div className="flex flex-col items-center justify-center relative">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text inside Donut */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                  <span className="text-sm font-extrabold text-ccl-primary dark:text-white">1,25,400</span>
                  <span className="text-[9px] text-slate-400">Tonnes</span>
                </div>
              </div>

              {/* Custom Legend Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[10px] mt-2 px-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-500 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* QUICK ACCESS GRID */}
      <Card>
        <h2 className="font-bold text-sm mb-4">Quick Access Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickAccess.map((qa, index) => {
            const Icon = qa.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(qa.path)}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl hover:shadow-md cursor-pointer transition active:scale-95 group ${qa.color}`}
              >
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition">
                  <Icon size={16} />
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold mt-2 text-center leading-none">
                  {qa.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* BOTTOM SECTION: ACTIVITIES, MINES LIST, ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-start space-x-3 text-xs">
                    <div className={`p-1.5 rounded-lg shrink-0 ${act.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{act.text}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>{act.author}</span>
                        <span className="flex items-center"><Clock size={10} className="mr-0.5" />{act.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Button variant="outline" className="w-full text-[10px] mt-4" onClick={() => navigate('/circulars')}>
            View All Activities
          </Button>
        </Card>

        {/* Mine Status Overview Table */}
        <Card className="md:col-span-1 overflow-x-auto">
          <h2 className="font-bold text-sm mb-4">Mine Status Overview</h2>
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                <th className="py-2 pr-2">Mine/Area</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-2 text-right">Daily Prod</th>
                <th className="py-2 px-2 text-right">Target</th>
                <th className="py-2 pl-2 text-right">Achiev.</th>
              </tr>
            </thead>
            <tbody>
              {mines.map((mine, idx) => {
                const achievement = calculateAchievement(mine.dailyOutput, mine.targetOutput);
                return (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2.5 pr-2 font-semibold">{mine.name}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" title="Operational"></span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium">{mine.dailyOutput.toLocaleString()} t</td>
                    <td className="py-2.5 px-2 text-right text-slate-400">{mine.targetOutput.toLocaleString()} t</td>
                    <td className="py-2.5 pl-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getAchievementColor(Number(achievement))}`}>
                        {achievement}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm mb-4 flex justify-between items-center">
              <span>Alerts & Notifications</span>
              <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer" onClick={() => navigate('/circulars')}>View All</span>
            </h2>
            
            <div className="space-y-3">
              {notifications.slice(0, 4).map((notif, i) => {
                let alertColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100';
                if (notif.type === 'warning') alertColor = 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100';
                else if (notif.type === 'maintenance') alertColor = 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100';
                
                return (
                  <div key={i} className={`p-2.5 border rounded-xl flex items-start space-x-2.5 text-xs ${alertColor}`}>
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-slate-800 dark:text-slate-200">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{notif.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            Security audit logs synced locally &bull; Online
          </p>
        </Card>

      </div>
      
    </div>
  );
};

export default Dashboard;
