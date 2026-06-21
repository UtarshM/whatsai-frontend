import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Settings, Send, History, Plus, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface PaymentConfig {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

interface PaymentLink {
  id: string;
  shortUrl: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  createdAt: string;
}

export default function PaymentsPage() {
  const [config, setConfig] = useState<PaymentConfig>({ enabled: false, keyId: "", keySecret: "", webhookSecret: "" });
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [linkAmount, setLinkAmount] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"links" | "transactions">("links");

  useEffect(() => {
    Promise.all([
      fetch("/payments/config", { credentials: "include" }).then((r) => r.json()),
      fetch("/payments/links", { credentials: "include" }).then((r) => r.json()),
      fetch("/payments/transactions", { credentials: "include" }).then((r) => r.json()),
    ]).then(([configData, linksData, txData]) => {
      if (configData.data) setConfig(configData.data);
      setLinks(linksData.data ?? []);
      setTransactions(txData.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch("/payments/config", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Failed to save");
      toast.success("Payment configuration saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLink = async () => {
    const amount = parseFloat(linkAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      const response = await fetch("/payments/create-link", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description: linkDescription || undefined }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create link");
      }
      toast.success("Payment link created");
      setShowCreateLink(false);
      setLinkAmount("");
      setLinkDescription("");
      const linksData = await fetch("/payments/links", { credentials: "include" }).then((r) => r.json());
      setLinks(linksData.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create link");
    }
  };

  const totalRevenue = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const successfulPayments = transactions.filter((t) => t.status === "completed").length;
  const failedPayments = transactions.filter((t) => t.status === "failed").length;

  if (loading) {
    return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Payment management</h1>
                <p className="mt-4 text-muted-foreground">Configure Razorpay, create payment links, and track transactions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Revenue</p>
            <p className="mt-2 text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Successful Payments</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{successfulPayments}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Failed Payments</p>
            <p className="mt-2 text-2xl font-bold text-red-500">{failedPayments}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5" /> Razorpay Configuration
          </h2>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} className="h-4 w-4" />
            <span className="text-sm">Enable Razorpay</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Key ID</label>
              <input type="password" value={config.keyId} onChange={(e) => setConfig({ ...config, keyId: e.target.value })}
                placeholder="rzp_live_..." className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Key Secret</label>
              <input type="password" value={config.keySecret} onChange={(e) => setConfig({ ...config, keySecret: e.target.value })}
                placeholder="Enter key secret" className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Webhook Secret</label>
            <input type="password" value={config.webhookSecret} onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
              placeholder="Enter webhook secret" className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
          </div>
          <Button onClick={() => void handleSaveConfig()} disabled={saving}>{saving ? "Saving..." : "Save Configuration"}</Button>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5 flex items-center justify-between">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab("links")} className={`text-sm font-medium ${activeTab === "links" ? "text-primary" : "text-muted-foreground"}`}>
                Payment Links ({links.length})
              </button>
              <button onClick={() => setActiveTab("transactions")} className={`text-sm font-medium ${activeTab === "transactions" ? "text-primary" : "text-muted-foreground"}`}>
                Transactions ({transactions.length})
              </button>
            </div>
            {activeTab === "links" && (
              <Button size="sm" onClick={() => setShowCreateLink(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Link
              </Button>
            )}
          </div>

          {showCreateLink && (
            <div className="border-b border-border px-6 py-4 bg-muted/20">
              <div className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Amount (₹)</label>
                  <input type="number" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value)}
                    placeholder="1000" className="mt-1 h-10 w-32 rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <input value={linkDescription} onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="Payment for..." className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
                <Button size="sm" onClick={() => void handleCreateLink()}>Create</Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreateLink(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {activeTab === "links" ? (
            links.length > 0 ? (
              <div className="divide-y divide-border">
                {links.map((link) => (
                  <div key={link.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">₹{link.amount} - {link.description || "Payment"}</p>
                      <p className="text-xs text-muted-foreground">{link.status} · {new Date(link.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    {link.shortUrl && (
                      <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">No payment links yet</div>
            )
          ) : (
            transactions.length > 0 ? (
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tx.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <div>
                        <p className="text-sm font-semibold text-foreground">₹{tx.amount} {tx.currency}</p>
                        <p className="text-xs text-muted-foreground">{tx.method || "Unknown"} · {new Date(tx.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {tx.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">No transactions yet</div>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
