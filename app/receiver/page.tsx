'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, FileHeart, MessageCircle, Bell, Eye, ArrowRight, Sparkles, Plus, CalendarHeart, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Experience } from '@/lib/types';
import { PRESET_DATE_IDEAS, formatCustomDateIdea } from '@/lib/date-ideas';

export default function ReceiverOverview() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [suggestInput, setSuggestInput] = useState('');
  const [suggesting, setSuggesting] = useState(false);

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

  const primaryExp = experiences[0];

  const handleSuggestDate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!suggestInput.trim() || !primaryExp || !profile) return;
    const idea = suggestInput.trim();
    setSuggesting(true);

    try {
      // 1. Insert into date_requests
      await supabase.from('date_requests').insert({
        experience_id: primaryExp.id,
        receiver_id: profile.id,
        activity: idea,
      });

      // 2. Also append to experiences date_options if not present
      const currentOpts = primaryExp.date_options || [];
      if (!currentOpts.includes(idea)) {
        await supabase
          .from('experiences')
          .update({ date_options: [...currentOpts, idea] })
          .eq('id', primaryExp.id);
        setExperiences((prev) =>
          prev.map((ex) => (ex.id === primaryExp.id ? { ...ex, date_options: [...currentOpts, idea] } : ex))
        );
      }

      // 3. Notify sender
      if (primaryExp.sender_id) {
        await supabase.from('notifications').insert({
          user_id: primaryExp.sender_id,
          type: 'response',
          title: `${profile.name} suggested a date idea! 🥂✨`,
          body: `She suggested: "${idea}"`,
          experience_id: primaryExp.id,
        });
      }

      toast({
        title: 'Date idea sent! 🥂❤️',
        description: `Your suggestion "${idea}" was shared with ${primaryExp.sender_name || 'your partner'}.`,
      });
      setSuggestInput('');
    } catch (err: any) {
      toast({
        title: 'Could not send date idea',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-rose-700 mb-1">
          Hey, {profile?.name} ❤️
        </h1>
        <p className="text-rose-400/70 text-xs sm:text-sm">Someone wrote something special for you.</p>
      </div>

      {/* Date Ideas & Wishlist Card (if an experience is linked) */}
      {primaryExp && (
        <div className="glass rounded-3xl p-5 sm:p-6 mb-6 shadow-sm border border-rose-200/50 bg-white/75">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-rose-500" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-rose-700">
                Plan Our Next Date with {primaryExp.sender_name || 'Your Partner'}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">
              Interactive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-rose-400/70 mb-4">
            Suggest a date idea you&apos;d love to go on together. He&apos;ll be notified immediately!
          </p>

          {/* Quick suggestion input */}
          <form onSubmit={handleSuggestDate} className="flex gap-2 mb-4">
            <input
              value={suggestInput}
              onChange={(e) => setSuggestInput(e.target.value)}
              placeholder="e.g. Picnic at sunset 🧺, Late night bowling 🎳, Making sushi 🍣"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-rose-200/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700 text-sm"
            />
            <button
              type="submit"
              disabled={!suggestInput.trim() || suggesting}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
            >
              {suggesting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Suggest Date</span>
                </>
              )}
            </button>
          </form>

          {/* Offered date options pills */}
          {primaryExp.date_options && primaryExp.date_options.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">
                Offered Date Options & Ideas:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {primaryExp.date_options.map((opt) => {
                  const info = formatCustomDateIdea(opt);
                  return (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                    >
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
                href={`/love/${exp.id}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8">
        <Link href="/receiver/messages" className="glass rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all">
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
