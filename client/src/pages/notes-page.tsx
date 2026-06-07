import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NoteList } from "@/components/notes/note-list";
import { NoteEditor } from "@/components/notes/note-editor";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import { useNoteStore, type DecryptedNote } from "@/store/note-store";
import { generateSalt } from "@/lib/crypto";
import { Plus, LogOut } from "lucide-react";

export default function NotesPage() {
  const { isAuthenticated, password, username, logout } = useAuthStore();
  const { notes, loading, fetchNotes, createNote, editNote, deleteNote } = useNoteStore();
  const navigate = useNavigate();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DecryptedNote | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !password) {
      navigate("/login");
      return;
    }
    fetchNotes(password);
  }, [isAuthenticated, password, fetchNotes, navigate]);

  const handleCreate = useCallback(() => {
    setEditingNote(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((note: DecryptedNote) => {
    setEditingNote(note);
    setEditorOpen(true);
  }, []);

  async function handleSave(title: string, content: string) {
    if (!password) return;
    if (editingNote) {
      await editNote(editingNote.id, title, content, password, editingNote.salt);
    } else {
      const noteSalt = await generateSalt();
      await createNote(title, content, password, noteSalt);
    }
  }

  async function handleDelete() {
    if (!editingNote) return;
    await deleteNote(editingNote.id);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AnoNote" className="w-8 h-8 dark:invert" />
            <h1 className="text-lg font-semibold">AnoNote</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{username}</span>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" />
              New note
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <NoteList notes={notes} loading={loading} onNoteClick={handleEdit} />
      </main>

      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditingNote(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
