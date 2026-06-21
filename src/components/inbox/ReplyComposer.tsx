import { Button } from "@/components/ui/button";

interface ReplyComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  cannedReplies: string[];
  onCannedReplySelect: (body: string) => void;
  disabled: boolean;
  isSending: boolean;
  displayName: string;
}

export function ReplyComposer({
  draft,
  onDraftChange,
  onSend,
  cannedReplies,
  onCannedReplySelect,
  disabled,
  isSending,
  displayName,
}: ReplyComposerProps) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reply from inbox</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {cannedReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onCannedReplySelect(reply.replace("{{contact.name}}", displayName))}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            Use canned reply
          </button>
        ))}
      </div>
      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={4}
        placeholder={disabled ? "Connect WhatsApp before replying from the inbox" : "Type a WhatsApp reply..."}
        className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
        disabled={disabled || isSending}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Outbound replies use your connected Meta WhatsApp number.
        </p>
        <Button onClick={onSend} disabled={disabled || isSending}>
          {isSending ? "Sending..." : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
