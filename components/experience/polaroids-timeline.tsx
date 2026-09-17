'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, Film, X, Play } from 'lucide-react';
import type { Memory } from '@/lib/types';
import { isVideoUrl } from '@/lib/utils';
import { playPop } from '@/lib/audio-effects';

interface PolaroidsTimelineProps {
  memories: Memory[];
  accentColor?: string;
  subColor?: string;
}

const DEFAULT_DEMO_POLAROIDS = [
  { id: 'd1', title: 'untitled', caption: 'our first coffee date', media_url: '', date: 'day one' },
  { id: 'd2', title: 'untitled', caption: 'the random road trip', media_url: '', date: 'summer' },
  { id: 'd3', title: 'untitled', caption: 'when you made me laugh till I cried', media_url: '', date: 'always' },
];

export function PolaroidsTimeline({
  memories = [],
  accentColor = '#e85d8d',
  subColor = 'text-rose-400/70',
}: PolaroidsTimelineProps) {
  const [activePhoto, setActivePhoto] = useState<Memory | typeof DEFAULT_DEMO_POLAROIDS[0] | null>(null);
  const [stamps, setStamps] = useState<Record<string, number>>({});

  // Use sender memories if provided, or fallback to the 3 aesthetic polaroids
  const displayItems = memories.length > 0 ? memories : DEFAULT_DEMO_POLAROIDS;

  const handleAddStamp = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStamps((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    playPop();
  };

  const rotations = [-2.5, 0.8, 2.2, -1.5, 1.8, -2.0];

  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4">
      {/* Title & Subtitle matching Image 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3d2730] mb-2">
          Us, in Polaroids
        </h2>
        <p className="font-handwritten text-xl sm:text-2xl text-rose-500/80 italic mb-10">
          our timeline — fill it with the real ones ✨
        </p>
      </motion.div>

      {/* Polaroids Row/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-6 max-w-4xl mx-auto items-start justify-center">
        {displayItems.map((item, idx) => {
          const rotation = rotations[idx % rotations.length];
          const hasMedia = !!item.media_url;
          const isVideo = hasMedia && ('media_type' in item && item.media_type === 'video' || isVideoUrl(item.media_url));
          const heartCount = stamps[item.id] || 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, rotate: rotation }}
              whileInView={{ opacity: 1, y: 0, rotate: rotation }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.6 }}
              whileHover={{ rotate: 0, scale: 1.04, y: -8, zIndex: 30 }}
              className="relative mx-auto w-full max-w-[280px] bg-[#fefcf8] p-3.5 pb-5 rounded-md shadow-xl shadow-rose-900/10 border border-[#eee5d8]/80 cursor-pointer group select-none transition-shadow hover:shadow-2xl"
              onClick={() => setActivePhoto(item)}
              onDoubleClick={() => handleAddStamp(item.id)}
            >
              {/* Authentic Lavender/Rose Washi Tape at Top */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-lavender-200/75 backdrop-blur-xs border-y border-white/40 shadow-xs rotate-[-1deg] pointer-events-none rounded-[1px] z-10" />

              {/* Photo Area */}
              <div className="relative w-full aspect-square bg-[#f3eef8] rounded-xs overflow-hidden flex items-center justify-center border border-purple-100/40">
                {hasMedia ? (
                  isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.media_url || undefined}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 text-rose-500 fill-rose-500 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Film className="w-3 h-3 text-rose-300" />
                        <span>Snap</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.media_url || undefined}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )
                ) : (
                  /* Placeholder styled exactly like Image 2 */
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 border border-dashed border-purple-300/60 rounded-xs bg-[#f4edfb]/70 text-purple-400/80">
                    <span className="font-handwritten text-lg sm:text-xl flex items-center gap-1.5">
                      your photo here <Camera className="w-4 h-4 inline-block opacity-80" />
                    </span>
                  </div>
                )}

                {/* Stamped floating hearts */}
                <AnimatePresence>
                  {heartCount > 0 && (
                    <motion.div
                      key={heartCount}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute bottom-2 right-2 bg-rose-500/90 text-white rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1 shadow-md"
                    >
                      <Heart className="w-3 h-3 fill-white" />
                      <span>{heartCount}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Chin: Handwritten Title & Caption */}
              <div className="pt-3 px-1 text-left flex items-center justify-between">
                <div>
                  <p className="font-handwritten text-xl text-[#3d2730] leading-none mb-0.5">
                    {item.title || 'untitled'}
                  </p>
                  {'caption' in item && item.caption && (
                    <p className="font-handwritten text-sm text-rose-400/90 truncate max-w-[180px]">
                      {item.caption}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddStamp(item.id, e)}
                  title="Double-tap or click to heart"
                  className="p-1 rounded-full text-rose-300 hover:text-rose-500 hover:scale-125 transition-transform"
                >
                  <Heart className={`w-4 h-4 ${heartCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="font-handwritten text-base sm:text-lg text-rose-400/70 mt-6 italic">
        (tip: double tap any polaroid to leave a heart ❤️)
      </p>

      {/* High-res Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActivePhoto(null)}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-rose-300 p-2 rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#fefcf8] p-4 pb-6 rounded-xl shadow-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-square bg-purple-50 rounded-lg overflow-hidden flex items-center justify-center">
                {activePhoto.media_url ? (
                  ('media_type' in activePhoto && activePhoto.media_type === 'video') || isVideoUrl(activePhoto.media_url) ? (
                    <video
                      src={activePhoto.media_url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={activePhoto.media_url}
                      alt={activePhoto.title}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-6 text-purple-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-handwritten text-2xl">A photo frozen in time.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-handwritten text-3xl text-rose-700">{activePhoto.title}</h3>
                {'caption' in activePhoto && activePhoto.caption && (
                  <p className="font-serif italic text-rose-500 mt-1 text-lg">{activePhoto.caption}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
