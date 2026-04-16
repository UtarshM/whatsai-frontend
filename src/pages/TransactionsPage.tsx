import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarRange,
  CreditCard,
  Filter,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

type RangeFilter = "all" | "7" | "30" | "90";
type TypeFilter = "all" | "credit" | "debit";

export default function TransactionsPage() {
  const { transactions } = useAppContext();
  const [range, setRange] = useState<RangeFilter>("30");
  const [type, setType] = useState<TypeFilter>("all");

  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const rangeDays = range === "all" ? Number.POSITIVE_INFINITY : Number(range);

    return transactions.filter((transaction) => {
      const ageInDays = (now - new Date(transaction.date).getTime()) / (1000 * 60 * 60 * 24);
      const matchesRange = ageInDays <= rangeDays;
      const matchesType = type === "all" ? true : transaction.type === type;
      return matchesRange && matchesType;
    });
  }, [range, transactions, type]);

  const creditTotal = useMemo(
    () => filteredTransactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [filteredTransactions],
  );

  const debitTotal = useMemo(
    () => filteredTransactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [filteredTransactions],
  );

  const latestBalance = filteredTransactions[0]?.balance ?? transactions[0]?.balance ?? 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card"
        >
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <ReceiptText className="h-4 w-4" />
                  Finance and audit visibility
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">
                  Review every wallet movement with campaign-grade clarity
                </h1>
                <p className="mt-4 text-muted-foreground">
                  Keep credits, debits, and resulting balances visible for operators, finance teams, and founders.
                  This ledger is designed to make campaign spending explainable instead of opaque.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entries</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{filteredTransactions.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Credits</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {creditTotal.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Debits</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {debitTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Ledger Balance" value={`Rs ${latestBalance.toLocaleString()}`} icon={Wallet} />
          <StatCard title="Incoming Funds" value={`Rs ${creditTotal.toLocaleString()}`} icon={ArrowDownLeft} subtitle="Top-ups and credits" />
          <StatCard title="Spend Recorded" value={`Rs ${debitTotal.toLocaleString()}`} icon={CreditCard} subtitle="Campaign deductions" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex flex-col gap-5 border-b border-border px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Ledger filters</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Narrow by operating window and transaction type to investigate spend patterns faster.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap gap-2">
                {(["all", "7", "30", "90"] as RangeFilter[]).map((value) => (
                  <Button
                    key={value}
                    variant={range === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRange(value)}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {value === "all" ? "All time" : `Last ${value} days`}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "credit", "debit"] as TypeFilter[]).map((value) => (
                  <Button
                    key={value}
                    variant={type === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType(value)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {value === "all" ? "All types" : value === "credit" ? "Credits" : "Debits"}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-[1.6fr,0.85fr,0.75fr,0.9fr] gap-4 border-b border-border px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <span>Description</span>
            <span>Date</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-border">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-5 transition-colors hover:bg-muted/30">
                  <div className="grid gap-4 md:grid-cols-[1.6fr,0.85fr,0.75fr,0.9fr] md:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          transaction.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{transaction.desc}</p>
                        <p className="text-xs text-muted-foreground">
                          Balance after event: Rs {transaction.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </div>

                    <div>
                      <span className="inline-flex rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium capitalize text-foreground">
                        {transaction.type}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-semibold md:text-right ${
                        transaction.type === "credit" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : ""}Rs {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-14 text-center">
                <p className="text-base font-semibold text-foreground">No transactions match this filter</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Change the date range or transaction type to bring more ledger activity into view.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
