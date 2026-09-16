'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Check, X, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Report } from '@/lib/types';

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setReports((data as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
      return;
    }
    toast({ title: 'Report updated' });
    load();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><Flag className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Reports</h1>
      <p className="text-rose-400/60 text-sm mb-6">Moderation and user reports</p>

      {reports.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Flag className="w-12 h-12 text-rose-300 mx-auto mb-4" />
          <p className="text-rose-400/60">No reports yet. All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-600' :
                      report.status === 'dismissed' ? 'bg-gray-100 text-gray-500' :
                      'bg-blue-100 text-blue-600'
                    }`}>{report.status}</span>
                  </div>
                  <p className="text-sm text-rose-700">{report.reason}</p>
                  <p className="text-xs text-rose-300/50 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                </div>
                {report.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'dismissed')}
                      className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
