'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileHeart, MessageCircle, Heart, Eye, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

export default function AdminOverview() {
  const { profile } = useAuth();
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

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-rose-400 to-pink-400' },
    { label: 'Senders', value: stats.senders, icon: Users, color: 'from-lavender-400 to-purple-400' },
    { label: 'Receivers', value: stats.receivers, icon: Users, color: 'from-amber-400 to-orange-400' },
    { label: 'Experiences', value: stats.totalExperiences, icon: FileHeart, color: 'from-teal-400 to-cyan-400' },
    { label: 'Active Links', value: stats.activeLinks, icon: TrendingUp, color: 'from-green-400 to-emerald-400' },
    { label: 'Opened', value: stats.openedLinks, icon: Eye, color: 'from-blue-400 to-indigo-400' },
    { label: 'Messages', value: stats.totalMessages, icon: MessageCircle, color: 'from-violet-400 to-purple-400' },
    { label: 'YES', value: stats.yesResponses, icon: Heart, color: 'from-rose-500 to-pink-500' },
  ];

  const responseCards = [
    { label: 'YES Responses', value: stats.yesResponses, color: 'bg-green-100 text-green-600' },
    { label: 'MAYBE Responses', value: stats.maybeResponses, color: 'bg-amber-100 text-amber-600' },
    { label: 'NO Responses', value: stats.noResponses, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-rose-700">Admin Dashboard</h1>
        <p className="text-rose-400/60 text-sm">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-rose-700">{card.value}</p>
            <p className="text-sm text-rose-400/60">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-rose-700 mb-4">Response Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {responseCards.map((rc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-2 ${rc.color}`}>
                {rc.label}
              </p>
              <p className="text-3xl font-bold text-rose-700">{rc.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
