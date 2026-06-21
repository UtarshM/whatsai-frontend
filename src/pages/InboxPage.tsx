import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAppContext } from "@/context/AppContext";
import { sendMetaReplyWithServer } from "@/lib/meta/server";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Phone, UserRound, Workflow } from "lucide-react";
import { Stat, InfoRow, EmptyBlock, ConversationList, MessageThread, NotesPanel, ConversationTimeline, ReplyComposer } from "@/components/inbox";

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
  const [conversationSearch, setConversationSearch] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [cannedReplies, setCannedReplies] = useState<string[]>([]);

  useEffect(() => {
    fetch("/canned-replies?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const replies = data.data?.replies ?? [];
        setCannedReplies(replies.map((r: { body: string }) => r.body));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations[0]?.id) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const filteredConversations = useMemo(() => (
    conversations.filter((conversation) => {
      if (statusFilter !== "All" && conversation.status !== statusFilter) return false;
      if (ownerFilter === "Mine" && conversation.assignedTo !== (user?.name ?? "")) return false;
      if (ownerFilter === "Unassigned" && conversation.assignedTo) return false;
      if (showUnreadOnly && conversation.unreadCount === 0) return false;
      if (conversationSearch.trim()) {
        const query = conversationSearch.toLowerCase();
        return [conversation.displayName, conversation.phone, conversation.lastMessagePreview, conversation.assignedTo || ""]
          .some((value) => value.toLowerCase().includes(query));
      }
      return true;
    })
  ), [conversationSearch, conversations, ownerFilter, showUnreadOnly, statusFilter, user?.name]);

  const activeConversation = filteredConversations.find((c) => c.id === selectedConversationId)
    ?? conversations.find((c) => c.id === selectedConversationId)
    ?? filteredConversations[0]
    ?? conversations[0];
  const activeMessages = conversationMessages.filter((m) => m.conversationId === activeConversation?.id);
  const activeNotes = conversationNotes.filter((n) => n.conversationId === activeConversation?.id);
  const activeEvents = conversationEvents.filter((e) => e.conversationId === activeConversation?.id);

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
      await updateConversation({ ...input, actorName: user?.name || "Workspace Operator" });
      toast({ title: "Conversation updated", description: successMessage });
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "Could not update the conversation.", variant: "destructive" });
    }
  };

  const handleAddNote = async () => {
    if (!activeConversation) return;
    if (!noteDraft.trim()) {
      toast({ title: "Note required", description: "Write an internal note before saving.", variant: "destructive" });
      return;
    }
    try {
      await addConversationNote({ conversationId: activeConversation.id, body: noteDraft.trim(), authorName: user?.name || "Workspace Operator" });
      setNoteDraft("");
      toast({ title: "Note added", description: "Internal note saved for this conversation." });
    } catch (error) {
      toast({ title: "Note failed", description: error instanceof Error ? error.message : "Could not save the note.", variant: "destructive" });
    }
  };

  const handleSendReply = async () => {
    if (!activeConversation) return;
    if (!replyDraft.trim()) {
      toast({ title: "Reply required", description: "Write a reply before sending.", variant: "destructive" });
      return;
    }
    if (!whatsApp.connected || !whatsApp.phoneNumberId) {
      toast({ title: "WhatsApp not connected", description: "Connect a real Meta WhatsApp number before replying.", variant: "destructive" });
      return;
    }
    try {
      setIsSendingReply(true);
      await sendMetaReplyWithServer({ conversationId: activeConversation.id, to: activeConversation.phone, body: replyDraft.trim() });
      await refreshAppState();
      setReplyDraft("");
      toast({ title: "Reply sent", description: `Message sent to ${activeConversation.displayName}.` });
    } catch (error) {
      toast({ title: "Reply failed", description: error instanceof Error ? error.message : "Could not send the WhatsApp reply.", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv && conv.unreadCount > 0) {
      void handleConversationUpdate({ id, unreadCount: 0 }, "Unread count cleared.");
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
                <Stat label="Open conversations" value={conversations.filter((c) => c.status === "Open").length.toString()} />
                <Stat label="Unread messages" value={conversations.reduce((sum, c) => sum + c.unreadCount, 0).toString()} />
                <Stat label="Lead-linked chats" value={conversations.filter((c) => c.source === "Meta Ads" || c.source === "WhatsApp Inbound").length.toString()} />
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
                  <input type="text" value={conversationSearch} onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Search threads" className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | "Open" | "Pending" | "Resolved")}
                    className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground">
                    {["All", "Open", "Pending", "Resolved"].map((v) => (<option key={v} value={v}>{v}</option>))}
                  </select>
                  <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value as "All" | "Mine" | "Unassigned")}
                    className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground">
                    {["All", "Mine", "Unassigned"].map((v) => (<option key={v} value={v}>{v}</option>))}
                  </select>
                  <Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly((c) => !c)}>Unread only</Button>
                </div>
              </div>
            </div>
            <ConversationList conversations={filteredConversations} selectedId={activeConversation?.id ?? null} onSelect={handleSelectConversation} />
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
                        <input value={assignmentDraft} onChange={(e) => setAssignmentDraft(e.target.value)} placeholder="Owner name"
                          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => { setAssignmentDraft(user?.name ?? ""); void handleConversationUpdate({ id: activeConversation.id, assignedTo: user?.name ?? null }, `Assigned to ${user?.name}.`); }}>Assign to me</Button>
                        <Button variant="outline" onClick={() => void handleConversationUpdate({ id: activeConversation.id, assignedTo: assignmentDraft.trim() || null }, assignmentDraft.trim() ? `Assigned to ${assignmentDraft.trim()}.` : "Unassigned.")}>Save owner</Button>
                        <Button variant="outline" onClick={() => void handleConversationUpdate({ id: activeConversation.id, status: "Pending", unreadCount: 0 }, "Moved to pending.")}>Mark pending</Button>
                        {activeConversation.status === "Resolved" ? <Button variant="outline" onClick={() => void handleConversationUpdate({ id: activeConversation.id, status: "Open", unreadCount: 0 }, "Reopened.")}>Reopen</Button> : null}
                        <Button onClick={() => void handleConversationUpdate({ id: activeConversation.id, status: "Resolved", unreadCount: 0 }, "Marked resolved.")}>Resolve</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
                    <NotesPanel notes={activeNotes} noteDraft={noteDraft} onDraftChange={setNoteDraft} onAddNote={() => void handleAddNote()} />
                    <ConversationTimeline events={activeEvents} />
                  </div>
                  <MessageThread messages={activeMessages} />
                  <ReplyComposer
                    draft={replyDraft} onDraftChange={setReplyDraft} onSend={() => void handleSendReply()}
                    cannedReplies={cannedReplies} onCannedReplySelect={setReplyDraft}
                    disabled={!whatsApp.connected} isSending={isSendingReply} displayName={activeConversation.displayName}
                  />
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
