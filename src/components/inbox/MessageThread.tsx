import type { ConversationMessage as MessageType } from "@/lib/api/types";

interface MessageThreadProps {
  messages: MessageType[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">No messages in this conversation yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
            message.direction === "Outbound"
              ? "ml-auto bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p>{message.body}</p>
          <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
            message.direction === "Outbound" ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}>
            <p>{new Date(message.sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            <span className="capitalize">{message.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
