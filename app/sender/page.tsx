'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileHeart, MessageCircle, Bell, Eye, Heart, Plus, ArrowRight, Clock, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Experience } from '@/lib/types';

export default function SenderOverview() {
  const { profile } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: exps } = await supabase
        .from('experiences')
        .select('*')
        .eq('sender_id', profile.id)
        .order('created_at', { ascending: false });
      setExperiences((exps as Experience[]) || []);

      const { data: { session } } = await supabase.auth.getSession();
      const captured = (exps as Experience[] || []).filter((experience) => experience.screenshot_taken);
      if (captured.length && session?.access_token) {
        const refreshed = await Promise.all(captured.map(async (experience) => {
          const response = await fetch(`/api/relationships/${experience.id}/screenshot`, { headers: { Authorization: `Bearer ${session.access_token}` } });
          const result = await response.json().catch(() => ({}));
          return response.ok && result.screenshot?.screenshot_url
            ? { id: experience.id, url: result.screenshot.screenshot_url }
            : null;
        }));
        setExperiences((current) => current.map((experience) => {
          const update = refreshed.find((item) => item?.id === experience.id);
          return update ? { ...experience, screenshot_url: update.url } : experience;
        }));
      }

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

  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`sender-screenshots-${profile.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'experiences',
        filter: `sender_id=eq.${profile.id}`,
      }, async (payload) => {
        const updatedExperience = payload.new as Experience;
        if (!updatedExperience.screenshot_taken) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch(`/api/relationships/${updatedExperience.id}/screenshot`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.screenshot?.screenshot_url) {
          setExperiences(current => current.map(experience => experience.id === updatedExperience.id
            ? { ...experience, ...updatedExperience, screenshot_url: result.screenshot.screenshot_url }
            : experience));
        }
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [profile]);

  const activeExps = experiences.filter((e) => e.status === 'active');
  const openedExps = experiences.filter((e) => e.is_opened);
  const yesResponses = experiences.filter((e) => e.response_status === 'yes');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Heart className="w-8 h-8 text-rose-400 animate-pulse" />
      </div>
    );
  }

  const stats = [
    { label: 'Experiences', value: experiences.length, icon: FileHeart, color: 'from-rose-400 to-pink-400' },
    { label: 'Active Links', value: activeExps.length, icon: Eye, color: 'from-lavender-400 to-purple-400' },
    { label: 'Opened', value: openedExps.length, icon: Bell, color: 'from-amber-400 to-orange-400' },
    { label: 'YES Responses', value: yesResponses.length, icon: Heart, color: 'from-green-400 to-teal-400' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-rose-700 mb-1">
          Hey, {profile?.name} ❤️
        </h1>
        <p className="text-rose-400/70 text-xs sm:text-sm">Here's how your love stories are doing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-rose-700">{stat.value}</p>
            <p className="text-sm text-rose-400/60">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/sender/create"
          className="group glass rounded-2xl p-6 hover:shadow-lg hover:shadow-rose-200/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-lavender-400">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-rose-700">Create New Experience</h3>
              <p className="text-sm text-rose-400/60">Start a new love letter for your pookie</p>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/sender/messages"
          className="group glass rounded-2xl p-6 hover:shadow-lg hover:shadow-rose-200/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-400 relative">
              <MessageCircle className="w-6 h-6 text-white" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-rose-700">Messages</h3>
              <p className="text-sm text-rose-400/60">{unreadMessages} unread messages</p>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent experiences */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-rose-700">Recent Experiences</h2>
          <Link href="/sender/experiences" className="text-sm text-rose-500 hover:text-rose-600">
            View all →
          </Link>
        </div>

        {experiences.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FileHeart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-400/60 mb-4">No experiences yet. Create your first love letter!</p>
            <Link
              href="/sender/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Experience
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.slice(0, 5).map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/sender/experiences/${exp.id}`}
                  className="block glass rounded-2xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-rose-700 truncate">
                        For {exp.receiver_name || '[Her Name]'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-rose-400/50">
                        <span className={`px-2 py-0.5 rounded-full ${
                          exp.status === 'active' ? 'bg-green-100 text-green-600' :
                          exp.status === 'draft' ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {exp.status}
                        </span>
                        {exp.is_opened && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Opened
                          </span>
                        )}
                        {exp.response_status && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {exp.response_status.toUpperCase()}
                          </span>
                        )}
                        {exp.screenshot_taken && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Camera className="w-3 h-3" /> Screenshot captured ✓
                          </span>
                        )}
                      </div>
                      {exp.screenshot_taken && exp.screenshot_url && (
                        <button type="button" onClick={(event) => { event.preventDefault(); setScreenshotUrl(exp.screenshot_url); }} className="mt-3 block text-left">
                          <img src={exp.screenshot_url} alt="Captured private relationship page" className="h-24 w-40 rounded-xl object-cover border border-rose-100 shadow-sm" />
                          <span className="mt-1 block text-xs font-medium text-rose-500">View full screenshot</span>
                          {exp.captured_at && (
                            <span className="mt-1 block text-[11px] text-rose-400/70">
                              Captured {new Date(exp.captured_at).toLocaleString()}
                              {exp.screenshot_width && exp.screenshot_height ? ` · ${exp.screenshot_width} × ${exp.screenshot_height}px` : ''}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <Clock className="w-4 h-4 text-rose-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {screenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setScreenshotUrl(null)}>
          <div className="relative max-h-full max-w-5xl" onClick={event => event.stopPropagation()}>
            <button type="button" title="Close screenshot" onClick={() => setScreenshotUrl(null)} className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 text-rose-600 shadow-lg">
              <span className="sr-only">Close screenshot</span>×
            </button>
            <img src={screenshotUrl} alt="Full captured private relationship page" className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
