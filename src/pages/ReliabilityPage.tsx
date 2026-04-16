import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw, ShieldAlert, Siren, Webhook } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppContext";

export default function ReliabilityPage() {
  const {
    failedSendLogs,
    operationalLogs,
    retryFailedSend,
    refreshAppState,
  } = useAppContext();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const openFailedSends = useMemo(
    () => failedSendLogs.filter((log) => log.status !== "resolved"),
    [failedSendLogs],
  );
  const errorLogs = operationalLogs.filter((log) => log.level === "error");
  const warningLogs = operationalLogs.filter((log) => log.level === "warning");

  const handleRetry = async (failedSendLogId: string) => {
    try {
      setRetryingId(failedSendLogId);
      const result = await retryFailedSend({ failedSendLogId });
      await refreshAppState();
      toast({
        title: result.ok ? "Retry completed" : "Retry failed",
        description: result.message,
        variant: result.ok ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Could not retry the failed send.",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
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
                  <ShieldAlert className="h-4 w-4" />
                  Reliability operations
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Protect message delivery, catch failures early, and recover without guesswork</h1>
                <p className="mt-4 text-muted-foreground">
                  This workspace is for operational confidence: failed sends, retry actions, webhook stability, and the latest backend reliability signals in one place.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <TopStat label="Open failed sends" value={openFailedSends.length.toString()} />
                <TopStat label="Error logs" value={errorLogs.length.toString()} />
                <TopStat label="Warnings" value={warningLogs.length.toString()} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Failed sends</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Retries, recoverable failures, and destinations that need attention.</p>
                </div>
                <Button variant="outline" onClick={() => void refreshAppState()}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {failedSendLogs.length > 0 ? failedSendLogs.map((log) => (
                <div key={log.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr,auto] lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground">{log.channel}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] ${
                        log.status === "resolved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{log.destination}</p>
                    <p className="text-sm text-muted-foreground">{log.errorMessage}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Target: {log.targetType}</span>
                      {log.templateName ? <span>Template: {log.templateName}</span> : null}
                      <span>{new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                  </div>
                  {log.status !== "resolved" ? (
                    <Button
                      variant="outline"
                      disabled={retryingId === log.id}
                      onClick={() => void handleRetry(log.id)}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {retryingId === log.id ? "Retrying..." : "Retry"}
                    </Button>
                  ) : (
                    <div className="text-xs font-medium text-success">Recovered</div>
                  )}
                </div>
              )) : (
                <EmptyBlock
                  icon={Siren}
                  title="No failed sends right now"
                  body="This table will populate when campaigns, inbox replies, templates, or automations hit provider-side send failures."
                />
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Operational log</h2>
              <p className="mt-1 text-sm text-muted-foreground">Recent system events across sends, retries, and webhook processing.</p>
            </div>
            <div className="divide-y divide-border">
              {operationalLogs.length > 0 ? operationalLogs.map((log) => (
                <div key={log.id} className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                      log.level === "error"
                        ? "bg-destructive/10 text-destructive"
                        : log.level === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-primary/10 text-primary"
                    }`}>
                      {log.eventType.includes("webhook") ? <Webhook className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{log.summary}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                          log.level === "error"
                            ? "bg-destructive/10 text-destructive"
                            : log.level === "warning"
                              ? "bg-warning/10 text-warning"
                              : "bg-primary/10 text-primary"
                        }`}>
                          {log.level}
                        </span>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{log.eventType}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyBlock
                  icon={Webhook}
                  title="No operations logged yet"
                  body="As sends, retries, and webhooks move through the backend, the latest operational events will appear here."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof AlertTriangle;
  title: string;
  body: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
