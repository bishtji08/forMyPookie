'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { ChatWindow } from '@/components/chat/chat-window';
import type { Experience } from '@/lib/types';

export default function SenderMessagesPage() {
  const { profile } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('experiences')
        .select('*')
        .eq('sender_id', profile.id)
        .not('receiver_id', 'is', null)
        .order('created_at', { ascending: false });
      setExperiences((data as Experience[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  const selectExp = (exp: Experience) => {
    setSelectedExp(exp);
    setReceiverName(exp.receiver_name || 'Pookie');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><Heart className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  return (
    <div className="h-screen flex">
      {/* Conversation list */}
      <div className="w-72 border-r border-rose-100/50 bg-white/40 backdrop-blur-sm overflow-y-auto">
        <div className="px-5 py-4 border-b border-rose-100/50">
          <h1 className="font-display text-lg font-bold text-rose-700">Messages</h1>
          <p className="text-xs text-rose-400/60">Your private conversations</p>
        </div>
        {experiences.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
            <p className="text-sm text-rose-400/60">No conversations yet. Once your pookie responds, chat will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {experiences.map((exp) => (
              <button
                key={exp.id}
                onClick={() => selectExp(exp)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                  selectedExp?.id === exp.id ? 'bg-rose-100/60' : 'hover:bg-rose-50/60'
                }`}
              >
                <p className="font-medium text-rose-700 text-sm">{exp.receiver_name || 'Pookie'}</p>
                <p className="text-xs text-rose-400/50 mt-0.5">
                  {exp.response_status ? exp.response_status.toUpperCase() : 'No response yet'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {selectedExp && selectedExp.receiver_id ? (
          <ChatWindow
            experienceId={selectedExp.id}
            otherUserId={selectedExp.receiver_id}
            otherUserName={receiverName}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-rose-200 mx-auto mb-4" />
              <p className="text-rose-400/60">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
