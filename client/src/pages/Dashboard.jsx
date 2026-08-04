import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, Wrench, Truck, AlertTriangle, RefreshCw,
  CheckCircle, Flame, Calendar, Info, Clock, ShieldAlert,
  ChevronLeft, ChevronRight, Edit2
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const formatDate = (d) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
};

const toISO = (d) => d.toISOString().split('T')[0];   // "YYYY-MM-DD"

const PIE_COLORS = ['#002D62', '#005bb7', '#0083ff', '#4da6ff', '#FF7F32', '#b3b3b3'];

// ── custom tooltip for area chart ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-0.5">{label}</p>
        <p className="text-ccl-primary dark:text-blue-300 font-semibold">
          {fmt(payload[0].value)} <span className="text-slate-400 font-normal">tonnes</span>
        </p>
      </div>
    );
  }
  return null;
};

// ── component ─────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [productionTrend, setProductionTrend] = useState([]);
  const [mineBreakdown, setMineBreakdown] = useState([]);
  const [mines, setMines] = useState([]);
  const [recentProduction, setRecentProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── fetch data for selected date ──────────────────────────
  const fetchDashboardData = useCallback(async (date) => {
    setLoading(true);
    try {
      const dateStr = toISO(date || selectedDate);
      const [statsRes, minesRes, prodRes] = await Promise.all([
        api.get(`/dashboard/stats?date=${dateStr}`),
        api.get('/mines'),
        api.get('/production'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        if (statsRes.data.productionTrend?.length > 0) {
          setProductionTrend(statsRes.data.productionTrend);
        }
        if (statsRes.data.mineBreakdown?.length > 0) {
          setMineBreakdown(statsRes.data.mineBreakdown);
        }
      }
      if (minesRes.data.success) {
        setMines(minesRes.data.data.slice(0, 5));
      }
      if (prodRes.data.success) {
        // Show 4 most recent production logs
        const sorted = [...prodRes.data.data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecentProduction(sorted.slice(0, 4));
      }
    } catch (err) {
      console.warn('Backend unavailable — showing placeholder data.');
      setStats({
        coalProductionToday: 0, manpowerPresent: 0, equipmentRunning: 0,
        totalDespatch: 0, safetyIncidentsThisMonth: 0, activeMinesCount: 0,
        lowStockAlertsCount: 0, totalRevenue: 0,
      });
      setMines([]);
      setProductionTrend([]);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, []);

  // ── date navigation ───────────────────────────────────────
  const changeDay = (offset) => {
    const nd = new Date(selectedDate);
    nd.setDate(nd.getDate() + offset);
    if (nd > new Date()) return; // don't go into future
    setSelectedDate(nd);
    fetchDashboardData(nd);
  };

  const handleDateInput = (e) => {
    const nd = new Date(e.target.value);
    if (!isNaN(nd)) {
      setSelectedDate(nd);
      setShowDatePicker(false);
      fetchDashboardData(nd);
    }
  };

  // ── quick links ───────────────────────────────────────────
  const quickAccess = [
    { label: 'Employee Directory', path: '/hr',         color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-200',    icon: Users },
    { label: 'Mark Attendance',    path: '/attendance', color: 'text-green-600 bg-green-50 dark:bg-green-900/10 border-green-200',  icon: Clock },
    { label: 'Mine Status',        path: '/mines',      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-200', icon: TrendingUp },
    { label: 'Equipment List',     path: '/fleet',      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/10 border-purple-200', icon: Wrench },
    { label: 'Stock Overview',     path: '/inventory',  color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/10 border-teal-200',     icon: Truck },
    { label: 'Safety Report',      path: '/safety',     color: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200',         icon: AlertTriangle },
    { label: 'Shift Schedule',     path: '/attendance', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200', icon: Calendar },
    { label: 'Notices',            path: '/circulars',  color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/10 border-sky-200',         icon: Info },
  ];

  const calcAchievement = (actual, target) =>
    target ? ((actual / target) * 100).toFixed(1) : '0.0';

  const achievementColor = (pct) => {
    if (pct >= 90) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    if (pct >= 70) return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
  };

  // ── metric cards config ───────────────────────────────────
  const metricCards = [
    { label: 'Coal Production',   key: 'coalProductionToday', unit: 'Tonnes Today',        icon: Flame,         border: 'border-l-ccl-primary', bg: 'bg-blue-50 dark:bg-blue-950',   text: 'text-ccl-primary dark:text-blue-300' },
    { label: 'Total Employees',   key: 'manpowerPresent',     unit: 'Registered',           icon: Users,         border: 'border-l-green-500',    bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-300' },
    { label: 'Equipment Running', key: 'equipmentRunning',    unit: 'Active Units',         icon: Wrench,        border: 'border-l-ccl-accent',   bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-ccl-accent dark:text-orange-300' },
    { label: 'Total Despatch',    key: 'totalDespatch',       unit: 'Tonnes Despatched',    icon: Truck,         border: 'border-l-purple-500',   bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-500 dark:text-purple-300' },
    { label: 'Open Incidents',    key: 'safetyIncidentsThisMonth', unit: 'Unresolved',     icon: AlertTriangle, border: 'border-l-red-500',      bg: 'bg-red-50 dark:bg-red-950',     text: 'text-red-500 dark:text-red-300' },
  ];

  const isToday = toISO(selectedDate) === toISO(new Date());

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Manager'}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.role || 'Mine Manager'} Dashboard
          </p>
        </div>

        {/* DATE NAVIGATOR */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-ccl-navyLight text-xs py-2 px-3 rounded-lg hover:border-ccl-primary transition-colors"
            >
              <Calendar size={13} className="text-ccl-primary" />
              <span className="font-medium">{formatDate(selectedDate)}</span>
              {isToday && (
                <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded-full font-bold">TODAY</span>
              )}
            </button>

            {showDatePicker && (
              <div className="absolute top-11 right-0 z-50 bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3">
                <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wide font-bold">Select Date</p>
                <input
                  type="date"
                  max={toISO(new Date())}
                  defaultValue={toISO(selectedDate)}
                  onChange={handleDateInput}
                  className="text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-ccl-primary"
                />
                <div className="mt-2 flex gap-1.5">
                  {['Today', 'Yesterday', '7 Days Ago'].map((label, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (i === 2 ? 7 : i));
                    return (
                      <button
                        key={label}
                        onClick={() => { setSelectedDate(d); setShowDatePicker(false); fetchDashboardData(d); }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-ccl-primary hover:text-white transition-colors"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => changeDay(1)}
            disabled={isToday}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>

          <Button
            onClick={() => fetchDashboardData(selectedDate)}
            variant="outline"
            className="h-9"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── 5 METRIC WIDGETS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map(({ label, key, unit, icon: Icon, border, bg, text }) => (
          <Card key={key} className={`border-l-4 ${border} flex flex-col justify-between`} hoverEffect>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
              <div className={`p-1.5 rounded-lg ${bg} ${text}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-extrabold">
                  {stats ? fmt(stats[key]) : '—'}
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">{unit}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart — Production Trend */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm">Coal Production — Last 30 Days</h2>
              <span className="text-[10px] text-slate-400">Ending {formatDate(selectedDate)}</span>
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-ccl-primary dark:text-blue-300 px-2 py-1 rounded-full font-bold">Tonnes</span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : productionTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs flex-col gap-2">
                <Flame size={32} className="opacity-30" />
                <p>No production data for this period.</p>
                <Button variant="outline" className="text-[10px] mt-1" onClick={() => navigate('/production')}>
                  Log Production
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#002D62" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#002D62" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9 }}
                    interval={Math.ceil(productionTrend.length / 8)}
                  />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="output"
                    stroke="#002D62"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOutput)"
                    dot={{ r: 3, fill: '#002D62' }}
                    activeDot={{ r: 5, fill: '#FF7F32' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Donut Chart — Production by Mine */}
        <Card>
          <h2 className="font-bold text-sm mb-3">Production by Mine</h2>
          {loading ? (
            <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : mineBreakdown.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs flex-col gap-2">
              <TrendingUp size={28} className="opacity-30" />
              <p>No mine data yet.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center relative">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mineBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mineBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Total</span>
                  <span className="text-sm font-extrabold text-ccl-primary dark:text-white">
                    {fmt(mineBreakdown.reduce((a, b) => a + (b.rawQty || 0), 0) || stats?.coalProductionToday)}
                  </span>
                  <span className="text-[9px] text-slate-400">Tonnes</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[10px] mt-2 px-2">
                {mineBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color || PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-slate-500 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold ml-1">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── QUICK ACCESS ── */}
      <Card>
        <h2 className="font-bold text-sm mb-4">Quick Access</h2>
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

      {/* ── BOTTOM 3-COLUMN ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent Production Logs */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Recent Production Logs</h2>
            <button
              onClick={() => navigate('/production')}
              className="text-[10px] text-blue-500 font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))
            ) : recentProduction.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2 py-6">
                <Flame size={24} className="opacity-30" />
                <p>No production logs yet.</p>
              </div>
            ) : (
              recentProduction.map((log, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs">
                  <div className="p-1.5 rounded-lg shrink-0 text-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {fmt(log.quantity)} tonnes — {log.grade || 'Grade A'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5">
                      <span>{log.mine?.name || 'Unknown Mine'}</span>
                      <span className="flex items-center">
                        <Clock size={10} className="mr-0.5" />
                        {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" className="w-full text-[10px] mt-4" onClick={() => navigate('/production')}>
            + Log New Production
          </Button>
        </Card>

        {/* Mine Status Table */}
        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Mine Status Overview</h2>
            <button onClick={() => navigate('/mines')} className="text-[10px] text-blue-500 font-bold hover:underline">
              View All
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : mines.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-6">No mines data available.</div>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-2 pr-2">Mine</th>
                  <th className="py-2 px-2 text-center">Status</th>
                  <th className="py-2 px-2 text-right">Output</th>
                  <th className="py-2 pl-2 text-right">Achiev.</th>
                </tr>
              </thead>
              <tbody>
                {mines.map((mine, idx) => {
                  const ach = calcAchievement(mine.dailyOutput, mine.targetOutput);
                  return (
                    <tr
                      key={idx}
                      onClick={() => navigate('/mines')}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer"
                    >
                      <td className="py-2.5 pr-2 font-semibold">{mine.name}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block h-2 w-2 rounded-full ${mine.status === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`} title={mine.status} />
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium">{fmt(mine.dailyOutput)} t</td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${achievementColor(Number(ach))}`}>
                          {ach}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Alerts */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Alerts & Notifications</h2>
            <span
              className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer"
              onClick={() => navigate('/circulars')}
            >
              View All
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {notifications.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-4">No alerts.</div>
            ) : (
              notifications.slice(0, 4).map((notif, i) => {
                let alertColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100';
                if (notif.type === 'warning')     alertColor = 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100';
                if (notif.type === 'maintenance') alertColor = 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100';
                return (
                  <div key={i} className={`p-2.5 border rounded-xl flex items-start space-x-2.5 text-xs ${alertColor}`}>
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-slate-800 dark:text-slate-200">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{notif.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            Security audit logs synced • Online
          </p>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
