'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileHeart, Plus, Eye, Heart, Clock, Trash2, Edit,
  Share2, Search, X, CheckCircle, AlertCircle, Filter,
  Copy, ExternalLink, QrCode, Download, Lock, Check
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Experience, ExperienceStatus } from '@/lib/types';

// ── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<ExperienceStatus, string> = {
  active: 'bg-green-100 text-green-700 border border-green-200',
  draft: 'bg-amber-100 text-amber-700 border border-amber-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  expired: 'bg-red-100 text-red-500 border border-red-200',
};
const STATUS_DOT: Record<ExperienceStatus, string> = {
  active: 'bg-green-400',
  draft: 'bg-amber-400',
  inactive: 'bg-gray-400',
  expired: 'bg-red-400',
};

const FILTER_TABS: { label: string; value: 'all' | ExperienceStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Inactive', value: 'inactive' },
];

// ── Card skeleton ────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-rose-100/60 rounded-lg w-2/3" />
          <div className="h-3 bg-rose-100/40 rounded-lg w-1/3" />
        </div>
        <div className="w-16 h-6 bg-rose-100/40 rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="w-16 h-6 bg-rose-100/30 rounded-full" />
        <div className="w-16 h-6 bg-rose-100/30 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-rose-100/20 rounded-xl" />
        <div className="flex-1 h-9 bg-rose-100/20 rounded-xl" />
      </div>
    </div>
  );
}

// ── QR Code & Share dialog ──────────────────────────────────────────────────
function QrShareDialog({
  exp, onCancel,
}: {
  exp: Experience; onCancel: () => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/love/${exp.secure_token}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copied to clipboard! 💌' });
  };

  const downloadQr = () => {
    const canvas = document.getElementById(`qr-canvas-${exp.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `love-qr-${(exp.receiver_name || 'pookie').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast({ title: 'QR Code downloaded! 📥' });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `For ${exp.receiver_name || 'My Pookie'} ❤️`,
          text: `Pookie... I made something special for you. Open it? 💌`,
          url: shareUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      copyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-center"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 fill-current" /> Share Love Letter
          </span>
          <h3 className="font-display text-2xl font-bold text-rose-700">
            For {exp.receiver_name || 'Your Pookie'}
          </h3>
          <p className="text-xs text-rose-400/70 mt-1">
            Scan with any phone camera or share the private link below
          </p>
        </div>

        {/* QR Code Canvas */}
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-lavender-50 border-2 border-rose-100/80 shadow-inner my-2">
          <QRCodeCanvas
            id={`qr-canvas-${exp.id}`}
            value={shareUrl}
            size={200}
            fgColor="#d63d6f"
            bgColor="#ffffff"
            includeMargin
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center my-3">
          <button
            onClick={downloadQr}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
          <button
            onClick={shareNative}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white text-xs font-semibold hover:shadow-md transition"
          >
            <Share2 className="w-4 h-4" /> Share Directly
          </button>
        </div>

        {/* Link Input with Copy */}
        <div className="flex items-center gap-2 mb-4">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 border border-rose-100 text-gray-600 truncate outline-none"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition flex items-center gap-1 flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-left">
          <Lock className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-600/80 leading-relaxed">
            <strong>Lock Protection Active:</strong> When {exp.receiver_name || 'your pookie'} opens this link or scans the QR, she will be asked to <strong>sign up or log in first</strong> before reading your love letter.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Delete dialog ────────────────────────────────────────────────────────────
function DeleteDialog({
  exp, onCancel, onConfirm, deleting,
}: {
  exp: Experience; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-800">Delete Experience</h3>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete the experience for{' '}
          <strong>{exp.receiver_name}</strong>? This cannot be undone and will remove all related data.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleting ? 'Deleting…' : 'Delete Forever'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ExperiencesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ExperienceStatus>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrTarget, setQrTarget] = useState<Experience | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .eq('sender_id', profile.id)
      .order('created_at', { ascending: false });
    setExperiences((data as Experience[]) || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  // ── Filtered + searched list ───────────────────────────────────────────
  const visible = experiences.filter((e) => {
    const matchStatus = filter === 'all' || e.status === filter;
    const matchSearch = !search || e.receiver_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('experiences').delete().eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Deleted experience for ${deleteTarget.receiver_name}` });
      setExperiences((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  // ── Share link ─────────────────────────────────────────────────────────
  const copyLink = (token: string) => {
    const url = `${window.location.origin}/love/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard! 💌' });
  };

  // ── Counts ─────────────────────────────────────────────────────────────
  const counts: Record<string, number> = { all: experiences.length };
  for (const e of experiences) counts[e.status] = (counts[e.status] || 0) + 1;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-700">My Experiences</h1>
          <p className="text-rose-400/60 text-sm mt-1">
            {experiences.length} love {experiences.length === 1 ? 'letter' : 'letters'} created 💌
          </p>
        </div>
        <Link
          href="/sender/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg hover:shadow-rose-200/50 transition-all"
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Status filter tabs */}
        <div className="flex gap-1.5 bg-white/60 rounded-xl p-1 border border-rose-100/50 flex-shrink-0">
          {FILTER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === value
                  ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-sm'
                  : 'text-rose-400/70 hover:text-rose-600'
              }`}
            >
              {label}
              {counts[value] != null && (
                <span className={`ml-1.5 text-xs ${filter === value ? 'opacity-80' : 'opacity-60'}`}>
                  {counts[value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receiver name…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/20 outline-none text-rose-700 placeholder:text-rose-300 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state – no experiences at all */}
      {!loading && experiences.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center mx-auto mb-5">
            <FileHeart className="w-10 h-10 text-rose-300" />
          </div>
          <h3 className="font-display text-xl font-semibold text-rose-600 mb-2">No love letters yet</h3>
          <p className="text-rose-400/60 text-sm mb-6 max-w-xs mx-auto">
            Create your first experience to share a romantic moment with your pookie.
          </p>
          <Link
            href="/sender/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Create Your First
          </Link>
        </motion.div>
      )}

      {/* Empty state – filter/search has no results */}
      {!loading && experiences.length > 0 && visible.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <Search className="w-10 h-10 text-rose-200 mx-auto mb-3" />
          <p className="text-rose-400/60">No experiences match your filters.</p>
          <button
            onClick={() => { setFilter('all'); setSearch(''); }}
            className="mt-3 text-sm text-rose-500 hover:text-rose-600 underline"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Experience grid */}
      {!loading && visible.length > 0 && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {visible.map((exp, i) => (
              <motion.div
                key={exp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:shadow-rose-100/40 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-rose-700 truncate">
                      For {exp.receiver_name || '[Name]'}
                    </h3>
                    {exp.receiver_nickname && (
                      <p className="text-xs text-rose-400/60 mt-0.5">&ldquo;{exp.receiver_nickname}&rdquo;</p>
                    )}
                    <p className="text-xs text-rose-300/60 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(exp.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[exp.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[exp.status]}`} />
                    {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                  </span>
                </div>

                {/* Engagement badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {exp.is_opened ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sky-100 text-sky-600 border border-sky-200">
                      <Eye className="w-3 h-3" /> Opened
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-400 border border-gray-200">
                      <Eye className="w-3 h-3" /> Not opened
                    </span>
                  )}

                  {exp.response_status ? (
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
                      exp.response_status === 'yes' ? 'bg-green-100 text-green-600 border-green-200' :
                      exp.response_status === 'maybe' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                      'bg-red-100 text-red-500 border-red-200'
                    }`}>
                      <Heart className="w-3 h-3" /> {exp.response_status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-400 border border-gray-200">
                      <Heart className="w-3 h-3" /> No response
                    </span>
                  )}

                  {exp.opened_at && (
                    <span className="text-xs text-rose-300/50">
                      Opened {format(new Date(exp.opened_at), 'MMM d')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-rose-100/50">
                  <Link
                    href={`/sender/experiences/${exp.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>

                  <Link
                    href={`/love/${exp.secure_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-lavender-50 text-lavender-600 text-sm font-medium hover:bg-lavender-100 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                  </Link>

                  <button
                    onClick={() => setQrTarget(exp)}
                    title="Generate QR Code & Share"
                    className="p-2 rounded-xl bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 hover:bg-rose-200 transition"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => copyLink(exp.secure_token)}
                    title="Copy share link"
                    className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(exp)}
                    title="Delete experience"
                    className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* QR Code & Share dialog */}
      <AnimatePresence>
        {qrTarget && (
          <QrShareDialog
            exp={qrTarget}
            onCancel={() => setQrTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            exp={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
