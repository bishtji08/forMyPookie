'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, FileImage, FileVideo, FileAudio, Film } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn, isVideoUrl } from '@/lib/utils';

interface FileUploadProps {
  experienceId: string;
  onUpload: (url: string, path: string, mediaType?: 'image' | 'video' | 'audio') => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
  type?: 'image' | 'video' | 'audio' | 'media';
  className?: string;
}

export function FileUpload({
  experienceId,
  onUpload,
  accept = 'image/*,video/*',
  label = 'Upload Photo or Video Snap',
  currentUrl,
  type = 'media',
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() || '';
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v|quicktime)$/i.test(file.name);
      const detectedType: 'image' | 'video' | 'audio' = file.type.startsWith('audio/')
        ? 'audio'
        : isVideo
        ? 'video'
        : 'image';

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `experiences/${experienceId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onUpload(urlData.publicUrl, filePath, detectedType);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [experienceId, onUpload]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const maxSize = 80 * 1024 * 1024; // 80MB max
    if (file.size > maxSize) {
      setError('File too large (max 80MB)');
      return;
    }
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const isVideo = type === 'video' || isVideoUrl(currentUrl);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden bg-rose-50/50 border border-rose-100">
          {isVideo ? (
            <div className="relative">
              <video
                src={currentUrl}
                className="w-full h-36 object-cover rounded-xl"
                controls
                playsInline
                preload="metadata"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 pointer-events-none">
                <Film className="w-3 h-3 text-rose-300" /> Video Snap
              </div>
            </div>
          ) : type === 'audio' ? (
            <div className="w-full h-20 rounded-xl bg-rose-50 flex items-center justify-center">
              <FileAudio className="w-8 h-8 text-rose-300 mr-2" />
              <audio src={currentUrl} controls className="max-w-full" />
            </div>
          ) : (
            <img src={currentUrl} alt="Uploaded" className="w-full h-36 object-cover rounded-xl" />
          )}
          <button
            type="button"
            onClick={() => onUpload('', '')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition shadow"
            title="Remove media"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'w-full rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all',
            dragOver ? 'border-rose-400 bg-rose-50' : 'border-rose-200/50 hover:border-rose-300 hover:bg-rose-50/30'
          )}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
              <span className="text-sm text-rose-400">Uploading snap...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2">
              <div className="flex items-center gap-1.5 text-rose-400">
                <FileImage className="w-5 h-5" />
                <span className="text-xs text-rose-300">/</span>
                <Film className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-rose-500/90">{label}</span>
              <span className="text-xs text-rose-300/60">Photo or short video (MP4, MOV, WebM)</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
