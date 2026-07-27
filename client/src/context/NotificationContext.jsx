import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Low stock alert: Explosive items in North Karanpura.',
      time: '10:20 AM',
      read: false
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'Vehicle HR55K 9921 is due for maintenance.',
      time: '09:45 AM',
      read: false
    },
    {
      id: 3,
      type: 'calendar',
      message: 'Safety training scheduled on 25 May 2025.',
      time: 'Yesterday',
      read: true
    },
    {
      id: 4,
      type: 'info',
      message: 'New circular issued by Ranchi HQ.',
      time: '2 days ago',
      read: true
    }
  ]);

  // Optionally load fresh notifications from circulars/safety incidents endpoints on boot
  useEffect(() => {
    const fetchRealAlerts = async () => {
      try {
        const res = await api.get('/safety');
        if (res.data.success) {
          const apiAlerts = res.data.data.map((item, idx) => ({
            id: `safety-${item._id}`,
            type: item.severity === 'Critical' || item.severity === 'High' ? 'warning' : 'info',
            message: `${item.title}: ${item.description.slice(0, 50)}...`,
            time: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
          }));
          setNotifications(prev => {
            const ids = new Set(prev.map(p => p.id));
            const uniqueApiAlerts = apiAlerts.filter(a => !ids.has(a.id));
            return [...uniqueApiAlerts, ...prev];
          });
        }
      } catch (err) {
        console.warn('Could not sync notifications with safety reports database.');
      }
    };

    fetchRealAlerts();
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (type, message) => {
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
