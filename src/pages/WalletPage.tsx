import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Send,
  TrendingDown,
  Wallet as WalletIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function WalletPage() {
  const navigate = useNavigate();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState("");
  const { walletBalance, totalSpent, messagesSent, transactions, addWalletFunds, lowBalanceThreshold } = useAppContext();

  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);

  const handleAddMoney = async () => {
    const result = await addWalletFunds(Number(amount));
    if (!result.ok) {
      toast({ title: "Recharge failed", description: result.message });
      return;
    }

    toast({ title: "Balance updated", description: result.message });
    setAmount("");
    setShowAddMoney(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <WalletIcon className="h-4 w-4" />
                  Finance-safe campaign wallet
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Keep prepaid WhatsApp spending visible and under control</h1>
                <p className="mt-4 text-muted-foreground">
                  The wallet is now framed like an operating reserve, not just a balance card. Teams can top up, monitor deductions, and keep sends from failing silently.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Balance</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {walletBalance.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spent</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {totalSpent.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Messages</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{messagesSent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {walletBalance <= lowBalanceThreshold && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Low reserve warning</p>
              <p className="text-muted-foreground">Top up now to keep broadcast operations and scheduled campaigns moving without interruption.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Current Balance" value={`Rs ${walletBalance.toLocaleString()}`} icon={WalletIcon} />
          <StatCard title="Total Spent" value={`Rs ${totalSpent.toLocaleString()}`} icon={TrendingDown} subtitle="Across campaigns" />
          <StatCard title="Messages Sent" value={messagesSent.toLocaleString()} icon={Send} subtitle="@ Rs 0.50/msg avg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Wallet ledger</h2>
              <p className="text-sm text-muted-foreground mt-1">Track credits, campaign deductions, and resulting balance movements</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
                Full history
              </Button>
              <Button variant="gradient" size="sm" onClick={() => setShowAddMoney((value) => !value)}>
                <Plus className="h-4 w-4 mr-1" /> Add Money
              </Button>
            </div>
          </div>

          {showAddMoney && (
            <div className="border-b border-border bg-muted/30 px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="number"
                  placeholder="Enter amount (Rs)"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm"
                />
                <Button variant="default" onClick={handleAddMoney}>
                  Proceed to Pay
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-border">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="px-6 py-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="h-4 w-4 text-success" />
                        : <ArrowUpRight className="h-4 w-4 text-destructive" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tx.desc}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-success" : "text-destructive"}`}>
                        {tx.type === "credit" ? "+" : ""}Rs {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Balance after: Rs {tx.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
