import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import {
  LayoutDashboard, Users, Landmark, Hammer, Truck, Package, ShoppingCart,
  DollarSign, Clock, ShieldAlert, FileText, Bell, Search, Sun, Moon,
  LogOut, Menu, X, MapPin, ChevronRight, Settings, AlertTriangle, HelpCircle
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const res = await api.get(`/search?q=${val}`);
        if (res.data.success) {
          setSearchResults(res.data.results);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'HR & Employee', path: '/hr', icon: Users },
    { name: 'Mine Management', path: '/mines', icon: Landmark },
    { name: 'Production', path: '/production', icon: Hammer },
    { name: 'Fleet & Equipment', path: '/fleet', icon: Truck },
    { name: 'Inventory & Stores', path: '/inventory', icon: Package },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
    { name: 'Finance & Accounts', path: '/finance', icon: DollarSign },
    { name: 'Attendance & Shift', path: '/attendance', icon: Clock },
    { name: 'Safety Management', path: '/safety', icon: ShieldAlert },
    { name: 'Reports & Analytics', path: '/reports', icon: FileText },
    { name: 'Notices & Circulars', path: '/circulars', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Helper to resolve page header
  const getPageHeader = () => {
    const current = navItems.find(item => item.path === location.pathname);
    return current ? current.name : 'Dashboard';
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-ccl-navy text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full z-40 bg-[#001F3F] text-white flex flex-col justify-between transition-transform duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'} border-r border-slate-800`}>
        
        {/* Sidebar Header Brand */}
        <div className="p-4 flex flex-col border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-ccl-primary font-bold text-lg select-none">
              C
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold tracking-wide text-sm whitespace-nowrap">Central Coalfields Ltd</span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">A Subsidiary of Coal India</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-ccl-primary text-white border-l-4 border-ccl-accent font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-ccl-accent' : 'text-slate-400'} />
                {sidebarOpen && <span className="flex-1">{item.name}</span>}
                {sidebarOpen && <ChevronRight size={14} className="text-slate-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-800 bg-[#001730]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <img
                src={user?.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop'}
                alt={user?.name || 'User Avatar'}
                className="h-9 w-9 rounded-full object-cover border border-slate-700"
              />
              {sidebarOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold truncate">{user?.name || 'Rajiv Kumar'}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.role || 'Mine Manager'}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-16'}`}>
        
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 glass-panel h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/30">
          
          {/* Header left */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-bold text-lg hidden sm:block tracking-tight text-ccl-primary dark:text-white">
              {getPageHeader()}
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md w-full mx-4 hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                placeholder="Search employees, machinery, mines, store catalog..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#122238] focus:outline-none focus:ring-2 focus:ring-ccl-primary"
              />
            </div>

            {/* Global Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wide">
                  Global Search Matches
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (res.path) {
                          navigate(res.path);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-ccl-primary dark:text-white">{res.title}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">{res.type}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{res.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            
            {/* HQ PIN BADGE */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <MapPin size={14} className="text-ccl-accent" />
              <span>CCL Ranchi HQ</span>
            </div>

            {/* Date Display */}
            <div className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Badge Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markAllAsRead();
                }}
                className="relative p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-ccl-navyLight border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 text-xs">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-ccl-primary dark:text-white flex justify-between items-center">
                    <span>Industrial Alerts & Notices</span>
                    <span className="text-[10px] font-normal text-slate-400">HQ Feeds</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No alerts today.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start space-x-2.5 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <AlertTriangle className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${notif.type === 'warning' ? 'text-red-500' : 'text-orange-500'}`} />
                          <div className="flex-1">
                            <p className="text-slate-700 dark:text-slate-200 font-medium">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Micro CIL Seal */}
            <div className="h-8 w-8 rounded-full border border-slate-300/50 overflow-hidden flex items-center justify-center bg-white shadow-sm select-none">
              <span className="font-extrabold text-[10px] text-ccl-primary">CIL</span>
            </div>
          </div>
        </header>

        {/* DYNAMIC ROUTE VIEWPORTS */}
        <main className="flex-grow p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="py-4 px-6 border-t border-slate-200/50 dark:border-slate-800/30 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <span>&copy; {new Date().getFullYear()} Central Coalfields Limited (CCL). All rights reserved.</span>
          <span className="font-semibold text-ccl-primary dark:text-white">Powered by CCL ERP System</span>
        </footer>

      </div>
    </div>
  );
};

export default DashboardLayout;
