'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CloudCheck,
  CloudUpload,
  Clock,
  CloudOff,
  Loader2,
} from 'lucide-react';

import { getNoteById, deleteNoteLocally, type Note } from '../../utils/DB';

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

export default function ViewNote() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchNote = async () => {
      if (!id) return;
      
      try {
        const data = await getNoteById(id);
        
        if (isMounted) {
          if (!data) {
            router.replace('/'); 
            return;
          }
          setNote(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchNote();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  const handleDelete = async () => {
    if (!note) return;
    if (confirm('Move this note to trash?')) {
      await deleteNoteLocally(note.id);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-[#80c341]" size={32} />
        <p className="font-medium animate-pulse">Loading note...</p>
      </div>
    );
  }

  if (!note) return null;

  return (
    <main className="mx-auto w-full px-4 py-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Notes
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/edit/${note.id}`}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <header className="mb-6">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {note.title || 'Untitled Note'}
          </h1>
        </header>

        <div className="mb-10 flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} className="text-slate-300" />
            <span>Updated {new Date(note.updatedAt).toLocaleString(undefined, { 
  month: 'short', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
            note.sync_status === 'synced' 
              ? 'border-emerald-100 text-emerald-600 bg-emerald-50' 
              : 'border-amber-100 text-amber-600 bg-amber-50'
          }`}>
            {note.sync_status === 'synced' ? <CloudCheck size={14} /> : <CloudUpload size={14} />}
            <span>{note.sync_status === 'synced' ? 'Cloud Synced' : 'Local Draft'}</span>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-1 text-red-500">
              <CloudOff size={14} />
              <span>Offline</span>
            </div>
          )}
        </div>

        <hr className="mb-10 border-slate-100" />

        <article className="pred pred-slate max-w-none">
          <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-medium selection:bg-green-100">
            {note.content || <span className="italic text-slate-300">No content provided...</span>}
          </div>
        </article>
      </div>
    </main>
  );
}