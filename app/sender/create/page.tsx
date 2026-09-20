'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Check, Plus, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { SenderThemeSelector } from '@/components/experience/sender-theme-selector';
import { PRESET_DATE_IDEAS, DATE_CATEGORIES, DEFAULT_DATE_KEYS, formatCustomDateIdea } from '@/lib/date-ideas';

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
    theme: 'light' as ExperienceTheme,
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

  const [customDateInput, setCustomDateInput] = useState('');
  const [dateCategory, setDateCategory] = useState<'all' | 'romantic' | 'food' | 'cozy' | 'outdoor' | 'fun'>('all');

  const toggleDateOption = (opt: string) => {
    update('date_options', form.date_options.includes(opt)
      ? form.date_options.filter((o) => o !== opt)
      : [...form.date_options, opt]
    );
  };

  const handleAddCustomDate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDateInput.trim();
    if (!trimmed) return;
    if (!form.date_options.includes(trimmed)) {
      update('date_options', [...form.date_options, trimmed]);
      toast({ title: 'Date idea added! ✨', description: `"${trimmed}" is now an option.` });
    }
    setCustomDateInput('');
  };

  const removeCustomDate = (opt: string) => {
    update('date_options', form.date_options.filter((o) => o !== opt));
  };

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
              <p className=" font-body text-sm text-rose-400/60">Write what you should have said properly. Be sincere, not dramatic.</p>
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
              <p className="font-body text-sm text-rose-400/60">The main letter she'll read. Tell her how you feel.</p>
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
              <p className="font-body text-sm text-rose-400/60">One last thing... The letter before you ask her out.</p>
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
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-xl font-semibold text-rose-700">Choose a Theme for Receiver</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                    Active: {THEME_CONFIG[form.theme].name}
                  </span>
                </div>
                <p className="text-xs text-rose-400/80 mb-4">
                  Select Light or Dark mode. This design will be automatically applied when your receiver opens the letter.
                </p>
                <SenderThemeSelector
                  value={form.theme}
                  onChange={(t) => update('theme', t)}
                  receiverName={form.receiver_nickname || form.receiver_name}
                  senderName={form.sender_name}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display text-xl font-semibold text-rose-700">Date Options</h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">
                      {form.date_options.length} chosen
                    </span>
                  </div>
                  <p className="text-sm text-rose-400/70 mb-3">
                    Select the romantic activities you want to offer her, or add your own custom dates!
                  </p>

                  {/* Category filter pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                    <button
                      type="button"
                      onClick={() => setDateCategory('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                        dateCategory === 'all'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-white/80 text-rose-600 hover:bg-white border border-rose-100'
                      }`}
                    >
                      🌟 All Ideas
                    </button>
                    {Object.entries(DATE_CATEGORIES).map(([catKey, cat]) => (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setDateCategory(catKey as any)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                          dateCategory === catKey
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white/80 text-rose-600 hover:bg-white border border-rose-100'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Preset Options Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PRESET_DATE_IDEAS.filter((p) => dateCategory === 'all' || p.category === dateCategory).map((opt) => {
                      const isSelected = form.date_options.includes(opt.key);
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          onClick={() => toggleDateOption(opt.key)}
                          className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-sm scale-[1.02]'
                              : 'bg-white/70 text-rose-700 hover:bg-white border-rose-200/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{opt.emoji}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <span className="font-semibold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Ideas Section */}
                <div className="pt-2 border-t border-rose-100/60">
                  <label className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-2">
                    Add Your Own Custom Date Idea ✨
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={customDateInput}
                      onChange={(e) => setCustomDateInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomDate();
                        }
                      }}
                      placeholder="e.g. Midnight cookie baking 🍪, Watching rain together 🌧️"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/80 border border-rose-200/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none text-rose-700 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomDate()}
                      disabled={!customDateInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white text-xs font-semibold hover:shadow-md transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Display Any Custom Dates Added */}
                  {(() => {
                    const customAdded = form.date_options.filter(
                      (opt) => !PRESET_DATE_IDEAS.some((p) => p.key === opt)
                    );
                    if (customAdded.length === 0) return null;
                    return (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customAdded.map((cOpt) => {
                          const info = formatCustomDateIdea(cOpt);
                          return (
                            <span
                              key={cOpt}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-medium"
                            >
                              <span>{info.emoji}</span>
                              <span>{info.label}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomDate(cOpt)}
                                className="p-0.5 hover:bg-rose-200 rounded-full text-rose-500 transition"
                                aria-label={`Remove ${info.label}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}
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
