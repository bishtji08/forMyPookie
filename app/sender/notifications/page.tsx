'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Heart, Eye, MessageCircle, Check, CheckCheck,
  Sparkles, BellOff,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  opened: Eye,
  response: Heart,
  message: MessageCircle,
  system: Sparkles,
};

const ICON_BG: Record<string, string> = {
  opened: 'from-sky-400 to-blue-400',
  response: 'from-rose-400 to-pink-400',
  message: 'from-lavender-400 to-purple-400',
  system: 'from-amber-400 to-orange-400',
};

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today · ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy · h:mm a');
}

function dateGroupLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function NotificationSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 flex items-start gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-rose-100/60 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-rose-100/60 rounded-lg w-3/4" />
        <div className="h-3 bg-rose-100/40 rounded-lg w-1/2" />
        <div className="h-3 bg-rose-100/30 rounded-lg w-1/3" />
      </div>
    </div>
  );
}

export default function SenderNotificationsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (!error) setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time subscription
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`notifs-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, load]);

  const markRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      toast({ title: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const markAllRead = async () => {
    if (!profile || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);
    if (error) {
      toast({ title: 'Failed to mark all read', variant: 'destructive' });
      load();
    } else {
      toast({ title: 'All caught up! ✓' });
    }
    setMarkingAll(false);
  };

  // Group by date label
  const groupedMap: Map<string, Notification[]> = new Map();
  for (const n of notifications) {
    const label = dateGroupLabel(n.created_at);
    if (!groupedMap.has(label)) groupedMap.set(label, []);
    groupedMap.get(label)!.push(n);
  }
  const groups = Array.from(groupedMap.entries());

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-bold text-rose-700">Notifications</h1>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white text-sm font-bold min-w-[28px]"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <p className="text-rose-400/60 text-sm">Stay updated on your love stories 💌</p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-rose-200/50 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all disabled:opacity-50 shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </motion.button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <NotificationSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center mx-auto mb-5">
            <BellOff className="w-10 h-10 text-rose-300" />
          </div>
          <h3 className="font-display text-lg font-semibold text-rose-600 mb-2">All quiet here</h3>
          <p className="text-rose-400/60 text-sm max-w-xs mx-auto">
            You&apos;ll see it here when your pookie opens your letter or responds 💕
          </p>
        </motion.div>
      )}

      {/* Grouped list */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-6">
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-rose-400/50 uppercase tracking-widest mb-3 px-1">
                {label}
              </p>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {items.map((n, i) => {
                    const Icon = ICON_MAP[n.type] ?? Bell;
                    const iconBg = ICON_BG[n.type] ?? 'from-rose-400 to-lavender-400';
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`glass rounded-2xl p-4 flex items-start gap-4 transition-all ${
                          !n.is_read
                            ? 'cursor-pointer hover:shadow-md hover:shadow-rose-100/60 border-l-4 border-l-rose-400'
                            : 'opacity-60'
                        }`}
                      >
                        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${iconBg} flex-shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm leading-snug ${n.is_read ? 'text-rose-600/70' : 'text-rose-700'}`}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-sm text-rose-400/60 mt-0.5 line-clamp-2">{n.body}</p>
                          )}
                          <p className="text-xs text-rose-300/60 mt-1.5">
                            {formatTimestamp(n.created_at)}
                            &nbsp;&middot;&nbsp;<span className="capitalize">{n.type}</span>
                          </p>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {!n.is_read
                            ? <span className="w-2.5 h-2.5 rounded-full bg-rose-400 block shadow-sm" />
                            : <Check className="w-4 h-4 text-rose-200" />
                          }
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <p className="text-center text-xs text-rose-300/50 mt-8">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''} &middot; {unreadCount} unread
        </p>
      )}
    </div>
  );
}
