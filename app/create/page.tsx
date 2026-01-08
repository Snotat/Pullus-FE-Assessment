'use client';

import { useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  CloudCheck,
  CloudUpload,
  CloudOff,
  Sparkles,
} from 'lucide-react';

import { saveNoteLocally, type Note } from '../utils/DB';
import { useNetworkState } from '@react-hookz/web';
import { toast } from 'react-toastify';

const subscribe = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

export default function CreateNotePage() {
  const router = useRouter();
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const fixedId = useMemo(() => crypto.randomUUID(), []);

  const [note, setNote] = useState<Note>({
    id: fixedId,
    title: '',
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sync_status: 'pending',
  });

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);

  useEffect(() => {
    if (!dirty || (!note.title.trim() && !note.content.trim())) return;

    const timeout = setTimeout(async () => {
      setSaving(true);

      const updatedNote: Note = {
        ...note,
        updatedAt: new Date().toISOString(),
        sync_status: 'pending',
      };

      try {
        await saveNoteLocally(updatedNote);
        setNote(updatedNote);
        setHasSavedOnce(true);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setSaving(false);
        setDirty(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [dirty, note]);
const handleSaveAndClose = async () => {
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
    console.error("Final save failed:", error);
    setSaving(false);
  }
};
  const showSyncedStatus = hasSavedOnce && note.sync_status === 'synced';
 const {
  online,
  since,
  downlink,
} = useNetworkState();
useEffect(() => {
  if (!online) {
    toast.error('You are offline. Changes saved locally.', {
      toastId: 'offline',
      autoClose: false,
    });
  } else {
    toast.dismiss('offline');
    toast.success('Back online! Syncing changes...');
  }
}, [online]);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            {dirty ? 'Discard Changes' : 'Back'}
          </button>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-tighter transition-all ${
              saving 
                ? 'bg-slate-100 text-slate-400' 
                : showSyncedStatus
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-amber-50 text-amber-600'
            }`}>
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : showSyncedStatus ? (
                <CloudCheck size={14} />
              ) : (
                <CloudUpload size={14} />
              )}
              {saving ? 'Saving...' : showSyncedStatus ? 'Synced' : 'Local Draft'}
            </div>
            {!isOnline && <CloudOff size={16} className="text-red-500" />}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <Sparkles size={10} /> Note Title
            </label>
            <input
              autoFocus
              value={note.title}
              onChange={e => {
                setNote(prev => ({ ...prev, title: e.target.value }));
                setDirty(true);
              }}
              placeholder="Title of this note..."
              className="w-full bg-slate-50 rounded-sm px-6 py-4 text-2xl font-black placeholder:text-slate-200 focus:bg-white focus:ring-4 focus:ring-green-50 border-none transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content</label>
            <textarea
              value={note.content}
              onChange={e => {
                setNote(prev => ({ ...prev, content: e.target.value }));
                setDirty(true);
              }}
              placeholder="Start typing..."
              rows={5}
              className="w-full bg-slate-50 rounded-sm px-6 py-4 text-lg leading-relaxed placeholder:text-slate-200 focus:bg-white focus:ring-4 focus:ring-green-50 border-none transition-all outline-none resize-none"
            />
          </div>
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