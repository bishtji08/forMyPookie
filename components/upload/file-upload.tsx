'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, FileImage, FileVideo, FileAudio } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  experienceId: string;
  onUpload: (url: string, path: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
  type?: 'image' | 'video' | 'audio';
  className?: string;
}

export function FileUpload({
  experienceId,
  onUpload,
  accept = 'image/*',
  label = 'Upload Image',
  currentUrl,
  type = 'image',
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
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `experiences/${experienceId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onUpload(urlData.publicUrl, filePath);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [experienceId, onUpload]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large (max 50MB)');
      return;
    }
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const Icon = type === 'video' ? FileVideo : type === 'audio' ? FileAudio : FileImage;

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
        <div className="relative group">
          {type === 'image' && (
            <img src={currentUrl} alt="Uploaded" className="w-full h-32 object-cover rounded-xl" />
          )}
          {type === 'video' && (
            <video src={currentUrl} className="w-full h-32 object-cover rounded-xl" controls />
          )}
          {type === 'audio' && (
            <div className="w-full h-20 rounded-xl bg-rose-50 flex items-center justify-center">
              <FileAudio className="w-8 h-8 text-rose-300 mr-2" />
              <audio src={currentUrl} controls className="max-w-full" />
            </div>
          )}
          <button
            onClick={() => onUpload('', '')}
            className="absolute top-1 right-1 p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-3 h-3" />
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
              <span className="text-sm text-rose-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2">
              <Icon className="w-6 h-6 text-rose-300" />
              <span className="text-sm text-rose-400/60">{label}</span>
              <span className="text-xs text-rose-300/40">Click or drag & drop</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
