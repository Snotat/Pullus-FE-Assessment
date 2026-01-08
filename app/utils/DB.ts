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
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
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

    const toDelete = localNotes.filter(n => n.sync_status === 'deleted');
    if (toDelete.length > 0) {
      await Promise.all(toDelete.map(n => api.deleteNote(n.id).catch(() => {})));
      
      const store = await getStore('readwrite');
      await Promise.all(toDelete.map(n => new Promise((res) => {
        const req = store.delete(n.id);
        req.onsuccess = res;
      })));
    }

    const toPush = localNotes.filter(n => n.sync_status === 'pending');
    for (const note of toPush) {
      try {
        const remote = await api.fetchNoteById(note.id);
        if (remote) {
          await api.updateNote(note.id, note.title, note.content);
        } else {
          await api.createNote(note.id, note.title, note.content);
        }
        
        const store = await getStore('readwrite');
        await store.put({ ...note, sync_status: 'synced' });
      } catch (e) {
        console.error(`Failed to push ${note.id}:`, e);
      }
    }
    const remoteNotes = await api.fetchAllNotes();
    const store = await getStore('readwrite');
    
    const currentLocal = await getAllNotes(true);
    const localMap = new Map(currentLocal.map(n => [n.id, n]));

    for (const rNote of remoteNotes) {
      const local = localMap.get(rNote.id);
      
      if (!local || local.sync_status === 'synced') {
        store.put({
          id: rNote.id,
          title: rNote.title,
          content: rNote.content,
          createdAt: rNote.created_at,
          updatedAt: rNote.modified_at,
          sync_status: 'synced'
        });
      }
    }
  } catch (error) {
    console.error("Sync Error:", error);
  } finally {
    isSyncing = false;
  }
};

export const syncSingleNote = async (note: Note) => {
  if (!navigator.onLine || isSyncing) return;
  await syncNotesWithBackend(); 
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
      request.onerror = () => resolve(null);
    });
  } catch { return null; }
};