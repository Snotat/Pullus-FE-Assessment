'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  CloudCheck,
  CloudUpload,
  Clock,
  Plus,
  FileText,
  RefreshCw,
  Wifi,
  WifiOff,
  Search,
  X
} from 'lucide-react';
import logo from '../public/pullus_notebook_logo.png'
import { useNetworkState } from 'react-use';
import { 
  getAllNotes, 
  deleteNoteLocally, 
  syncNotesWithBackend, 
  type Note 
} from './utils/DB';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { online } = useNetworkState();
  const wasOffline = useRef(false); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (online === undefined) return;

    if (!online) {
      wasOffline.current = true;
      toast.error('Offline Mode: Changes saved locally', {
        toastId: 'offline',
        autoClose: false,
      });
    } else {
      toast.dismiss('offline');
      if (wasOffline.current) {
        toast.success('Back online! Syncing changes...');
        wasOffline.current = false;
      }
    }
  }, [online]);

const refreshUI = async () => {
    const data = await getAllNotes();
    
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

    console.log('Sorted data', sortedData);
    setNotes(sortedData);
    setLoading(false);
};

  useEffect(() => {
    let isMounted = true;

    const performSync = async () => {
      await refreshUI(); 
      
      if (online) {
        setIsSyncing(true);
        try {
          await syncNotesWithBackend();
          if (isMounted) await refreshUI();
        } finally {
          if (isMounted) setIsSyncing(false);
        }
      }
    };

    performSync();
    return () => { isMounted = false; };
  }, [online]);

  const filteredNotes = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return notes
      .filter(n => 
        n.title.toLowerCase().includes(search) || 
        n.content.toLowerCase().includes(search)
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm('Move this note to trash?')) {
      await deleteNoteLocally(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.info('Note moved to trash');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white items-center justify-center min-h-screen text-slate-400">
          <Link href='/' className="flex items-center gap-3 relative w-28 h-16">
          
<Image alt='pullus logo' src={logo} fill className='object-contain'  />
          </Link>
        <RefreshCw size={40} className="mb-4 animate-spin text-[#80c341]" />
        <p className="font-black uppercase tracking-widest text-[10px]">Loading Notes...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 bg-white min-h-screen">
      
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${online ? 'text-emerald-500' : 'text-amber-500'}`}>
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          {online ? 'System Online' : 'Offline Mode'}
        </div>
        
        <div className="flex items-center gap-4">
          {online && (
            <button 
              onClick={() => { setIsSyncing(true); syncNotesWithBackend().then(refreshUI).finally(() => setIsSyncing(false)); }}
              disabled={isSyncing}
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">Notes</h1>
        
        <div className="relative max-w-xl">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-sm py-2 pl-8 pr-6 text-lg focus:ring-4 focus:ring-green-100 focus:bg-white  transition-all outline-none font-medium "
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-200 rounded-full">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {filteredNotes.length > 0 ? (
        <div className="space-y-1">
          <div className="hidden md:grid grid-cols-12 border-b border-slate-100 px-6 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <div className="col-span-6">Details</div>
            <div className="col-span-2">Cloud</div>
            <div className="col-span-2 text-center">Modified</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <ul className="divide-y divide-slate-50">
            {filteredNotes.map((note) => (
              <li 
                key={note.id} 
                className="group grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-6 hover:bg-slate-50 transition-all cursor-pointer rounded-xl"
                onClick={() => router.push(`/view/${note.id}`)}
              >
                <div className="md:col-span-6">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors line-clamp-1 italic">
                    {note.title || 'Untitled'}
                  </h2>
                  <p className="text-sm text-slate-400 line-clamp-1 mt-1 font-medium italic">
                    {note.content || 'No content...'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    note.sync_status === 'synced' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {note.sync_status === 'synced' ? <CloudCheck size={12} /> : <CloudUpload size={12} />}
                    {note.sync_status}
                  </div>
                </div>

                <div className="md:col-span-2 text-center text-[10px] font-bold text-slate-400 uppercase">
                  {new Date(note.updatedAt).toLocaleString(undefined, { 
  month: 'short', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
                </div>

                <div className="md:col-span-2 flex justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/edit/${note.id}`); }} className="p-3  text-slate-300 hover:text-[#80c341] transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-100 rounded-sm border-2 border-dashed border-slate-100">
         
          <p className="text-slate-400 font-black uppercase tracking-widest text-[20px] mb-3">
            {searchQuery ? 'No Note found' : 'Empty Notebook!'}
          </p>
             <Link
                        href='/create'
                        className="mb-4 w-fit mx-auto  gap-1 rounded-sm bg-[#80c341] px-4 py-2 text-lg font-bold text-white shadow hover:bg-green-700 active:scale-95 transition"
                      >
                        + Create
                      </Link>
        </div>
      )}
    </div>
  );
}