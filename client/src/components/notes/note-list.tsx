import { Skeleton } from "@/components/ui/skeleton";
import { NoteCard } from "@/components/notes/note-card";
import type { DecryptedNote } from "@/store/note-store";

interface NoteListProps {
  notes: DecryptedNote[];
  loading: boolean;
  onNoteClick: (note: DecryptedNote) => void;
}

export function NoteList({ notes, loading, onNoteClick }: NoteListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No notes yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first encrypted note</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onClick={() => onNoteClick(note)} />
      ))}
    </div>
  );
}
