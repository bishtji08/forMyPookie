'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Heart,
  Eye,
  MessageCircle,
  Check,
  CheckCheck,
  Sparkles,
  Gift,
  Trash2,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Notification } from '@/lib/types';

type FilterType = 'all' | 'unread' | 'message' | 'opened' | 'response' | 'system';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; gradient: string; iconColor: string; label: string }
> = {
  opened: {
    Icon: Eye,
    gradient: 'from-sky-100 to-blue-100',
    iconColor: 'text-sky-500',
    label: 'Opened',
  },
  response: {
    Icon: Heart,
    gradient: 'from-rose-100 to-pink-100',
    iconColor: 'text-rose-500',
    label: 'Response',
  },
  message: {
    Icon: MessageCircle,
    gradient: 'from-violet-100 to-lavender-100',
    iconColor: 'text-violet-500',
    label: 'Message',
  },
  system: {
    Icon: Sparkles,
    gradient: 'from-amber-100 to-orange-100',
    iconColor: 'text-amber-500',
    label: 'System',
  },
};

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'message', label: 'Messages' },
  { key: 'opened', label: 'Opened' },
  { key: 'response', label: 'Responses' },
  { key: 'system', label: 'System' },
];

function NotificationCard({
  n,
  onMarkRead,
  onDelete,
}: {
  n: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
  const { Icon, gradient, iconColor } = cfg;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`glass rounded-2xl p-4 flex items-start gap-3 group transition-all ${
        !n.is_read
          ? 'border-l-4 border-l-rose-400 shadow-sm'
          : 'opacity-70 hover:opacity-90'
      }`}
    >
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-rose-700 text-sm leading-tight">{n.title}</p>
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!n.is_read && (
              <button
                onClick={() => onMarkRead(n.id)}
                title="Mark as read"
                className="p-1.5 rounded-lg hover:bg-rose-100/60 text-rose-400 transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(n.id)}
              title="Delete"
              className="p-1.5 rounded-lg hover:bg-rose-100/60 text-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {n.body && (
          <p className="text-sm text-rose-500/70 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] uppercase tracking-wide font-medium text-rose-300/60 bg-rose-50/60 px-1.5 py-0.5 rounded-md">
            {cfg.label}
          </span>
          <span className="text-xs text-rose-300/50">{formatRelativeTime(n.created_at)}</span>
          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 ml-auto" />}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReceiverNotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [deletingAll, setDeletingAll] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time subscription
  useEffect(() => {
    if (!profile) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`notifications-receiver-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAllRead = async () => {
    if (!profile) return;
    setDeletingAll(true);
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', profile.id)
      .eq('is_read', true);
    setNotifications((prev) => prev.filter((n) => !n.is_read));
    setDeletingAll(false);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const hasRead = notifications.some((n) => n.is_read);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          <Bell className="w-10 h-10 text-rose-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-display text-2xl font-bold text-rose-700">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-rose-400/60 text-sm">All your updates in one place 🌸</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 border border-rose-100 text-rose-600 text-xs font-medium hover:bg-rose-50 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {hasRead && (
            <button
              onClick={deleteAllRead}
              disabled={deletingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 border border-rose-100 text-rose-400 text-xs font-medium hover:bg-rose-50 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deletingAll ? 'Clearing…' : 'Clear read'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter tabs */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide"
        >
          <Filter className="w-3.5 h-3.5 text-rose-300 flex-shrink-0 mr-0.5" />
          {FILTER_OPTIONS.map((opt) => {
            const count =
              opt.key === 'all'
                ? notifications.length
                : opt.key === 'unread'
                ? unreadCount
                : notifications.filter((n) => n.type === opt.key).length;
            if (count === 0 && opt.key !== 'all') return null;
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === opt.key
                    ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-sm'
                    : 'bg-white/60 text-rose-500 border border-rose-100 hover:bg-rose-50'
                }`}
              >
                {opt.label}
                <span className={`ml-1 ${filter === opt.key ? 'opacity-80' : 'opacity-50'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-14 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-rose-300" />
          </div>
          <p className="font-display text-lg font-bold text-rose-700 mb-1">All quiet here</p>
          <p className="text-rose-400/60 text-sm">
            Notifications will appear here when someone sends you something special 💌
          </p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Bell className="w-10 h-10 text-rose-200 mx-auto mb-3" />
          <p className="text-rose-400/60 text-sm">No notifications match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                n={n}
                onMarkRead={markRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
