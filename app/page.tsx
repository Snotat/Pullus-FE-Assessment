'use client';

import { Pin, Clock, MoreHorizontal } from 'lucide-react';


export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 bg-white h-full min-h-screen">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Your Notes
          </h1>
          <p className="text-sm text-slate-500">
            Save things you do not want to forget here!!!
          </p>
        </div>
      </div>

      <section
        className="
          columns-1
          sm:columns-2
          lg:columns-3
          gap-6
        "
      >
     
      </section>
    </main>
  );
}
