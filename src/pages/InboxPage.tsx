import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAppContext } from "@/context/AppContext";
import { sendMetaReplyWithServer } from "@/lib/meta/server";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Phone, UserRound, Workflow } from "lucide-react";

export default function InboxPage() {
  const {
    conversations,
    conversationMessages,
    conversationNotes,
    conversationEvents,
    addConversationNote,
    updateConversation,
    refreshAppState,
    user,
    whatsApp,
  } = useAppContext();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Pending" | "Resolved">("All");
  const [ownerFilter, setOwnerFilter] = useState<"All" | "Mine" | "Unassigned">("All");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [assignmentDraft, setAssignmentDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    if (!selectedConversationId && conversations[0]?.id) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const filteredConversations = useMemo(() => (
    conversations.filter((conversation) => {
      if (statusFilter !== "All" && conversation.status !== statusFilter) {
        return false;
      }
      if (ownerFilter === "Mine" && conversation.assignedTo !== (user?.name ?? "")) {
        return false;
      }
      if (ownerFilter === "Unassigned" && conversation.assignedTo) {
        return false;
      }
      if (showUnreadOnly && conversation.unreadCount === 0) {
        return false;
      }
      return true;
    })
  ), [conversations, ownerFilter, showUnreadOnly, statusFilter, user?.name]);

  const activeConversation = filteredConversations.find((conversation) => conversation.id === selectedConversationId)
    ?? conversations.find((conversation) => conversation.id === selectedConversationId)
    ?? filteredConversations[0]
    ?? conversations[0];
  const activeMessages = conversationMessages.filter((message) => message.conversationId === activeConversation?.id);
  const activeNotes = conversationNotes.filter((note) => note.conversationId === activeConversation?.id);
  const activeEvents = conversationEvents.filter((event) => event.conversationId === activeConversation?.id);

  useEffect(() => {
    setAssignmentDraft(activeConversation?.assignedTo ?? user?.name ?? "");
  }, [activeConversation?.assignedTo, activeConversation?.id, user?.name]);

  useEffect(() => {
    setReplyDraft("");
    setNoteDraft("");
  }, [activeConversation?.id]);

  const handleConversationUpdate = async (
    input: Parameters<typeof updateConversation>[0],
    successMessage: string,
  ) => {
    try {
      await updateConversation({
        ...input,
        actorName: user?.name || "Workspace Operator",
      });
      toast({ title: "Conversation updated", description: successMessage });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update the conversation.",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!activeConversation) {
      return;
    }
    if (!noteDraft.trim()) {
      toast({ title: "Note required", description: "Write an internal note before saving.", variant: "destructive" });
      return;
    }

    try {
      await addConversationNote({
        conversationId: activeConversation.id,
        body: noteDraft.trim(),
        authorName: user?.name || "Workspace Operator",
      });
      setNoteDraft("");
      toast({ title: "Note added", description: "Internal note saved for this conversation." });
    } catch (error) {
      toast({
        title: "Note failed",
        description: error instanceof Error ? error.message : "Could not save the note.",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!activeConversation) {
      return;
    }

    if (!replyDraft.trim()) {
      toast({ title: "Reply required", description: "Write a reply before sending.", variant: "destructive" });
      return;
    }

    if (!whatsApp.connected || !whatsApp.phoneNumberId) {
      toast({
        title: "WhatsApp not connected",
        description: "Connect a real Meta WhatsApp number before replying from the inbox.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingReply(true);
      await sendMetaReplyWithServer({
        conversationId: activeConversation.id,
        to: activeConversation.phone,
        body: replyDraft.trim(),
      });
      await refreshAppState();
      setReplyDraft("");
      toast({ title: "Reply sent", description: `Message sent to ${activeConversation.displayName}.` });
    } catch (error) {
      toast({
        title: "Reply failed",
        description: error instanceof Error ? error.message : "Could not send the WhatsApp reply.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <MessageSquare className="h-4 w-4" />
                  Shared WhatsApp inbox
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage WhatsApp conversations from one operator workspace</h1>
                <p className="mt-4 text-muted-foreground">
                  This is the first inbox layer for multi-agent chat management, lead capture, and future automation triggers.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <Stat label="Open conversations" value={conversations.filter((item) => item.status === "Open").length.toString()} />
                <Stat label="Unread messages" value={conversations.reduce((sum, item) => sum + item.unreadCount, 0).toString()} />
                <Stat label="Lead-linked chats" value={conversations.filter((item) => item.source === "Meta Ads" || item.source === "WhatsApp Inbound").length.toString()} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Conversations</h2>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "All" | "Open" | "Pending" | "Resolved")}
                    className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                  >
                    {["All", "Open", "Pending", "Resolved"].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <select
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value as "All" | "Mine" | "Unassigned")}
                    className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                  >
                    {["All", "Mine", "Unassigned"].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <Button
                    variant={showUnreadOnly ? "default" : "outline"}
                    onClick={() => setShowUnreadOnly((current) => !current)}
                  >
                    Unread only
                  </Button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredConversations.length > 0 ? filteredConversations.map((conversation) => (
                <div key={conversation.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      if (conversation.unreadCount > 0) {
                        void handleConversationUpdate(
                          { id: conversation.id, unreadCount: 0 },
                          "Unread count cleared for the active thread.",
                        );
                      }
                    }}
                    className={`flex w-full items-start justify-between gap-4 text-left ${
                      activeConversation?.id === conversation.id ? "rounded-2xl bg-muted/40 p-3 -m-3" : ""
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
                      {conversation.unreadCount > 0 && <p className="mt-1 text-xs font-medium text-primary">{conversation.unreadCount} unread</p>}
                    </div>
                  </button>
                </div>
              )) : (
                <EmptyBlock title="No conversations yet" body="Incoming WhatsApp messages and future support chats will land here." />
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Conversation preview</h2>
            </div>
            <div className="space-y-4 px-6 py-6">
              {activeConversation ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoRow icon={UserRound} label="Customer" value={activeConversation.displayName} />
                    <InfoRow icon={Phone} label="Number" value={activeConversation.phone} />
                    <InfoRow icon={Workflow} label="Assigned" value={activeConversation.assignedTo || "Unassigned"} />
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assign conversation</p>
                        <input
                          value={assignmentDraft}
                          onChange={(event) => setAssignmentDraft(event.target.value)}
                          placeholder="Owner name"
                          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => void handleConversationUpdate(
                            { id: activeConversation.id, assignedTo: assignmentDraft.trim() || null },
                            assignmentDraft.trim() ? `Conversation assigned to ${assignmentDraft.trim()}.` : "Conversation is now unassigned.",
                          )}
                        >
                          Save owner
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => void handleConversationUpdate(
                            { id: activeConversation.id, status: "Pending", unreadCount: 0 },
                            "Conversation moved to pending follow-up.",
                          )}
                        >
                          Mark pending
                        </Button>
                        {activeConversation.status === "Resolved" ? (
                          <Button
                            variant="outline"
                            onClick={() => void handleConversationUpdate(
                              { id: activeConversation.id, status: "Open", unreadCount: 0 },
                              "Conversation reopened for active handling.",
                            )}
                          >
                            Reopen
                          </Button>
                        ) : null}
                        <Button
                          onClick={() => void handleConversationUpdate(
                            { id: activeConversation.id, status: "Resolved", unreadCount: 0 },
                            "Conversation marked resolved.",
                          )}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-3">
                      <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Internal notes</p>
                          <span className="text-xs text-muted-foreground">{activeNotes.length} notes</span>
                        </div>
                        <textarea
                          value={noteDraft}
                          onChange={(event) => setNoteDraft(event.target.value)}
                          rows={3}
                          placeholder="Capture handoff detail, pricing context, or follow-up instructions"
                          className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
                        />
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => void handleAddNote()}>
                            Add note
                          </Button>
                        </div>
                        <div className="mt-4 space-y-3">
                          {activeNotes.length > 0 ? activeNotes.map((note) => (
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
                    </div>
                    <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conversation history</p>
                        <span className="text-xs text-muted-foreground">{activeEvents.length} events</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {activeEvents.length > 0 ? activeEvents.map((event) => (
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
                  </div>
                  <div className="space-y-3">
                    {activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          message.direction === "Outbound"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p>{message.body}</p>
                        <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${message.direction === "Outbound" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          <p>
                          {new Date(message.sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <span className="capitalize">{message.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reply from inbox</p>
                    <textarea
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      rows={4}
                      placeholder={whatsApp.connected ? "Type a WhatsApp reply..." : "Connect WhatsApp before replying from the inbox"}
                      className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
                      disabled={!whatsApp.connected || isSendingReply}
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Outbound replies use your connected Meta WhatsApp number and will be stored in this thread.
                      </p>
                      <Button onClick={() => void handleSendReply()} disabled={!whatsApp.connected || isSendingReply}>
                        {isSendingReply ? "Sending..." : "Send reply"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyBlock title="Inbox preview unavailable" body="Once WhatsApp conversations start flowing in, the active thread will render here." />
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
