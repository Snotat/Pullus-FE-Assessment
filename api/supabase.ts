import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USER_ID = process.env.NEXT_PUBLIC_USER_EMAIL||'';

const encodedUserId = USER_ID;


const supabase = axios.create({
  baseURL: `${BASE_URL}`, 
  headers: {
    'apikey': ANON_KEY || '',
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const api = {
  async fetchAllNotes() {
    try {
      const response = await supabase.get('/notes', {
        params: {
          user_id: `eq.${encodedUserId}`,
          order: 'created_at.desc',
        },
      });
      return response.data;
    } catch (error) {
      console.error('fetchAllNotes Error:', error);
      throw error;
    }
  },

  async fetchNoteById(noteId: string) {
    try {
      const response = await supabase.get('/notes', {
        params: {
          id: `eq.${noteId}`,
          user_id: `eq.${encodedUserId}`,
        },
      });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      return null;
    }
  },

  async createNote(id: string, title: string, content: string) {
    if (title.length > 2000) throw new Error('Title too long');
    
    try {
      const response = await supabase.post('/notes', {
     
        user_id: encodedUserId,
        title,
        content,
      }, {
        headers: { 'Prefer': 'return=representation' }
      });
      return response.data;
    } catch (error) {
      console.error('createNote Error:', error);
      throw error;
    }
  },

  async updateNote(noteId: string, title: string, content: string) {
    try {
      const response = await supabase.patch('/notes', {
        title,
        content,
        modified_at: new Date().toISOString(),
      }, {
        params: {
          id: `eq.${noteId}`,
          user_id: `eq.${encodedUserId}`,
        },
        headers: { 'Prefer': 'return=representation' }
      });
      return response.data;
    } catch (error) {
      console.error('updateNote Error:', error);
      throw error;
    }
  },

  async deleteNote(noteId: string) {
    try {
      await supabase.delete('/notes', {
        params: {
          id: `eq.${noteId}`,
          user_id: `eq.${encodedUserId}`,
        },
      });
      return true;
    } catch (error) {
      console.error('deleteNote Error:', error);
      throw error;
    }
  },
};