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
import Link from 'next/link';
import Image from 'next/image';
import logo from '../public/pullus_notebook_logo.png'

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
      <Link href='/' className="flex items-center gap-3 relative w-28 h-16">
          
<Image alt='pullus logo' src={logo} fill className='object-contain'  />
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href='/create' className="hidden sm:flex items-center gap-1 rounded-sm bg-[#80c341] px-2 py-1 text-sm font-semibold text-white shadow hover:bg-green-700 active:scale-95 transition">
              <Plus size={16} />
              Create
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex sm:hidden h-9 w-9 items-center justify-center rounded-sm hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

   
        <div className="fixed inset-0 flex flex-row z-50 justify-between item-center bg-white sm:hidden w-full">
            <Link href='/' className="flex items-center gap-3 relative w-28 h-16">
          
<Image alt='pullus logo' src={logo} fill className='object-contain'  />
          </Link>
          <div className=" bottom-0 w-fit p-4">

            <Link
              href='/create'
              className="mb-4 w-full  gap-1 rounded-sm bg-[#80c341] px-2 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 active:scale-95 transition"
            >
              + Create
            </Link>


           
          </div>
          
        </div>
    
    </nav>
  );
}
