import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DecryptedNote } from "@/store/note-store";

interface NoteCardProps {
  note: DecryptedNote;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content.slice(0, 120);
  const date = new Date(note.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold truncate flex-1">{note.title || "Untitled"}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {date}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {preview || "No content"}
        </p>
      </CardContent>
    </Card>
  );
}
