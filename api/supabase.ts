import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USER_ID = process.env.NEXT_PUBLIC_USER_EMAIL || 'default_user';

const supabase = axios.create({
  baseURL: `${BASE_URL}`,
  headers: {
    'apikey': ANON_KEY || '',
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation' 
  },
});

export const api = {
  async fetchAllNotes() {
    const response = await supabase.get('/notes', {
      params: {
        user_id: `eq.${USER_ID}`,
        order: 'created_at.desc',
      },
    });
    console.log('API response', response.data)
    return response.data;
  },

  async fetchNoteById(noteId: string) {
    const response = await supabase.get('/notes', {
      params: {
        id: `eq.${noteId}`,
        user_id: `eq.${USER_ID}`,
      },
    });
    console.log('API response', response.data)
    return response.data.length > 0 ? response.data[0] : null;
  },

  async createNote(id: string, title: string, content: string) {
    const response = await supabase.post('/notes', {
      id,
      user_id: USER_ID,
      title,
      content,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    });
    console.log('API response', response.data)
    return response.data;
  },

  async updateNote(noteId: string, title: string, content: string) {
    const response = await supabase.patch('/notes', {
      title,
      content,
      modified_at: new Date().toISOString(),
    }, {
      params: {
        id: `eq.${noteId}`,
        user_id: `eq.${USER_ID}`,
      }
    });
    console.log('API response', response.data)
    return response.data;
  },

  async deleteNote(noteId: string) {
    await supabase.delete('/notes', {
      params: {
        id: `eq.${noteId}`,
        user_id: `eq.${USER_ID}`,
      },
    });
    return true;
  },
};