'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';

const themes = Object.entries(THEME_CONFIG) as [ExperienceTheme, typeof THEME_CONFIG[ExperienceTheme]][];

export default function CreateExperiencePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    receiver_name: '',
    receiver_nickname: '',
    sender_name: profile?.name || '',
    relationship: '',
    apology_message: '',
    love_letter: '',
    final_letter: '',
    theme: 'pink-dream' as ExperienceTheme,
    music_url: '',
    date_options: ['coffee', 'dinner', 'movie', 'walk', 'drive', 'surprise'],
  });

  const steps = ['Receiver', 'Apology', 'Love Letter', 'Final Letter', 'Theme', 'Review'];

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    setLoading(true);
    try {
      const currentUserId = profile?.id || user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (!currentUserId) {
        throw new Error('You must be logged in to create an experience.');
      }

      const { data, error } = await supabase
        .from('experiences')
        .insert({
          sender_id: currentUserId,
          ...form,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Experience created! ❤️', description: 'Now add your memories and photos.' });
      router.push(`/sender/experiences/${data.id}`);
    } catch (err: any) {
      toast({ title: 'Failed to create', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleDateOption = (opt: string) => {
    update('date_options', form.date_options.includes(opt)
      ? form.date_options.filter((o) => o !== opt)
      : [...form.date_options, opt]
    );
  };

  const dateOptions = [
    { key: 'coffee', label: 'Coffee ☕' },
    { key: 'dinner', label: 'Dinner 🍝' },
    { key: 'movie', label: 'Movie 🎬' },
    { key: 'walk', label: 'Walk 🌙' },
    { key: 'drive', label: 'Long Drive 🚗' },
    { key: 'surprise', label: 'Surprise me 👀' },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 w-full">
        <h1 className="font-display text-2xl font-bold text-rose-700 mb-2">Create a Love Letter</h1>
        <p className="text-rose-400/60 text-sm mb-6">Build a personalized romantic experience for your pookie.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i <= step ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white' : 'bg-rose-100 text-rose-300'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded ${i < step ? 'bg-rose-400' : 'bg-rose-100'}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-4 sm:p-6 md:p-8"
        >
          {/* Step 0: Receiver */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Who is this for?</h2>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Her Name</label>
                <input
                  value={form.receiver_name}
                  onChange={(e) => update('receiver_name', e.target.value)}
                  placeholder="[HER NAME]"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Nickname / Pookie Name</label>
                <input
                  value={form.receiver_nickname}
                  onChange={(e) => update('receiver_nickname', e.target.value)}
                  placeholder="[POOKIE NICKNAME]"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Your Name</label>
                <input
                  value={form.sender_name}
                  onChange={(e) => update('sender_name', e.target.value)}
                  placeholder="[SENDER NAME]"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Relationship</label>
                <input
                  value={form.relationship}
                  onChange={(e) => update('relationship', e.target.value)}
                  placeholder="e.g. Girlfriend, Fiancée, Wife..."
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700"
                />
              </div>
            </div>
          )}

          {/* Step 1: Apology */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Your Apology</h2>
              <p className="text-sm text-rose-400/60">Write what you should have said properly. Be sincere, not dramatic.</p>
              <textarea
                value={form.apology_message}
                onChange={(e) => update('apology_message', e.target.value)}
                placeholder="I'm sorry. Not the casual 'sorry yaar' kind. The real one..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 resize-none font-serif-body text-lg leading-relaxed"
              />
            </div>
          )}

          {/* Step 2: Love Letter */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Love Letter</h2>
              <p className="text-sm text-rose-400/60">The main letter she'll read. Tell her how you feel.</p>
              <textarea
                value={form.love_letter}
                onChange={(e) => update('love_letter', e.target.value)}
                placeholder="Things I should have said properly..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 resize-none font-serif-body text-lg leading-relaxed"
              />
            </div>
          )}

          {/* Step 3: Final Letter */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Final Love Letter</h2>
              <p className="text-sm text-rose-400/60">One last thing... The letter before you ask her out.</p>
              <textarea
                value={form.final_letter}
                onChange={(e) => update('final_letter', e.target.value)}
                placeholder="One last thing... I want you to know that..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 resize-none font-serif-body text-lg leading-relaxed"
              />
            </div>
          )}

          {/* Step 4: Theme & Date Options */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-rose-700 mb-2">Choose a Theme</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themes.map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => update('theme', key)}
                      className={`rounded-xl p-4 text-left border-2 transition-all ${
                        form.theme === key ? 'border-rose-400 ring-2 ring-rose-300/30' : 'border-rose-100 hover:border-rose-200'
                      }`}
                    >
                      <div className={`h-16 rounded-lg bg-gradient-to-br ${config.gradient} mb-2`} />
                      <p className="text-sm font-medium text-rose-700">{config.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-rose-700 mb-2">Date Options</h2>
                <p className="text-sm text-rose-400/60 mb-3">Select what you'd like to offer her.</p>
                <div className="flex flex-wrap gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => toggleDateOption(opt.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.date_options.includes(opt.key)
                          ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white'
                          : 'bg-white/60 text-rose-400/60 border border-rose-200/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Music URL (optional)</label>
                <input
                  value={form.music_url}
                  onChange={(e) => update('music_url', e.target.value)}
                  placeholder="https://... (audio file URL)"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-rose-700">Review & Create</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">For</span>
                  <span className="text-rose-700 font-medium">{form.receiver_name || '[Her Name]'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">Nickname</span>
                  <span className="text-rose-700 font-medium">{form.receiver_nickname || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">From</span>
                  <span className="text-rose-700 font-medium">{form.sender_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">Theme</span>
                  <span className="text-rose-700 font-medium">{THEME_CONFIG[form.theme].name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">Apology</span>
                  <span className="text-rose-700 font-medium">{form.apology_message ? `${form.apology_message.length} chars` : 'Not written'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">Love Letter</span>
                  <span className="text-rose-700 font-medium">{form.love_letter ? `${form.love_letter.length} chars` : 'Not written'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-rose-100">
                  <span className="text-rose-400/60">Final Letter</span>
                  <span className="text-rose-700 font-medium">{form.final_letter ? `${form.final_letter.length} chars` : 'Not written'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-rose-400/60">Date Options</span>
                  <span className="text-rose-700 font-medium">{form.date_options.length} selected</span>
                </div>
              </div>
              <p className="text-sm text-rose-400/60 mt-4">
                You can add memories, funny moments, and love reasons after creating. You can edit everything later.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Heart className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Experience'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
