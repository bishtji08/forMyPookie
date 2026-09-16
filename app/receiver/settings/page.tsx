'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Save,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Shield,
  Bell,
  Heart,
  Mail,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-rose-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-rose-700 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-rose-400/60">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-rose-600 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-rose-400/50">{hint}</p>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700 placeholder:text-rose-300/60 disabled:opacity-50 transition ${props.className ?? ''}`}
    />
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-gradient-to-r from-rose-400 to-lavender-400' : 'bg-rose-200/50'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ── Privacy row ───────────────────────────────────────────────────────────────
function PrivacyRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-rose-100/40 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-rose-700">{label}</p>
        <p className="text-xs text-rose-400/60 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReceiverSettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName] = useState(profile?.name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.profile_image ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Privacy state
  const [privacy, setPrivacy] = useState({
    allowMessages: true,
    showOnlineStatus: true,
    readReceipts: true,
    emailNotifications: false,
    pushNotifications: true,
  });

  // Sync profile when auth loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setAvatarUrl(profile.profile_image ?? null);
    }
  }, [profile]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!profile) return;
    if (!name.trim()) {
      toast({ title: 'Name cannot be empty', variant: 'destructive' });
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (error) {
      toast({ title: 'Failed to save profile', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Profile updated! 💕' });
    }
    setSavingProfile(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be smaller than 5 MB', variant: 'destructive' });
      return;
    }

    setUploadingPhoto(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploadingPhoto(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (updateError) {
      toast({ title: 'Failed to save photo', variant: 'destructive' });
    } else {
      setAvatarUrl(publicUrl + `?t=${Date.now()}`);
      await refreshProfile();
      toast({ title: 'Profile photo updated! 📸' });
    }
    setUploadingPhoto(false);
  };

  const passwordStrength = useCallback((pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-amber-400' },
      { label: 'Good', color: 'bg-yellow-400' },
      { label: 'Strong', color: 'bg-emerald-400' },
    ];
    return { score, ...levels[Math.max(0, score - 1)] };
  }, []);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Please fill in all password fields', variant: 'destructive' });
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
      toast({ title: 'Failed to change password', description: error.message, variant: 'destructive' });
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password changed successfully! 🔐' });
    }
    setSavingPassword(false);
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const strength = passwordStrength(newPassword);
  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 pb-16">
      {/* Page heading */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-rose-700 mb-0.5">Settings</h1>
        <p className="text-rose-400/60 text-sm">Manage your profile and preferences</p>
      </motion.div>

      {/* ── Profile Section ──────────────────────────────────────────────── */}
      <Section title="Profile" subtitle="How others see you" icon={User}>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-lavender-400 flex items-center justify-center text-white text-xl font-bold ring-4 ring-rose-100">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-rose-700">{profile?.name}</p>
            <p className="text-sm text-rose-400/60">Receiver Account</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-rose-500 hover:text-rose-600 mt-1 underline underline-offset-2"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Display Name" hint="This name is visible to your sender.">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={(e) => e.key === 'Enter' && handleProfileSave()}
            />
          </Field>

          <Field label="Email Address" hint="Your email cannot be changed here.">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
              <Input
                value={profile?.email ?? ''}
                readOnly
                disabled
                className="pl-10 cursor-not-allowed"
              />
            </div>
          </Field>

          <button
            onClick={handleProfileSave}
            disabled={savingProfile || !name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {savingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── Password Section ─────────────────────────────────────────────── */}
      <Section title="Change Password" subtitle="Keep your account secure" icon={Lock}>
        <div className="space-y-4">
          <Field label="New Password">
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            <AnimatePresence>
              {strength && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          strength.score >= i ? strength.color : 'bg-rose-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-rose-400/60">
                    Strength: <span className="font-medium text-rose-600">{strength.label}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Field>

          <Field label="Confirm New Password">
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Match indicator */}
            <AnimatePresence>
              {confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    newPassword === confirmPassword ? 'text-emerald-500' : 'text-rose-400'
                  }`}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords don&apos;t match
                    </>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </Field>

          <button
            onClick={handlePasswordChange}
            disabled={
              savingPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {savingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* ── Privacy Section ──────────────────────────────────────────────── */}
      <Section title="Privacy" subtitle="Control what others can see" icon={Shield}>
        <div className="divide-y divide-rose-100/40">
          <PrivacyRow
            label="Allow Messages"
            description="Let your sender send you messages"
            checked={privacy.allowMessages}
            onChange={() => togglePrivacy('allowMessages')}
          />
          <PrivacyRow
            label="Show Online Status"
            description="Display when you&apos;re active"
            checked={privacy.showOnlineStatus}
            onChange={() => togglePrivacy('showOnlineStatus')}
          />
          <PrivacyRow
            label="Read Receipts"
            description="Let your sender know when you&apos;ve read messages"
            checked={privacy.readReceipts}
            onChange={() => togglePrivacy('readReceipts')}
          />
        </div>
      </Section>

      {/* ── Notifications Section ────────────────────────────────────────── */}
      <Section title="Notifications" subtitle="Choose how you are notified" icon={Bell}>
        <div className="divide-y divide-rose-100/40">
          <PrivacyRow
            label="Email Notifications"
            description="Receive updates in your inbox"
            checked={privacy.emailNotifications}
            onChange={() => togglePrivacy('emailNotifications')}
          />
          <PrivacyRow
            label="Push Notifications"
            description="Get real-time alerts in the app"
            checked={privacy.pushNotifications}
            onChange={() => togglePrivacy('pushNotifications')}
          />
        </div>
        <p className="text-xs text-rose-300/50 mt-4 flex items-center gap-1">
          <Heart className="w-3 h-3" />
          Notification preferences are saved locally for now.
        </p>
      </Section>

      {/* ── Account info ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-rose-700">Account Status</p>
            <p className="text-xs text-rose-400/60">
              {profile?.status === 'active' ? '✅ Active & in good standing' : profile?.status ?? '—'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-rose-300" />
      </motion.div>
    </div>
  );
}
