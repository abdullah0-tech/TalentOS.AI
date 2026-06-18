'use client';

import { useEffect, useState } from 'react';
import { request } from '../../../services/api';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Loader2,
  Calendar,
  Eye,
  CheckCheck,
  BellOff
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await request('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve workspace notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );

      await request(`/notifications/${id}/read`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      // Revert if error
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      await request('/notifications/all/read', {
        method: 'PATCH'
      });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
      fetchNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    notifications.forEach((item) => {
      const date = new Date(item.createdAt);
      const itemDateStr = date.toDateString();

      if (itemDateStr === todayStr) {
        today.push(item);
      } else if (itemDateStr === yesterdayStr) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const { today, yesterday, earlier } = groupNotificationsByDate();
  const hasNotifications = notifications.length > 0;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="text-emerald-400" size={16} />,
          bg: 'bg-emerald-500/10 border-emerald-500/15',
          text: 'text-emerald-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-400" size={16} />,
          bg: 'bg-amber-500/10 border-amber-500/15',
          text: 'text-amber-400'
        };
      case 'error':
        return {
          icon: <XCircle className="text-red-400" size={16} />,
          bg: 'bg-red-500/10 border-red-500/15',
          text: 'text-red-400'
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-indigo-400" size={16} />,
          bg: 'bg-indigo-500/10 border-indigo-500/15',
          text: 'text-indigo-400'
        };
    }
  };

  const renderNotificationItem = (item) => {
    const styles = getNotificationStyles(item.type);
    return (
      <div 
        key={item.id} 
        className={`p-4 bg-surface/40 border border-outline hover:border-outline rounded-2xl flex items-start gap-4 transition group ${
          !item.isRead ? 'ring-1 ring-indigo-500/20 bg-surface-high/10' : ''
        }`}
      >
        {/* Type Icon Badge */}
        <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${styles.bg}`}>
          {styles.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-sm text-on-surface truncate">{item.title}</span>
            <span className="text-[10px] text-muted font-semibold shrink-0">
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed">{item.message}</p>
          
          <div className="flex items-center justify-between mt-3 border-t border-outline/40 pt-2.5">
            <span className="text-[10px] text-muted font-medium flex items-center gap-1">
              <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
            </span>
            
            {!item.isRead && (
              <button 
                onClick={() => handleMarkAsRead(item.id)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <Check size={12} /> Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
            <Bell className="text-indigo-500" size={28} /> Notifications Hub
          </h1>
          <p className="text-sm text-muted mt-1">Stay updated with applications, real-time screening ratings, and scheduled calls.</p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-on-surface hover:text-on-surface bg-surface-high border border-outline hover:bg-slate-750 rounded-xl transition shadow-sm"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={12} /> : <CheckCheck size={14} />} Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Notifications List */}
      {!hasNotifications ? (
        <div className="py-24 text-center border border-dashed border-outline rounded-3xl bg-surface/20">
          <BellOff className="mx-auto text-on-surface-variant mb-4" size={48} />
          <h3 className="text-lg font-bold text-on-surface-variant">Workspace Quiet</h3>
          <p className="text-sm text-muted mt-1 max-w-sm mx-auto">You have no alerts or workspace updates at this time. Incoming candidate status events will display here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today Group */}
          {today.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Today
              </h3>
              <div className="space-y-4">
                {today.map(renderNotificationItem)}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {yesterday.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Yesterday
              </h3>
              <div className="space-y-4">
                {yesterday.map(renderNotificationItem)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlier.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-750" /> Earlier
              </h3>
              <div className="space-y-4">
                {earlier.map(renderNotificationItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
