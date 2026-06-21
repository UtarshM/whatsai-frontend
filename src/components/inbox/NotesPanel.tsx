import type { ConversationNote as NoteType } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

interface NotesPanelProps {
  notes: NoteType[];
  noteDraft: string;
  onDraftChange: (value: string) => void;
  onAddNote: () => void;
}

export function NotesPanel({ notes, noteDraft, onDraftChange, onAddNote }: NotesPanelProps) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Internal notes</p>
        <span className="text-xs text-muted-foreground">{notes.length} notes</span>
      </div>
      <textarea
        value={noteDraft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={3}
        placeholder="Capture handoff detail, pricing context, or follow-up instructions"
        className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
      />
      <div className="mt-3 flex justify-end">
        <Button variant="outline" onClick={onAddNote}>Add note</Button>
      </div>
      <div className="mt-4 space-y-3">
        {notes.length > 0 ? notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-border bg-background p-3">
            <p className="text-sm text-foreground">{note.body}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {note.authorName} · {new Date(note.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No internal notes yet.</p>
        )}
      </div>
    </div>
  );
}
