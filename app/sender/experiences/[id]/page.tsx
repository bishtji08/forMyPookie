'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Heart, Image, Smile, Sparkles, Share2, Eye, Copy, Check, Trash2, Plus,
  Save, ArrowUp, ArrowDown, FileHeart, MessageCircle, X, UserPlus, Mail,
  Download, Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/upload/file-upload';
import type { Experience, Memory, FunnyMoment, LoveReason, GalleryItem, ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { getAppUrl } from '@/lib/utils';

type Tab = 'details' | 'receiver' | 'memories' | 'funny' | 'reasons' | 'gallery' | 'share';

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [exp, setExp] = useState<Experience | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Content state
  const [memories, setMemories] = useState<Memory[]>([]);
  const [funnyMoments, setFunnyMoments] = useState<FunnyMoment[]>([]);
  const [loveReasons, setLoveReasons] = useState<LoveReason[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Edit form
  const [editForm, setEditForm] = useState<Partial<Experience>>({});

  // Receiver assignment
  const [receiverEmail, setReceiverEmail] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: expData } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id as string)
        .maybeSingle();
      if (!expData) {
        toast({ title: 'Experience not found', variant: 'destructive' });
        router.push('/sender/experiences');
        return;
      }

      if (profile && expData.sender_id !== profile.id && profile.role !== 'admin') {
        toast({ title: 'Unauthorized access', description: 'You do not have permission to view or edit this experience.', variant: 'destructive' });
        router.push('/sender/experiences');
        return;
      }

      setExp(expData as Experience);
      setEditForm(expData as Experience);

      const [memRes, funnyRes, loveRes, galleryRes] = await Promise.all([
        supabase.from('memories').select('*').eq('experience_id', id).order('sort_order'),
        supabase.from('funny_moments').select('*').eq('experience_id', id).order('sort_order'),
        supabase.from('love_reasons').select('*').eq('experience_id', id).order('sort_order'),
        supabase.from('gallery_items').select('*').eq('experience_id', id).order('sort_order'),
      ]);
      setMemories((memRes.data as Memory[]) || []);
      setFunnyMoments((funnyRes.data as FunnyMoment[]) || []);
      setLoveReasons((loveRes.data as LoveReason[]) || []);
      setGallery((galleryRes.data as GalleryItem[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const saveDetails = async () => {
    setSaving(true);
    const { error } = await supabase.from('experiences').update(editForm).eq('id', id as string);
    if (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } else {
      toast({ title: 'Saved! ❤️' });
      setExp({ ...exp!, ...editForm } as Experience);
    }
    setSaving(false);
  };

  const togglePublish = async () => {
    if (!exp) return;
    const newStatus = exp.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('experiences').update({ status: newStatus }).eq('id', exp.id);
    if (error) {
      toast({ title: 'Failed', variant: 'destructive' });
      return;
    }
    setExp({ ...exp, status: newStatus });
    toast({ title: newStatus === 'active' ? 'Published! ❤️' : 'Unpublished' });
  };

  const assignReceiver = async () => {
    if (!receiverEmail.trim() || !exp) return;
    setAssigning(true);
    try {
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('email', receiverEmail.trim())
        .maybeSingle();
      if (!receiverProfile) {
 toast({ title: 'Receiver not found', description: 'Ask them to sign up first with this email.', variant: 'destructive' });
 return;
      }
      const { error } = await supabase
        .from('experiences')
        .update({ receiver_id: receiverProfile.id, receiver_name: receiverProfile.name })
        .eq('id', exp.id);
      if (error) throw error;
      setExp({ ...exp, receiver_id: receiverProfile.id, receiver_name: receiverProfile.name });
      toast({ title: 'Receiver assigned! ❤️', description: `${receiverProfile.name} can now view this experience.` });
      setReceiverEmail('');
    } catch (err: any) {
      toast({ title: 'Failed to assign', description: err?.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const appUrl = getAppUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareUrl = exp ? `${appUrl}/love/${exp.secure_token}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copied! 💌' });
  };

  const downloadQr = () => {
    const canvas = document.getElementById(`qr-canvas-detail`) as HTMLCanvasElement;
    if (!canvas || !exp) return;
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
    if (!exp) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `For ${exp.receiver_name || 'My Pookie'} ❤️`,
          text: `Pookie... I made something special for you. Open it? 💌`,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      copyLink();
    }
  };

  // Memory CRUD
  const addMemory = async () => {
    const { data, error } = await supabase
      .from('memories')
      .insert({ experience_id: id, title: 'New Memory', sort_order: memories.length })
      .select()
      .single();
    if (!error) setMemories([...memories, data as Memory]);
  };

  const updateMemory = async (mid: string, updates: Partial<Memory>) => {
    setMemories(memories.map((m) => (m.id === mid ? { ...m, ...updates } : m)));
    await supabase.from('memories').update(updates).eq('id', mid);
  };

  const deleteMemory = async (mid: string) => {
    await supabase.from('memories').delete().eq('id', mid);
    setMemories(memories.filter((m) => m.id !== mid));
  };

  const moveMemory = async (mid: string, dir: 'up' | 'down') => {
    const idx = memories.findIndex((m) => m.id === mid);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === memories.length - 1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const updated = [...memories];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    updated.forEach((m, i) => (m.sort_order = i));
    setMemories(updated);
    for (const m of updated) {
      await supabase.from('memories').update({ sort_order: m.sort_order }).eq('id', m.id);
    }
  };

  // Funny Moment CRUD
  const addFunny = async () => {
    const { data } = await supabase
      .from('funny_moments')
      .insert({ experience_id: id, title: 'New Inside Joke', description: '', sort_order: funnyMoments.length })
      .select()
      .single();
    if (data) setFunnyMoments([...funnyMoments, data as FunnyMoment]);
  };

  const updateFunny = async (fid: string, updates: Partial<FunnyMoment>) => {
    setFunnyMoments(funnyMoments.map((f) => (f.id === fid ? { ...f, ...updates } : f)));
    await supabase.from('funny_moments').update(updates).eq('id', fid);
  };

  const deleteFunny = async (fid: string) => {
    await supabase.from('funny_moments').delete().eq('id', fid);
    setFunnyMoments(funnyMoments.filter((f) => f.id !== fid));
  };

  // Love Reason CRUD
  const addReason = async () => {
    const { data } = await supabase
      .from('love_reasons')
      .insert({ experience_id: id, title: 'New Reason', description: '', sort_order: loveReasons.length })
      .select()
      .single();
    if (data) setLoveReasons([...loveReasons, data as LoveReason]);
  };

  const updateReason = async (rid: string, updates: Partial<LoveReason>) => {
    setLoveReasons(loveReasons.map((r) => (r.id === rid ? { ...r, ...updates } : r)));
    await supabase.from('love_reasons').update(updates).eq('id', rid);
  };

  const deleteReason = async (rid: string) => {
    await supabase.from('love_reasons').delete().eq('id', rid);
    setLoveReasons(loveReasons.filter((r) => r.id !== rid));
  };

  // Gallery CRUD
  const addGalleryItem = async () => {
    const { data } = await supabase
      .from('gallery_items')
      .insert({ experience_id: id, media_url: '', caption: '', category: 'random', sort_order: gallery.length })
      .select()
      .single();
    if (data) setGallery([...gallery, data as GalleryItem]);
  };

  const updateGalleryItem = async (gid: string, updates: Partial<GalleryItem>) => {
    setGallery(gallery.map((g) => (g.id === gid ? { ...g, ...updates } : g)));
    await supabase.from('gallery_items').update(updates).eq('id', gid);
  };

  const deleteGalleryItem = async (gid: string) => {
    await supabase.from('gallery_items').delete().eq('id', gid);
    setGallery(gallery.filter((g) => g.id !== gid));
  };

  if (loading || !exp) {
    return <div className="flex items-center justify-center h-full p-8"><Heart className="w-8 h-8 text-rose-400 animate-pulse" /></div>;
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'details', label: 'Details & Letters', icon: FileHeart },
    { key: 'receiver', label: 'Receiver', icon: UserPlus },
    { key: 'memories', label: 'Memories', icon: Image },
    { key: 'funny', label: 'Funny Moments', icon: Smile },
    { key: 'reasons', label: 'Love Reasons', icon: Sparkles },
    { key: 'gallery', label: 'Gallery', icon: Image },
    { key: 'share', label: 'Share & QR', icon: Share2 },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl font-bold text-rose-700">
              For {exp.receiver_name || '[Her Name]'}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePublish}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exp.status === 'active'
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white hover:shadow-lg'
                }`}
              >
                {exp.status === 'active' ? 'Unpublish' : 'Publish'}
              </button>
              <a
                href={`/love/${exp.secure_token}`}
                target="_blank"
                className="p-2 rounded-xl bg-white/60 text-rose-500 hover:bg-white transition"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              exp.status === 'active' ? 'bg-green-100 text-green-600' :
              exp.status === 'draft' ? 'bg-amber-100 text-amber-600' :
              'bg-gray-100 text-gray-500'
            }`}>{exp.status}</span>
            {exp.is_opened && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-rose-100 text-rose-600"><Eye className="w-3 h-3" /> Opened {exp.opened_at && new Date(exp.opened_at).toLocaleDateString()}</span>}
            {exp.response_status && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-lavender-100 text-lavender-600"><Heart className="w-3 h-3" /> {exp.response_status.toUpperCase()}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-md' : 'bg-white/60 text-rose-600/70 hover:bg-rose-50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Details */}
          {tab === 'details' && (
            <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Her Name</label>
                  <input
                    value={editForm.receiver_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, receiver_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Nickname</label>
                  <input
                    value={editForm.receiver_nickname || ''}
                    onChange={(e) => setEditForm({ ...editForm, receiver_nickname: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Your Name</label>
                  <input
                    value={editForm.sender_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, sender_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Relationship</label>
                  <input
                    value={editForm.relationship || ''}
                    onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Apology Message</label>
                <textarea
                  value={editForm.apology_message || ''}
                  onChange={(e) => setEditForm({ ...editForm, apology_message: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 resize-none font-serif-body text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Love Letter</label>
                <textarea
                  value={editForm.love_letter || ''}
                  onChange={(e) => setEditForm({ ...editForm, love_letter: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 resize-none font-serif-body text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Final Letter</label>
                <textarea
                  value={editForm.final_letter || ''}
                  onChange={(e) => setEditForm({ ...editForm, final_letter: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 resize-none font-serif-body text-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Theme</label>
                  <select
                    value={editForm.theme || 'pink-dream'}
                    onChange={(e) => setEditForm({ ...editForm, theme: e.target.value as ExperienceTheme })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700"
                  >
                    {(Object.entries(THEME_CONFIG) as [ExperienceTheme, typeof THEME_CONFIG[ExperienceTheme]][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">Music</label>
                  <FileUpload
                    experienceId={exp.id}
                    type="audio"
                    accept="audio/*"
                    label="Upload Audio"
                    currentUrl={editForm.music_url || ''}
                    onUpload={(url) => setEditForm({ ...editForm, music_url: url })}
                  />
                </div>
              </div>
              <button
                onClick={saveDetails}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Receiver Assignment */}
          {tab === 'receiver' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Assign Receiver</h2>
              <p className="text-sm text-rose-400/60">
                Link this experience to your pookie's account so she can access it from her dashboard and chat with you.
                She must have a For My Pookie account with this email.
              </p>

              {exp.receiver_id ? (
                <div className="p-4 rounded-xl bg-green-50/60 border border-green-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center text-white font-medium">
                      {exp.receiver_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-rose-700">{exp.receiver_name}</p>
                      <p className="text-xs text-green-600">Assigned and ready to chat</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-rose-600 mb-1.5 block">Receiver's Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                      <input
                        type="email"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        placeholder="her@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700"
                      />
                    </div>
                  </div>
                  <button
                    onClick={assignReceiver}
                    disabled={assigning || !receiverEmail.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" /> {assigning ? 'Assigning...' : 'Assign Receiver'}
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100/50">
                <p className="text-sm text-rose-400/70">
                  You can also just share the secure link directly — she'll be able to view the experience without an account.
                  Assigning her lets you use the private real-time chat.
                </p>
              </div>
            </div>
          )}

          {/* Memories */}
          {tab === 'memories' && (
            <div className="space-y-3">
              {memories.map((m, i) => (
                <div key={m.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveMemory(m.id, 'up')} disabled={i === 0} className="p-1 text-rose-400 disabled:opacity-20 hover:text-rose-600"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveMemory(m.id, 'down')} disabled={i === memories.length - 1} className="p-1 text-rose-400 disabled:opacity-20 hover:text-rose-600"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        value={m.title}
                        onChange={(e) => updateMemory(m.id, { title: e.target.value })}
                        placeholder="Memory title"
                        className="w-full px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 font-medium"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          value={m.date || ''}
                          onChange={(e) => updateMemory(m.id, { date: e.target.value })}
                          placeholder="Date"
                          className="px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
                        />
                        <input
                          value={m.location || ''}
                          onChange={(e) => updateMemory(m.id, { location: e.target.value })}
                          placeholder="Location"
                          className="px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
                        />
                        <input
                          value={m.category || ''}
                          onChange={(e) => updateMemory(m.id, { category: e.target.value })}
                          placeholder="Category"
                          className="px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
                        />
                      </div>
                      <FileUpload
                        experienceId={exp.id}
                        type={m.media_type === 'video' ? 'video' : 'image'}
                        accept={m.media_type === 'video' ? 'video/*' : 'image/*'}
                        label="Upload Photo or Video"
                        currentUrl={m.media_url || ''}
                        onUpload={(url) => updateMemory(m.id, { media_url: url })}
                      />
                      <input
                        value={m.caption}
                        onChange={(e) => updateMemory(m.id, { caption: e.target.value })}
                        placeholder="Caption"
                        className="w-full px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm font-handwritten text-lg"
                      />
                    </div>
                    <button onClick={() => deleteMemory(m.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={addMemory} className="w-full py-3 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 hover:border-rose-300 hover:bg-rose-50/50 transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Memory
              </button>
            </div>
          )}

          {/* Funny Moments */}
          {tab === 'funny' && (
            <div className="space-y-3">
              {funnyMoments.map((f) => (
                <div key={f.id} className="glass rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      value={f.title}
                      onChange={(e) => updateFunny(f.id, { title: e.target.value })}
                      placeholder="Joke title"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 font-medium"
                    />
                    <button onClick={() => deleteFunny(f.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <textarea
                    value={f.description}
                    onChange={(e) => updateFunny(f.id, { description: e.target.value })}
                    placeholder="Describe the inside joke..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 resize-none text-sm"
                  />
                  <FileUpload
                    experienceId={exp.id}
                    type="image"
                    accept="image/*"
                    label="Upload Image (optional)"
                    currentUrl={f.image_url || ''}
                    onUpload={(url) => updateFunny(f.id, { image_url: url })}
                  />
                </div>
              ))}
              <button onClick={addFunny} className="w-full py-3 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 hover:border-rose-300 hover:bg-rose-50/50 transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Funny Moment
              </button>
            </div>
          )}

          {/* Love Reasons */}
          {tab === 'reasons' && (
            <div className="space-y-3">
              {loveReasons.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      value={r.title}
                      onChange={(e) => updateReason(r.id, { title: e.target.value })}
                      placeholder="Reason title (e.g. Your smile)"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 font-medium"
                    />
                    <button onClick={() => deleteReason(r.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <textarea
                    value={r.description}
                    onChange={(e) => updateReason(r.id, { description: e.target.value })}
                    placeholder="Why you love this about her..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 resize-none text-sm"
                  />
                  <FileUpload
                    experienceId={exp.id}
                    type="image"
                    accept="image/*"
                    label="Upload Image (optional)"
                    currentUrl={r.image_url || ''}
                    onUpload={(url) => updateReason(r.id, { image_url: url })}
                  />
                </div>
              ))}
              <button onClick={addReason} className="w-full py-3 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 hover:border-rose-300 hover:bg-rose-50/50 transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Love Reason
              </button>
            </div>
          )}

          {/* Gallery */}
          {tab === 'gallery' && (
            <div className="space-y-3">
              {gallery.map((g) => (
                <div key={g.id} className="glass rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <select
                      value={g.category}
                      onChange={(e) => updateGalleryItem(g.id, { category: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm"
                    >
                      <option value="first-photo">First Photo</option>
                      <option value="first-date">First Date</option>
                      <option value="favorite-selfie">Favorite Selfie</option>
                      <option value="funniest">Funniest</option>
                      <option value="random">Random</option>
                      <option value="trips">Trips</option>
                      <option value="food">Food Dates</option>
                      <option value="festivals">Festivals</option>
                      <option value="late-night">Late Night</option>
                      <option value="stupid">Stupid Moments</option>
                    </select>
                    <button onClick={() => deleteGalleryItem(g.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <FileUpload
                    experienceId={exp.id}
                    type="image"
                    accept="image/*"
                    label="Upload Photo"
                    currentUrl={g.media_url || ''}
                    onUpload={(url) => updateGalleryItem(g.id, { media_url: url })}
                  />
                  <input
                    value={g.caption}
                    onChange={(e) => updateGalleryItem(g.id, { caption: e.target.value })}
                    placeholder="Caption"
                    className="w-full px-3 py-2 rounded-lg bg-white/60 border border-rose-200/50 focus:border-rose-400 outline-none text-rose-700 text-sm font-handwritten text-lg"
                  />
                </div>
              ))}
              <button onClick={addGalleryItem} className="w-full py-3 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 hover:border-rose-300 hover:bg-rose-50/50 transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Gallery Item
              </button>
            </div>
          )}

          {/* Share */}
          {tab === 'share' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-rose-700 mb-3">Share Link</h3>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 text-rose-700 text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-display text-lg font-semibold text-rose-700 mb-3">QR Code</h3>
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-rose-100">
                  <QRCodeCanvas
                    id="qr-canvas-detail"
                    value={shareUrl}
                    size={220}
                    fgColor="#d63d6f"
                    bgColor="#ffffff"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-rose-400/70 mt-3">Scan to open the experience on any phone</p>

                <div className="flex gap-3 justify-center max-w-xs mx-auto mt-4">
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
              </div>

              {/* Lock Protection Explanation */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50/70 border border-rose-200/60">
                <Lock className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-rose-700">Lock Protection Active</p>
                  <p className="text-xs text-rose-600/80 mt-0.5 leading-relaxed">
                    When {exp.receiver_name || 'your pookie'} opens this link or scans the QR code, she will be asked to <strong>sign up or log in first</strong> before unlocking the letter. Once logged in, she can read everything and chat with you directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50/60 border border-amber-200/50">
                <MessageCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  {exp.status === 'active'
                    ? 'This experience is live! Share the link with your pookie.'
                    : 'Publish this experience to make the link active.'}
                </p>
              </div>

              {exp.receiver_id && (
                <Link
                  href="/sender/messages"
                  className="block text-center py-3 rounded-xl bg-lavender-50 text-lavender-600 font-medium hover:bg-lavender-100 transition"
                >
                  Go to Chat with {exp.receiver_name} →
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
