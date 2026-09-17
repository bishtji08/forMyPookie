'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Message } from '@/lib/types';

interface ChatWindowProps {
  experienceId: string;
  otherUserId: string;
  otherUserName: string;
  onBack?: () => void;
}

export function ChatWindow({ experienceId, otherUserId, otherUserName, onBack }: ChatWindowProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!profile) return;

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: true });
      setMessages((data as Message[]) || []);
      setLoading(false);

      // Mark unread messages as read in batch
      const unread = (data as Message[])?.filter((m) => m.receiver_id === profile.id && !m.read_at) || [];
      if (unread.length > 0) {
        const unreadIds = unread.map((m) => m.id);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
      }
    })();

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `experience_id=eq.${experienceId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.receiver_id === profile.id && !newMsg.read_at) {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', newMsg.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `experience_id=eq.${experienceId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experienceId, profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile) return;
    const content = input.trim();
    setInput('');

    await supabase.from('messages').insert({
      experience_id: experienceId,
      sender_id: profile.id,
      receiver_id: otherUserId,
      content,
    });

    // Create notification for receiver
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'message',
      title: `New message from ${profile.name}`,
      body: content.slice(0, 100),
      experience_id: experienceId,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Heart className="w-8 h-8 text-rose-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-rose-100/50 bg-white/75 backdrop-blur-sm flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition active:scale-95"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
          {otherUserName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-rose-700 text-sm truncate">{otherUserName}</p>
          <p className="text-[11px] sm:text-xs text-rose-400/60 truncate">{otherTyping ? 'typing...' : 'Private chat'}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-10 h-10 text-rose-300 mx-auto mb-3" />
            <p className="text-rose-400/60 text-sm">No messages yet. Say something sweet!</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.sender_id === profile?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white rounded-br-sm'
                    : 'bg-white text-rose-700 rounded-bl-sm border border-rose-100'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'text-white/60' : 'text-rose-300'}`}>
                    <span className="text-xs">{formatTime(msg.created_at)}</span>
                    {isMe && msg.read_at && <span className="text-xs">✓✓</span>}
                    {isMe && !msg.read_at && <span className="text-xs">✓</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 py-3 border-t border-rose-100/50 bg-white/60 backdrop-blur-sm flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full bg-white/80 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700 text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
