'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Database,
  HardDrive,
  CloudOff,
} from 'lucide-react';

const subscribe = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  saved: boolean;
};

const notedemo: Note = {
  id: '1',
  title: 'Notetaking web app',
  content: `
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
Best Notetaking app in the world. 
  `,
  createdAt: '2026-01-04',
  updatedAt: '2026-01-05',
  saved: true,
};

export default function EditNotePage() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  const [note, setNote] = useState(notedemo);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;

    const timeout = setTimeout(() => {
      setSaving(true);

      setTimeout(() => {
        setNote(prev => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          saved: isOnline,
        }));
        setSaving(false);
        setDirty(false);
      }, 800);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [dirty, isOnline]);

  return (
    <div className="w-full px-[3%]  py-6 bg-white text-gray-700">
        <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/`}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to note
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </>
          ) : dirty ? (
            <>
              <Save size={14} />
              Unsaved changes
            </>
          ) : note.saved ? (
            <>
              <Database size={14} className="text-emerald-500" />
              Saved
            </>
          ) : (
            <>
              <HardDrive size={14} className="text-amber-500" />
              Local only
              {!isOnline && <CloudOff size={14} className="ml-1" />}
            </>
          )}
        </div>
      </div>
      <section className="space-y-4">
        <input
          value={note.title}
          onChange={e => {
            setNote({ ...note, title: e.target.value });
            setDirty(true);
          }}
          placeholder="Note title"
          className="w-full bg-transparent text-2xl font-bold border border-gray-600 px-3"
        />
        <textarea
          value={note.content}
          onChange={e => {
            setNote({ ...note, content: e.target.value });
            setDirty(true);
          }}
          placeholder="Start writing..."
          rows={5}
          className=" w-full
            bg-transparent
            text-base leading-relaxed px-3 h border border-gray-600
          "
        />
        <button   className="mb-4 w-full  gap-1 rounded-sm bg-green-500 px-2 py-2 text-lg font-semibold text-white shadow hover:bg-green-700 active:scale-95 transition">Update Note</button>
      </section>
    </div></div>
  );
}
