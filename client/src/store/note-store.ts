import { create } from "zustand";
import { api } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/crypto";

export interface DecryptedNote {
  id: string;
  title: string;
  content: string;
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteState {
  notes: DecryptedNote[];
  loading: boolean;
  error: string | null;

  setNotes: (notes: DecryptedNote[]) => void;
  addNote: (note: DecryptedNote) => void;
  updateNote: (id: string, note: Partial<DecryptedNote>) => void;
  removeNote: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchNotes: (password: string) => Promise<void>;
  createNote: (title: string, content: string, password: string, salt: string) => Promise<void>;
  editNote: (id: string, title: string, content: string, password: string, salt: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: false,
  error: null,

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, partial) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...partial } : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchNotes: async (password) => {
    set({ loading: true, error: null });
    try {
      const dtos = await api.notes.list();
      const decrypted = await Promise.all(
        dtos.map(async (dto) => {
          const title = await decrypt(dto.encryptedTitle, password, dto.salt, dto.iv);
          const content = await decrypt(dto.encryptedContent, password, dto.salt, dto.ivContent || dto.iv);
          return {
            id: dto._id,
            title,
            content,
            encryptedTitle: dto.encryptedTitle,
            encryptedContent: dto.encryptedContent,
            iv: dto.iv,
            salt: dto.salt,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
          };
        })
      );
      set({ notes: decrypted, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  createNote: async (title, content, password, noteSalt) => {
    set({ loading: true, error: null });
    try {
      const { ciphertext: encryptedTitle, iv } = await encrypt(title, password, noteSalt);
      const { ciphertext: encryptedContent, iv: ivContent } = await encrypt(content, password, noteSalt);
      const dto = await api.notes.create({
        encryptedTitle,
        encryptedContent,
        iv,
        ivContent,
        salt: noteSalt,
      });
      const decryptedTitle = await decrypt(dto.encryptedTitle, password, dto.salt, dto.iv);
      const decryptedContent = await decrypt(dto.encryptedContent, password, dto.salt, dto.ivContent);
      const note: DecryptedNote = {
        id: dto._id,
        title: decryptedTitle,
        content: decryptedContent,
        encryptedTitle: dto.encryptedTitle,
        encryptedContent: dto.encryptedContent,
        iv: dto.iv,
        salt: dto.salt,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      };
      set((s) => ({ notes: [note, ...s.notes], loading: false }));
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  editNote: async (id, title, content, password, noteSalt) => {
    set({ loading: true, error: null });
    try {
      const { ciphertext: encryptedTitle, iv } = await encrypt(title, password, noteSalt);
      const { ciphertext: encryptedContent, iv: ivContent } = await encrypt(content, password, noteSalt);
      const dto = await api.notes.update(id, {
        encryptedTitle,
        encryptedContent,
        iv,
        ivContent,
        salt: noteSalt,
      });
      set((s) => ({
        notes: s.notes.map((n) =>
          n.id === id
            ? {
                ...n,
                title,
                content,
                encryptedTitle: dto.encryptedTitle,
                encryptedContent: dto.encryptedContent,
                iv: dto.iv,
                salt: dto.salt,
                updatedAt: dto.updatedAt,
              }
            : n
        ),
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  deleteNote: async (id) => {
    try {
      await api.notes.delete(id);
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
