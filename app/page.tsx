'use client';

import Link from 'next/link';
import {
  FileText,
  Pencil,
  Trash2,
  Database,
  HardDrive,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Note = {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  createdAt: string;
  saved: boolean;
};

const notes: Note[] = [
  {
    id: '1',
    title: 'Note taking web app',
    excerpt:
      'Best Notetaking web app in the world,Best Notetaking web app in the world,Best Notetaking web app in the world,Best Notetaking web app in the world,Best Notetaking web app in the world,Best Notetaking web app in the world',
    updatedAt: '2026-01-06',
    createdAt: '2026-01-04',
    saved: true,
  },
  {
    id: '2',
    title: 'Note taking app by Snotat',
    excerpt:
      'Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,Note taking app by Snotat,',
    updatedAt: '2026-01-07',
    createdAt: '2026-01-05',
    saved: false,
  },
];

export default function Home() {
const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 bg-white h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Notes
          </h1>
          <p className="text-sm text-slate-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-13 border-b px-1 pb-1 text-xs font-semibold text-slate-500">
        <div className="col-span-1">S.N</div>
        <div className="col-span-6">Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Created/Edited</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      <ul className="divide-y">
        {notes.map(note => (
          <Link
           href={`/view/${note.id}`}
            key={note.id}
            className="group grid grid-cols-1 md:grid-cols-12 gap-3 px-1 py-2 hover:bg-slate-50 transition"
          >
            <div
             
              className="md:col-span-6 flex gap-1"
            >
              <div>
                <h1 className="font-mono text-4xl pr-3 text-slate-800 ">
                  {note.id}
                </h1>
              </div>
              <div>
                <h2 className="font-semibold  text-slate-800 group-hover:underline">
                  {note.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {note.excerpt}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-1 text-sm text-slate-600">
              {note.saved ? (
                <>
                  <Database size={14} className="text-emerald-500" />
                  Saved
                </>
              ) : (
                <>
                  <HardDrive size={14} className="text-amber-500" />
                  Local
                </>
              )}
            </div>
            <div className="md:col-span-2 flex items-center gap-1 text-sm text-slate-500">
              <Clock size={14} />
              {new Date(note.updatedAt).toLocaleDateString()}
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-1">
              <button
              onClick={()=>router.push(`/edit/${note.id}`)}
                
                className=" p-2 text-slate-500 hover:text-yellow-500"
              >
                <Pencil size={16} />
              </button>
<button
              onClick={()=>router.push(`/del/${note.id}`)}
                className=" p-2 text-slate-500 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Link>
        ))}
      </ul>
      {notes.length === 0 && (
        <div className="mt-14 text-center text-slate-400">
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm">
            Save your notes
          </p>
        </div>
      )}
    </div>
  );
}
