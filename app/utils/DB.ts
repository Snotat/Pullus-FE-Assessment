import { api } from '../../api/supabase';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sync_status: 'synced' | 'pending' | 'deleted';
};

const STORE_NAME = 'notes';
let isSyncing = false;
let debounceTimer: NodeJS.Timeout | null = null;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open('notesDB', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getStore = async (mode: IDBTransactionMode) => {
  const db = await openDB();
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
};

export const saveNoteLocally = async (note: Note, forceSync = false) => {
  const store = await getStore('readwrite');
  await new Promise((res) => {
    const req = store.put(note);
    req.onsuccess = res;
  });

  if (navigator.onLine) {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (forceSync) {
      await syncNotesWithBackend();
    } else {
      debounceTimer = setTimeout(() => syncNotesWithBackend(), 1500);
    }
  }
  return note;
};

export const deleteNoteLocally = async (id: string) => {
  const note = await getNoteById(id);
  if (!note) return;
  
  await saveNoteLocally({ 
    ...note, 
    sync_status: 'deleted', 
    updatedAt: new Date().toISOString() 
  });
};

export const syncNotesWithBackend = async () => {
  if (!navigator.onLine || isSyncing) return;
  isSyncing = true;

  try {
    const localNotes = await getAllNotes(true);

    // 1. DELETE PHASE: Backend first, then Local
    const toDelete = localNotes.filter(n => n.sync_status === 'deleted');
    for (const n of toDelete) {
      try {
        await api.deleteNote(n.id); // Update Backend First
        const store = await getStore('readwrite'); // Open fresh transaction
        await new Promise((res) => {
          const req = store.delete(n.id);
          req.onsuccess = res;
        });
      } catch (e) { console.error("Cloud delete failed", e); }
    }

    // 2. PUSH PHASE: Backend first, then Local
    const toPush = localNotes.filter(n => n.sync_status === 'pending');
    for (const note of toPush) {
      try {
        const remoteExists = await api.fetchNoteById(note.id);
        if (remoteExists) {
          await api.updateNote(note.id, note.title, note.content);
        } else {
          await api.createNote(note.id, note.title, note.content);
        }
        
        // Backend updated successfully, now update Local status
        const store = await getStore('readwrite'); 
        await new Promise((res, rej) => {
          const req = store.put({ ...note, sync_status: 'synced' });
          req.onsuccess = res;
          req.onerror = rej;
        });
      } catch (e) { console.error("Push failed", e); }
    }

    // 3. PULL PHASE: Fetch from Cloud, then update Local
    const remoteNotes = await api.fetchAllNotes(); // Network first
    const latestLocal = await getAllNotes(true);
    const localMap = new Map(latestLocal.map(n => [n.id, n]));

    // Open transaction ONLY when ready to write to avoid timeout
    const store = await getStore('readwrite'); 
    
    for (const rNote of remoteNotes) {
      const local = localMap.get(rNote.id);
      // Logic: Only update local if it doesn't exist or is already marked as synced
      if (!local || local.sync_status === 'synced') {
        store.put({
          id: rNote.id,
          title: rNote.title,
          content: rNote.content,
          createdAt: rNote.created_at,
          updatedAt: rNote.modified_at || rNote.created_at,
          sync_status: 'synced'
        });
      }
    }
  } catch (error) {
    console.error("Global Sync Error:", error);
  } finally {
    isSyncing = false;
  }
};
export const getAllNotes = async (includeDeleted = false): Promise<Note[]> => {
  const store = await getStore('readonly');
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const all = (request.result as Note[]) || [];
      resolve(includeDeleted ? all : all.filter(n => n.sync_status !== 'deleted'));
    };
  });
};

export const getNoteById = async (id: string): Promise<Note | null> => {
  try {
    const store = await getStore('readonly');
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch { return null; }
};