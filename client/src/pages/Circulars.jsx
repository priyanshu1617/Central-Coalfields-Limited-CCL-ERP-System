import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Calendar, HelpCircle, Plus, X } from 'lucide-react';

const Circulars = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [issuedBy, setIssuedBy] = useState('Safety Division, CCL HQ');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/circulars');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.warn('Backend server down. Loading mock announcements.');
      setNotices([
        { _id: 'n1', title: 'Mandatory Monsoon Safety Training scheduled on 25 May 2025', content: 'Monsoon guidelines and flooding preventative checks are scheduled at Ranchi HQ.', date: '2025-05-18T14:00:00Z', issuedBy: 'Safety Division, CCL HQ' },
        { _id: 'n2', title: 'Monsoon Operations Guidelines 2025', content: 'Special haul road speed controls and pit checks are in effect from June 1st.', date: '2025-05-15T09:00:00Z', issuedBy: 'Director (Operations), CCL' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  const handleCreateCircular = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!title || !content) {
      setError('Please fill in title and content.');
      return;
    }

    try {
      const res = await api.post('/circulars', { title, content, issuedBy });
      if (res.data.success) {
        setMsg('Circular notice published successfully!');
        setTitle('');
        setContent('');
        setShowAddForm(false);
        fetchCirculars();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish notice.');
    }
  };

  const isHR = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Notices & Circulars</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">View official board announcements, guidelines, and corporate circulars.</p>
        </div>
        {isHR && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel Publish' : 'Publish Circular'}
          </Button>
        )}
      </div>

      {/* FEEDBACK STATUS */}
      {msg && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{msg}</div>}
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">{error}</div>}

      {/* PUBLISH FORM */}
      {showAddForm && (
        <Card className="max-w-lg">
          <h2 className="font-bold text-sm mb-3">Publish Notice Circular</h2>
          <form onSubmit={handleCreateCircular} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Circular Title</label>
              <input type="text" required placeholder="e.g. Mandatory Monsoon Safety training" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Issuing Department Authority</label>
              <input type="text" required placeholder="e.g. Safety Division, CCL HQ" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-400">Circular content</label>
              <textarea required rows="4" placeholder="Input the text notice body..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent" />
            </div>

            <Button type="submit" className="w-full">Publish Circular</Button>
          </form>
        </Card>
      )}

      {/* NOTICES LIST */}
      <div className="space-y-4 max-w-4xl">
        {notices.map((notice) => (
          <Card key={notice._id} className="relative p-5 border-l-4 border-l-ccl-accent hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-ccl-primary dark:text-blue-300 flex items-center">
                  <HelpCircle size={16} className="text-ccl-accent mr-1.5 shrink-0" />
                  {notice.title}
                </h3>
                <div className="flex items-center text-[10px] text-slate-400 mt-1 space-x-2">
                  <span>Issued by: {notice.issuedBy}</span>
                  <span>&bull;</span>
                  <span className="flex items-center"><Calendar size={10} className="mr-0.5" /> {new Date(notice.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <p className="mt-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t dark:border-slate-800 pt-3">
              {notice.content}
            </p>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default Circulars;
