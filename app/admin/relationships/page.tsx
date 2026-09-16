'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileHeart, Eye, Heart, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Experience } from '@/lib/types';

export default function AdminRelationshipsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let query = supabase.from('experiences').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data } = await query;
      setExperiences((data as Experience[]) || []);
      setLoading(false);
    })();
  }, [statusFilter]);

  const filtered = experiences.filter((e) =>
    !search || e.receiver_name?.toLowerCase().includes(search.toLowerCase()) || e.sender_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><FileHeart className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Relationships</h1>
      <p className="text-rose-400/60 text-sm mb-6">Manage all relationship experiences</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender or receiver name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-rose-700">
                  {exp.sender_name || 'Unknown'} → {exp.receiver_name || '[Her Name]'}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    exp.status === 'active' ? 'bg-green-100 text-green-600' :
                    exp.status === 'draft' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>{exp.status}</span>
                  {exp.is_opened && <span className="flex items-center gap-1 text-xs text-rose-400/60"><Eye className="w-3 h-3" /> Opened</span>}
                  {exp.response_status && <span className="flex items-center gap-1 text-xs text-rose-400/60"><Heart className="w-3 h-3" /> {exp.response_status.toUpperCase()}</span>}
                  <span className="text-xs text-rose-300/50">{new Date(exp.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                href={`/love/${exp.secure_token}`}
                target="_blank"
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
