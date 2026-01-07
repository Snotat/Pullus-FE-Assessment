'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Database,
  HardDrive,
  Clock,
  CloudOff,
} from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  saved: boolean;
};

const note: Note = {
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

export default function ViewNotePage() {
  return (
    <main className="mx-auto w-full px-4 py-8 bg-white text-gray-700">
<div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to notes
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/edit/${note.id}`}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-400 hover:text-yellow-500 "
          >
            <Pencil size={14} className="inline mr-1" />
            Edit
          </Link>

          <Link 
            href={`/edit/${note.id}`} className="rounded-lg text-gray-400 px-3 py-1.5 text-sm font-semibold hover:text-red-500">
            <Trash2 size={14} className="inline mr-1" />
            Delete
          </Link>
        </div>
      </div>
      <header className="mb-4">
        <h1 className="text-3xl font-bold leading-tight text-slate-900">
          {note.title}
        </h1>
      </header>
      <div className="mb-8 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          Created {new Date(note.createdAt).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-1">
          <Clock size={12} />
          Updated {new Date(note.updatedAt).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-1">
          {note.saved ? (
            <>
              <Database size={12} className="text-emerald-500" />
              Saved to database
            </>
          ) : (
            <>
              <HardDrive size={12} className="text-amber-500" />
              Local only
              <CloudOff size={12} className="ml-1 text-amber-500" />
            </>
          )}
        </div>
      </div>

      <article className="prose prose-slate max-w-none">
        {note.content.split('\n').map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </article></div>
    </main>
  );
}
