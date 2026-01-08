'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CloudCheck,
  CloudUpload,
  CloudOff,
  AlertCircle,
} from 'lucide-react';

import {
  getNoteById,
  saveNoteLocally,
  type Note,
} from '../../utils/DB';

const subscribe = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  const [note, setNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadNote = async () => {
      if (!id) return;
      const storedNote = await getNoteById(id);
      if (isMounted) {
        if (storedNote) setNote(storedNote);
        else router.push('/');
        setLoading(false);
      }
    };
    loadNote();
    return () => { isMounted = false; };
  }, [id, router]);

  useEffect(() => {
    if (!dirty || !note) return;

    const timeout = setTimeout(async () => {
      setSaving(true);
      const updatedNote: Note = {
        ...note,
        updatedAt: new Date().toISOString(),
        sync_status: 'pending', 
      };

      await saveNoteLocally(updatedNote);
      setSaving(false);
      setDirty(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [dirty, note]);

  const handleSaveAndClose = async () => {
    if (!note) return;
    
    setSaving(true);
    const finalNote: Note = {
      ...note,
      updatedAt: new Date().toISOString(),
      sync_status: 'pending',
    };

    try {
      await saveNoteLocally(finalNote, true);
      router.push('/');
    } catch (error) {
      console.error("Failed to save and close:", error);
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center text-slate-500">
      <Loader2 className="animate-spin mb-2 text-[#80c341]" />
      <p className="text-sm font-medium">Opening editor...</p>
    </div>
  );

  if (!note) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            All Notes
          </Link>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-tighter transition-all ${
              saving || dirty ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CloudCheck size={14} />}
              {saving ? 'Saving...' : dirty ? 'Unsaved Changes' : 'Synced'}
            </div>
            {!isOnline && <CloudOff size={16} className="text-red-500" />}
          </div>
        </div>

        <div className="space-y-6">
          <input
            value={note.title}
            onChange={e => { setNote(prev => prev ? { ...prev, title: e.target.value } : null); setDirty(true); }}
            placeholder="Title..."
            className="w-full bg-slate-50 rounded-sm px-6 py-4 text-2xl font-black focus:bg-white focus:ring-4 focus:ring-green-50 border-none outline-none transition-all"
          />
          <textarea
            value={note.content}
            onChange={e => { setNote(prev => prev ? { ...prev, content: e.target.value } : null); setDirty(true); }}
            placeholder="What's on your mind?"
            rows={5}
            className="w-full bg-slate-50 rounded-sm px-6 py-4 text-lg leading-relaxed focus:bg-white focus:ring-4 focus:ring-green-50 border-none outline-none resize-none transition-all"
          />
        </div>

        <button
          onClick={handleSaveAndClose}
          disabled={saving}
          className="mt-8 w-full rounded-sm bg-[#80c341] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Syncing...' : 'Save & Finish'}
        </button>
      </div>
    </div>
  );
}