'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, FileHeart, MessageCircle, Heart, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    senders: 0,
    receivers: 0,
    totalExperiences: 0,
    activeLinks: 0,
    openedLinks: 0,
    totalMessages: 0,
    yesResponses: 0,
    maybeResponses: 0,
    noResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [usersRes, sendersRes, receiversRes, expsRes, activeExpsRes, openedExpsRes, msgsRes, yesRes, maybeRes, noRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'sender'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'receiver'),
        supabase.from('experiences').select('id', { count: 'exact', head: true }),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('is_opened', true),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('response_status', 'yes'),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('response_status', 'maybe'),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('response_status', 'no'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        senders: sendersRes.count || 0,
        receivers: receiversRes.count || 0,
        totalExperiences: expsRes.count || 0,
        activeLinks: activeExpsRes.count || 0,
        openedLinks: openedExpsRes.count || 0,
        totalMessages: msgsRes.count || 0,
        yesResponses: yesRes.count || 0,
        maybeResponses: maybeRes.count || 0,
        noResponses: noRes.count || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><BarChart3 className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  const totalResponses = stats.yesResponses + stats.maybeResponses + stats.noResponses || 1;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Analytics</h1>
      <p className="text-rose-400/60 text-sm mb-6">Platform statistics and insights</p>

      {/* User distribution */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-rose-700 mb-4">User Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Senders', value: stats.senders, total: stats.totalUsers, color: 'bg-rose-400' },
            { label: 'Receivers', value: stats.receivers, total: stats.totalUsers, color: 'bg-lavender-400' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-rose-600">{item.label}</span>
                <span className="text-rose-400/60">{item.value} / {item.total}</span>
              </div>
              <div className="w-full h-3 bg-rose-100/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / (item.total || 1)) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response breakdown */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-rose-700 mb-4">Response Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'YES', value: stats.yesResponses, color: 'bg-green-400' },
            { label: 'MAYBE', value: stats.maybeResponses, color: 'bg-amber-400' },
            { label: 'NO', value: stats.noResponses, color: 'bg-gray-400' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-rose-600">{item.label}</span>
                <span className="text-rose-400/60">{item.value} ({Math.round((item.value / totalResponses) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-rose-100/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / totalResponses) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users },
          { label: 'Experiences', value: stats.totalExperiences, icon: FileHeart },
          { label: 'Messages', value: stats.totalMessages, icon: MessageCircle },
          { label: 'Opened Links', value: stats.openedLinks, icon: Eye },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 text-center"
          >
            <m.icon className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-rose-700">{m.value}</p>
            <p className="text-sm text-rose-400/60">{m.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
