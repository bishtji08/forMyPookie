'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Message, Profile } from '@/lib/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<(Message & { sender_name: string })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!msgs) { setLoading(false); return; }

      const senderIds = Array.from(new Set((msgs as Message[]).map((m) => m.sender_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', senderIds);
      const nameMap = new Map((profiles as Profile[])?.map((p) => [p.id, p.name]) || []);

      const enriched = (msgs as Message[]).map((m) => ({
        ...m,
        sender_name: nameMap.get(m.sender_id) || 'Unknown',
      }));
      setMessages(enriched);
      setLoading(false);
    })();
  }, []);

  const filtered = messages.filter((m) => !search || m.content?.toLowerCase().includes(search.toLowerCase()) || m.sender_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><MessageCircle className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Messages</h1>
      <p className="text-rose-400/60 text-sm mb-6">Recent message activity (admin view)</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-rose-700 text-sm">{msg.sender_name}</span>
              <span className="text-xs text-rose-300/50">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-rose-600/70">{msg.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
