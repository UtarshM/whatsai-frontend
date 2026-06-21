import type { ConversationEvent as EventType } from "@/lib/api/types";

interface ConversationTimelineProps {
  events: EventType[];
}

export function ConversationTimeline({ events }: ConversationTimelineProps) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conversation history</p>
        <span className="text-xs text-muted-foreground">{events.length} events</span>
      </div>
      <div className="mt-4 space-y-3">
        {events.length > 0 ? events.map((event) => (
          <div key={event.id} className="rounded-xl border border-border bg-background p-3">
            <p className="text-sm font-medium text-foreground">{event.summary}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {event.actorName} · {new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No conversation history yet.</p>
        )}
      </div>
    </div>
  );
}
