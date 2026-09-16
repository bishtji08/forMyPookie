'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, FileHeart, MessageCircle, Bell, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Experience } from '@/lib/types';

export default function ReceiverOverview() {
  const { profile } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: exps } = await supabase
        .from('experiences')
        .select('*')
        .eq('receiver_id', profile.id)
        .order('created_at', { ascending: false });
      setExperiences((exps as Experience[]) || []);

      const { count: msgCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('receiver_id', profile.id)
        .is('read_at', null);
      setUnreadMessages(msgCount || 0);

      const { count: notifCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', profile.id)
        .eq('is_read', false);
      setUnreadNotifs(notifCount || 0);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><Heart className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-rose-700 mb-1">
          Hey, {profile?.name} ❤️
        </h1>
        <p className="text-rose-400/60">Someone wrote something special for you.</p>
      </div>

      {experiences.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-rose-300 mx-auto mb-4" />
          <p className="text-rose-400/60 mb-2">No experiences yet.</p>
          <p className="text-sm text-rose-400/40">When someone shares a love letter with you, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/love/${exp.secure_token}`}
                className="block glass rounded-2xl p-6 hover:shadow-lg hover:shadow-rose-200/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-rose-700 mb-1">
                      From {exp.sender_name || 'Someone special'}
                    </h3>
                    <p className="text-sm text-rose-400/60 mb-3">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {exp.is_opened && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-rose-100 text-rose-600">
                          <Eye className="w-3 h-3" /> Opened
                        </span>
                      )}
                      {exp.response_status && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                          exp.response_status === 'yes' ? 'bg-green-100 text-green-600' :
                          exp.response_status === 'maybe' ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          <Heart className="w-3 h-3" /> {exp.response_status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/receiver/messages" className="glass rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-400 flex items-center justify-center relative">
              <MessageCircle className="w-5 h-5 text-white" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-rose-700">Messages</p>
              <p className="text-xs text-rose-400/60">{unreadMessages} unread</p>
            </div>
          </div>
        </Link>
        <Link href="/receiver/notifications" className="glass rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-white" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-rose-700">Notifications</p>
              <p className="text-xs text-rose-400/60">{unreadNotifs} new</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
