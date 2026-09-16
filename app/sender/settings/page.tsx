'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Save, Lock, Trash2, Camera, Eye, EyeOff,
  Bell, Shield, Check, X, AlertTriangle, Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle?: string;
  icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-rose-700">{title}</h2>
          {subtitle && <p className="text-xs text-rose-400/60">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function SenderSettingsPage() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.profile_image || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications prefs (stored in localStorage for now)
  const [notifOpened, setNotifOpened] = useState(true);
  const [notifResponse, setNotifResponse] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);

  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Keep name in sync if profile loads late
  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.profile_image) setAvatarUrl(profile.profile_image);
  }, [profile]);

  // ── Avatar upload ──────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `profiles/${profile.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    await supabase.from('profiles').update({ profile_image: publicUrl }).eq('id', profile.id);
    await refreshProfile();
    setAvatarUrl(publicUrl);
    toast({ title: 'Profile photo updated! 📸' });
    setUploadingAvatar(false);
  };

  // ── Save profile ───────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile.id);
    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Profile updated! ❤️' });
    }
    setSavingProfile(false);
  };

  // ── Change password ────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Failed to update password', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password changed successfully 🔒' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  // ── Delete account ─────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!profile) return;
    if (deleteConfirm !== profile.name) {
      toast({ title: 'Name does not match', variant: 'destructive' });
      return;
    }
    setDeleting(true);
    // Delete profile row — cascade deletes experiences etc. in DB
    const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
    if (error) {
      toast({ title: 'Deletion failed', description: error.message, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    await signOut();
  };

  // ── Toggle helper ──────────────────────────────────────────────────────
  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-gradient-to-r from-rose-400 to-lavender-400' : 'bg-rose-100'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </button>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-700">Settings</h1>
        <p className="text-rose-400/60 text-sm mt-1">Manage your profile and preferences 🌸</p>
      </div>

      {/* ── 1. Profile ──────────────────────────────────────────────────── */}
      <Section title="Profile" subtitle="Your public info" icon={User}>
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center text-white text-2xl font-semibold shadow">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center hover:bg-rose-50 transition shadow-sm"
            >
              {uploadingAvatar
                ? <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-rose-500" />
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-medium text-rose-700">{profile?.name}</p>
            <p className="text-sm text-rose-400/60">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-500 text-xs">Sender</span>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-rose-600 mb-1.5 block">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/20 outline-none text-rose-700 placeholder:text-rose-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-rose-600 mb-1.5 block">Email</label>
            <input
              value={profile?.email || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl bg-white/30 border border-rose-200/30 text-rose-400 cursor-not-allowed"
            />
            <p className="text-xs text-rose-300/60 mt-1">Email cannot be changed</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || !name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {savingProfile
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── 2. Password ─────────────────────────────────────────────────── */}
      <Section title="Change Password" subtitle="Keep your account secure" icon={Lock}>
        <div className="space-y-3">
          {/* Old password (informational – Supabase doesn't require it via updateUser) */}
          <div>
            <label className="text-sm font-medium text-rose-600 mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/20 outline-none text-rose-700 placeholder:text-rose-300"
              />
              <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3.5 text-rose-300 hover:text-rose-500">
                {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-rose-600 mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/20 outline-none text-rose-700 placeholder:text-rose-300"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3.5 text-rose-300 hover:text-rose-500">
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-rose-600 mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className={`w-full px-4 py-3 rounded-xl bg-white/60 border focus:ring-2 outline-none text-rose-700 placeholder:text-rose-300 transition ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-rose-200/50 focus:border-rose-400 focus:ring-rose-300/20'
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {savingPassword
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Lock className="w-4 h-4" />
            }
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* ── 3. Notification Preferences ─────────────────────────────────── */}
      <Section title="Notification Preferences" subtitle="Choose what alerts you receive" icon={Bell}>
        <div className="space-y-4">
          {[
            { label: 'When your letter is opened', desc: 'Get notified when your pookie opens the link', value: notifOpened, set: setNotifOpened },
            { label: 'When she responds', desc: 'Get notified when she replies YES / MAYBE / NO', value: notifResponse, set: setNotifResponse },
            { label: 'New messages', desc: 'Get notified when you receive a new message', value: notifMessage, set: setNotifMessage },
          ].map(({ label, desc, value, set }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-rose-700">{label}</p>
                <p className="text-xs text-rose-400/60">{desc}</p>
              </div>
              <Toggle on={value} onToggle={() => set(!value)} />
            </div>
          ))}
          <p className="text-xs text-rose-300/60 pt-1">Preferences are saved locally on this device.</p>
        </div>
      </Section>

      {/* ── 4. Danger Zone ──────────────────────────────────────────────── */}
      <Section title="Danger Zone" subtitle="Irreversible account actions" icon={Shield}>
        <div className="border border-red-200 rounded-xl p-4 bg-red-50/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-red-400/80 mt-0.5">
                Permanently deletes your account and all experiences. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </Section>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <AnimatePresence>
        {deleteOpen && (
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-800">Delete Account</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete all your experiences, messages, and data.
                Type <strong className="text-red-500">{profile?.name}</strong> to confirm.
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={`Type "${profile?.name}" to confirm`}
                className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirm !== profile?.name}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                  {deleting ? 'Deleting…' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
