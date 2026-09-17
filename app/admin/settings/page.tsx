'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile!.id);
    if (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Settings saved!' });
    }
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-rose-700 mb-1">Admin Settings</h1>
      <p className="text-rose-400/70 text-xs sm:text-sm mb-6">Manage your admin profile</p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-lavender-400 flex items-center justify-center text-white">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="font-medium text-rose-700">{profile?.email}</p>
            <p className="text-sm text-rose-400/60">Administrator</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-rose-600 mb-1.5 block">Display Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="font-display text-lg font-semibold text-rose-700 mb-3">Privacy & Moderation</h2>
        <p className="text-sm text-rose-400/60 leading-relaxed">
          As an admin, you have access to platform-wide data for moderation purposes. Private conversations between
          senders and receivers are accessible only for legitimate moderation needs. All admin actions are logged
          and should follow the platform's privacy guidelines.
        </p>
      </div>
    </div>
  );
}
