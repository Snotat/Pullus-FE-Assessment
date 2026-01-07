'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  Search,
  Plus,
  Cloud,
  CloudOff,
  NotebookPen,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  WifiOff
} from 'lucide-react';

// --- Online Status Helpers ---
const subscribe = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

export default function NavBar() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
           

            <button className="hidden sm:flex items-center text-green-500 gap-1 rounded-lg px-2 py-1 text-md font-bold  hover:bg-slate-100">
              PULLUS NOTETAKER
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input type='text' placeholder='Search your note' className="flex w-full items-center gap-3 rounded-sm border border-slate-200 bg-slate-50 px-4 py-2 pl-8 text-sm text-slate-500 hover:bg-white hover:ring-4 hover:ring-indigo-500/10 transition" />
           <span className='absolute left-2 top-0 bottom-0 flex flex-row items-center align-middle justify-center text-gray-400 '>
              <Search size={20} /></span>
             
          
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-1 rounded-sm bg-green-500 px-2 py-1 text-sm font-semibold text-white shadow hover:bg-green-700 active:scale-95 transition">
              <Plus size={16} />
              Create
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex sm:hidden h-9 w-9 items-center justify-center rounded-sm hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

   
        <div className="fixed inset-0 flex flex-row z-50 item-center bg-white sm:hidden w-full">
          <div className=" bottom-0 w-fit p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="mb-4 w-full  gap-1 rounded-sm bg-green-500 px-2 py-1 text-sm font-semibold text-white shadow hover:bg-green-700 active:scale-95 transition"
            >
              + Create
            </button>


            {!isOnline && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
                <WifiOff size={16} />
                Notes will sync when online
              </div>
            )}
          </div>
          
            <div className=" md:hidden flex flex-1 max-w-lg w-full h-full items-center relative px-5">
            <input type='text' placeholder='Search your note' className="flex w-full h-fit items-center gap-3 rounded-sm border border-slate-200 bg-slate-50 px-4 py-2 pl-8 text-sm text-slate-500 hover:bg-white hover:ring-4 hover:ring-indigo-500/10 transition" />
           <span className='absolute left-7 top-0 bottom-0 flex flex-row  items-center align-middle justify-center text-gray-400 '>
              <Search size={20} /></span>
             
          
          </div>
        </div>
    
    </nav>
  );
}
