'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, ArrowLeft, Check, CheckCheck, Clock, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Message } from '@/lib/types';
import { playPop } from '@/lib/audio-effects';

interface ExtendedMessage extends Message {
  isOptimistic?: boolean;
}

interface ChatWindowProps {
  experienceId: string;
  otherUserId: string;
  otherUserName: string;
  onBack?: () => void;
}

const QUICK_EMOJIS = ['❤️', '🥺', '💌', '🌸', '✨', '☕'];

export function ChatWindow({ experienceId, otherUserId, otherUserName, onBack }: ChatWindowProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const channelRef = useRef<any>(null);

  // Scroll smoothly to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    if (!profile) return;

    let isMounted = true;

    // 1. Initial messages fetch
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: true });

      if (!isMounted) return;
      setMessages((data as ExtendedMessage[]) || []);
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 50);

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

    // 2. Realtime subscription (Broadcast + Postgres Changes)
    const channel = supabase.channel(`chat-realtime-${experienceId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      // A. Real-time typing broadcast
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        if (payload.payload?.senderId === otherUserId) {
          setOtherTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => {
            setOtherTyping(false);
          }, 2500);
        }
      })
      // B. Sub-millisecond instant message broadcast
      .on('broadcast', { event: 'new_message' }, (payload: any) => {
        const incoming = payload.payload as Message;
        if (!incoming || incoming.sender_id !== otherUserId) return;

        setOtherTyping(false);
        playPop();

        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        // Auto mark as read if received in active window
        supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', incoming.id)
          .then(() => {});
      })
      // C. Postgres changes (INSERT & UPDATE) for guaranteed durability
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
          setMessages((prev) => {
            // Replace matching optimistic message or avoid duplicate
            const existingIdx = prev.findIndex(
              (m) =>
                m.id === newMsg.id ||
                (m.isOptimistic && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
            );
            if (existingIdx !== -1) {
              const copy = [...prev];
              copy[existingIdx] = newMsg;
              return copy;
            }
            if (newMsg.sender_id === otherUserId) {
              playPop();
            }
            return [...prev, newMsg];
          });

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
      isMounted = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [experienceId, profile, otherUserId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, otherTyping, scrollToBottom]);

  // Handle typing indicator broadcast
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!channelRef.current || !profile) return;

    const now = Date.now();
    // Throttle typing broadcasts to once every 1200ms
    if (now - lastTypingSentRef.current > 1200) {
      lastTypingSentRef.current = now;
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: profile.id },
      });
    }
  };

  const send = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const content = (customContent || input).trim();
    if (!content || !profile) return;
    if (!customContent) setInput('');

    // 1. Instant Optimistic Message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMsg: ExtendedMessage = {
      id: tempId,
      experience_id: experienceId,
      sender_id: profile.id,
      receiver_id: otherUserId,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    // 2. Immediate Broadcast to recipient for zero latency
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: optimisticMsg,
      });
    }

    try {
      // 3. Database persistence
      const { data, error } = await supabase
        .from('messages')
        .insert({
          experience_id: experienceId,
          sender_id: profile.id,
          receiver_id: otherUserId,
          content,
        })
        .select()
        .single();

      if (!error && data) {
        // Upgrade optimistic message with confirmed database record
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data as ExtendedMessage) : m))
        );
      }

      // 4. Send background notification to receiver
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'message',
        title: `New message from ${profile.name}`,
        body: content.slice(0, 100),
        experience_id: experienceId,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
        <Heart className="w-8 h-8 text-rose-400 animate-pulse mb-2" />
        <p className="text-xs text-rose-400/70 font-medium">Opening your private chat…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#fff8fa] via-[#fff5f8] to-[#faf5ff] relative">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-rose-100/70 bg-white/85 backdrop-blur-md flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
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
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm shadow-xs">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-rose-800 text-sm truncate">{otherUserName}</p>
            <p className="text-[11px] text-rose-400/80 truncate flex items-center gap-1">
              {otherTyping ? (
                <span className="text-rose-500 font-medium animate-pulse">typing a message… ❤️</span>
              ) : (
                <span>Private romantic chat 🔒</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-rose-400">
          <Heart className="w-4 h-4 fill-rose-300 text-rose-400 animate-pulse" />
        </div>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Heart className="w-7 h-7 text-rose-400 fill-rose-200" />
            </div>
            <h3 className="font-display font-semibold text-rose-700 text-base mb-1">Your secret sanctuary</h3>
            <p className="text-rose-400/70 text-xs max-w-xs mx-auto">
              No one else can see these messages. Send something sweet, apologize, or plan your next date!
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === profile?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-2xs ${
                    isMe
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-xs'
                      : 'bg-white text-rose-900 rounded-bl-xs border border-rose-100/90'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                      isMe ? 'text-white/75' : 'text-rose-400/70'
                    }`}
                  >
                    <span>{formatTime(msg.created_at)}</span>
                    {isMe && (
                      msg.isOptimistic ? (
                        <Clock className="w-3 h-3 text-white/60 animate-spin" />
                      ) : msg.read_at ? (
                        <CheckCheck className="w-3 h-3 text-white font-bold" />
                      ) : (
                        <Check className="w-3 h-3 text-white/80" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live typing indicator bubble */}
        {otherTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-rose-100 rounded-2xl rounded-bl-xs px-4 py-2.5 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick romantic emoji reactions */}
      <div className="px-4 py-1.5 bg-white/50 backdrop-blur-xs border-t border-rose-100/40 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        <span className="text-[11px] font-medium text-rose-400/80 mr-1 shrink-0">Quick:</span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => send(undefined, emoji)}
            className="px-2 py-0.5 rounded-full bg-white hover:bg-rose-50 border border-rose-100 text-xs transition active:scale-95 shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={send}
        className="px-4 py-3 border-t border-rose-100/60 bg-white/90 backdrop-blur-md flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Say something sweet..."
          className="flex-1 px-4 py-2.5 rounded-full bg-rose-50/50 border border-rose-200/60 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-800 text-sm transition"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
