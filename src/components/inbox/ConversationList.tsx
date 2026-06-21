import type { Conversation as ConversationType } from "@/lib/api/types";

interface ConversationListProps {
  conversations: ConversationType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-base font-semibold text-foreground">No conversations yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Incoming WhatsApp messages will land here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
          <button
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`flex w-full items-start justify-between gap-4 text-left ${
              selectedId === conversation.id ? "rounded-2xl bg-muted/40 p-3 -m-3" : ""
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{conversation.displayName}</p>
              <p className="text-xs text-muted-foreground">{conversation.phone}</p>
              <p className="mt-2 text-sm text-muted-foreground">{conversation.lastMessagePreview}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {conversation.assignedTo && (
                  <span className="rounded-full bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                    Owner: {conversation.assignedTo}
                  </span>
                )}
                {conversation.status === "Pending" && (
                  <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[11px] text-warning">
                    Pending follow-up
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">{conversation.status}</span>
              <p className="mt-2 text-xs text-muted-foreground">{conversation.source}</p>
              {conversation.unreadCount > 0 && (
                <p className="mt-1 text-xs font-medium text-primary">{conversation.unreadCount} unread</p>
              )}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
