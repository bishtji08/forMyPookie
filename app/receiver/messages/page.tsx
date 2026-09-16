'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Search, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { ChatWindow } from '@/components/chat/chat-window';
import type { Experience } from '@/lib/types';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ResponseBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-rose-300/60">Waiting for you…</span>;
  const map: Record<string, { label: string; color: string }> = {
    yes: { label: '💚 Accepted', color: 'text-emerald-500' },
    maybe: { label: '💛 Maybe', color: 'text-amber-500' },
    no: { label: '❌ Declined', color: 'text-rose-400' },
  };
  const cfg = map[status] ?? { label: status.toUpperCase(), color: 'text-rose-400' };
  return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

export default function ReceiverMessagesPage() {
  const { profile } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filtered, setFiltered] = useState<Experience[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .eq('receiver_id', profile.id)
      .order('updated_at', { ascending: false });
    const exps = (data as Experience[]) || [];
    setExperiences(exps);
    setFiltered(exps);
    setLoading(false);

    // Count unread messages per experience
    if (exps.length > 0) {
      const counts: Record<string, number> = {};
      await Promise.all(
        exps.map(async (exp) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('experience_id', exp.id)
            .eq('receiver_id', profile.id)
            .is('read_at', null);
          counts[exp.id] = count ?? 0;
        })
      );
      setUnreadMap(counts);
    }
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: refresh unread counts when messages arrive
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('receiver-messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? experiences.filter(
            (e) =>
              e.sender_name?.toLowerCase().includes(q) ||
              e.relationship?.toLowerCase().includes(q)
          )
        : experiences
    );
  }, [search, experiences]);

  const handleSelect = (exp: Experience) => {
    setSelectedExp(exp);
    // Reset unread count optimistically
    setUnreadMap((prev) => ({ ...prev, [exp.id]: 0 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <Heart className="w-10 h-10 text-rose-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* ── Sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-rose-100/50 bg-white/40 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/50">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-5 h-5 text-rose-400" />
            <h1 className="font-display text-lg font-bold text-rose-700">Messages</h1>
          </div>
          <p className="text-xs text-rose-400/60">Chat with your admirers</p>
        </div>

        {/* Search */}
        {experiences.length > 0 && (
          <div className="px-3 py-2 border-b border-rose-100/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/60 border border-rose-200/40 text-xs text-rose-700 placeholder:text-rose-300/60 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {experiences.length === 0 ? (
            <div className="p-6 text-center">
              <Sparkles className="w-10 h-10 text-rose-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-rose-500 mb-1">No messages yet</p>
              <p className="text-xs text-rose-400/50 leading-relaxed">
                Once someone sends you a special experience, conversations will appear here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-rose-400/50">No matches found.</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              <AnimatePresence>
                {filtered.map((exp, i) => {
                  const unread = unreadMap[exp.id] ?? 0;
                  const isSelected = selectedExp?.id === exp.id;
                  return (
                    <motion.button
                      key={exp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelect(exp)}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-100/80 to-lavender-100/50 shadow-sm'
                          : 'hover:bg-rose-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {(exp.sender_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-semibold text-rose-700 text-sm truncate">
                              {exp.sender_name || 'Someone Special'}
                            </p>
                            {unread > 0 && (
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unread > 9 ? '9+' : unread}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5 gap-1">
                            <ResponseBadge status={exp.response_status} />
                            <span className="text-[10px] text-rose-300/50 flex-shrink-0 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatRelativeTime(exp.updated_at)}
                            </span>
                          </div>
                          {exp.relationship && (
                            <p className="text-[10px] text-rose-400/40 mt-0.5 truncate capitalize">
                              {exp.relationship}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className="flex-1 min-w-0">
        {selectedExp ? (
          <ChatWindow
            experienceId={selectedExp.id}
            otherUserId={selectedExp.sender_id}
            otherUserName={selectedExp.sender_name || 'Sender'}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#fff8fa] to-[#faf5ff]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-10 h-10 text-rose-300" />
              </div>
              <h2 className="font-display text-xl font-bold text-rose-700 mb-2">
                Your Messages
              </h2>
              {experiences.length === 0 ? (
                <p className="text-rose-400/60 text-sm max-w-xs">
                  No conversations yet. When someone sends you a special experience,
                  you can chat with them here.
                </p>
              ) : (
                <p className="text-rose-400/60 text-sm">
                  Select a conversation from the left to start chatting 💬
                </p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
