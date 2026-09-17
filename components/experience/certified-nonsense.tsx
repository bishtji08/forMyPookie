'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles, ChevronDown } from 'lucide-react';
import type { FunnyMoment } from '@/lib/types';
import { isVideoUrl } from '@/lib/utils';
import { playPop } from '@/lib/audio-effects';

interface CertifiedNonsenseProps {
  funnyMoments: FunnyMoment[];
  accentColor?: string;
  subColor?: string;
}

interface JokeItem {
  id: string;
  emoji: string;
  title: string;
  description: string;
  image_url?: string | null;
}

const DEFAULT_JOKES: JokeItem[] = [
  { id: '1', emoji: '😭', title: 'The Autocorrect Disaster', description: 'When a harmless message turned into the most unhinged autocorrect accident in human history.' },
  { id: '2', emoji: '💀', title: 'The Competitive Argument', description: 'Arguing fiercely over something we both forgot within 3 minutes.' },
  { id: '3', emoji: '🫠', title: 'The Midnight Snack Heist', description: 'Stealing the exact snack you explicitly claimed you did not want 5 minutes earlier.' },
  { id: '4', emoji: '🤌', title: 'The Dramatic Performance', description: 'Making an absolute dramatic scene over the tiniest minor inconvenience.' },
];

export function CertifiedNonsense({
  funnyMoments = [],
  accentColor = '#e85d8d',
  subColor = 'text-rose-400/70',
}: CertifiedNonsenseProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, { laughs: number; skulls: number }>>({});
  const [floatingParticles, setFloatingParticles] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  const emojis = ['😭', '💀', '🫠', '🤌', '🤡', '🍕', '👀'];

  const items: JokeItem[] = funnyMoments.length > 0
    ? funnyMoments.map((m, idx) => ({
        id: m.id,
        emoji: emojis[idx % emojis.length],
        title: m.title,
        description: m.description,
        image_url: m.image_url,
      }))
    : DEFAULT_JOKES;

  const handleToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
    playPop();
  };

  const handleReact = (id: string, type: 'laughs' | 'skulls', e: React.MouseEvent) => {
    e.stopPropagation();
    setReactions((prev) => ({
      ...prev,
      [id]: {
        laughs: (prev[id]?.laughs || 0) + (type === 'laughs' ? 1 : 0),
        skulls: (prev[id]?.skulls || 0) + (type === 'skulls' ? 1 : 0),
      },
    }));

    const newParticle = {
      id: Date.now(),
      emoji: type === 'laughs' ? '😂' : '💀',
      x: e.clientX,
    };
    setFloatingParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);

    playPop();
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4 relative">
      {/* Floating Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: '70vh', x: p.x - 20, scale: 0.8 }}
            animate={{ opacity: 0, y: '20vh', scale: 1.6 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute text-3xl select-none"
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* Title & Subtitle matching Image 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3d2730] mb-2">
          Certified Nonsense
        </h2>
        <p className="font-handwritten text-xl sm:text-2xl text-rose-500/80 italic mb-10">
          our inside jokes — add the ones only we get 🤪
        </p>
      </motion.div>

      {/* 4 Cards Row/Grid matching Image 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {items.map((item, idx) => {
          const isOpen = activeId === item.id;
          const hasMedia = 'image_url' in item && !!item.image_url;
          const isVideo = hasMedia && isVideoUrl(item.image_url);
          const currentReactions = reactions[item.id] || { laughs: 0, skulls: 0 };

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              onClick={() => handleToggle(item.id)}
              className={`rounded-3xl p-5 md:p-6 transition-all duration-300 border cursor-pointer select-none ${
                isOpen
                  ? 'bg-white shadow-xl shadow-rose-200/40 border-rose-200 col-span-2 md:col-span-2'
                  : 'bg-white/75 hover:bg-white/95 shadow-sm hover:shadow-md border-white/80 hover:border-rose-100'
              } backdrop-blur-md flex flex-col items-center justify-center`}
            >
              {/* Giant 3D Emoji Avatar */}
              <motion.div
                animate={{
                  y: isOpen ? [0, -4, 0] : [0, -6, 0],
                  scale: isOpen ? 1.1 : 1,
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl sm:text-6xl mb-3 drop-shadow-sm select-none"
              >
                {item.emoji}
              </motion.div>

              {!isOpen && (
                <div className="flex items-center gap-1 text-xs text-rose-400 font-medium opacity-80 group-hover:opacity-100">
                  <span>tap to reveal</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              )}

              {/* Expanded Card Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full text-center mt-3 pt-3 border-t border-rose-100/70"
                  >
                    <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#3d2730] mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-rose-950/75 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {hasMedia && item.image_url && (
                      <div className="mb-4 rounded-xl overflow-hidden max-h-48 border border-rose-100">
                        {isVideo ? (
                          <video
                            src={item.image_url}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Reaction Buttons */}
                    <div className="flex items-center justify-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleReact(item.id, 'laughs', e)}
                        className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                      >
                        <span>😂 Relatable</span>
                        {currentReactions.laughs > 0 && (
                          <span className="bg-rose-200 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full">
                            {currentReactions.laughs}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleReact(item.id, 'skulls', e)}
                        className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-semibold flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                      >
                        <span>💀 Never forget</span>
                        {currentReactions.skulls > 0 && (
                          <span className="bg-purple-200 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full">
                            {currentReactions.skulls}
                          </span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
