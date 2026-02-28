'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase-client';

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    let avatarUrl = profile?.avatar_url ?? null;

    // Upload avatar if changed
    if (avatarFile) {
      const filePath = `${user.id}/avatar.${avatarFile.name.split('.').pop()}`;
      await supabase.storage.from('yoi-avatars').upload(filePath, avatarFile, {
        upsert: true,
      });
      const {
        data: { publicUrl },
      } = supabase.storage.from('yoi-avatars').getPublicUrl(filePath);
      avatarUrl = publicUrl;
    }

    await (supabase
      .from('yoi_users') as any)
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile?.avatar_url;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <h1 className="font-display text-2xl gold-text mb-8 text-center">
          Your Profile
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div {...getRootProps()} className="relative cursor-pointer group">
            <input {...getInputProps()} />
            {displayAvatar ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sacred-gold/20 blur-xl scale-150" />
                <img
                  src={displayAvatar}
                  alt=""
                  className="relative w-28 h-28 rounded-full avatar-glow object-cover border-2 border-sacred-gold/30"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-sacred-indigo border-2 border-sacred-gold/30 flex items-center justify-center avatar-glow">
                <span className="text-3xl font-display text-sacred-gold">
                  {fullName?.[0] ?? '?'}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sacred-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-sacred-black" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-sacred"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="input-sacred opacity-50 cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-sacred w-full mt-6"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
