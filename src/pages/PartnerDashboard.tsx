import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Award,
  Copy,
  CheckCircle2,
  Wallet,
  HandCoins,
  Building2,
} from "lucide-react";
import {
  usePartnerDashboardQuery,
  useRequestPayoutMutation,
} from "@/hooks/useAppApi";
import type { PartnerTier, ReferralStatus, PayoutStatus } from "@/lib/api/types";

const tierLabels: Record<PartnerTier, string> = {
  standard: "Standard",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

const tierColors: Record<PartnerTier, string> = {
  standard: "bg-muted text-muted-foreground",
  silver: "bg-slate-200 text-slate-700",
  gold: "bg-amber-100 text-amber-700",
  platinum: "bg-purple-100 text-purple-700",
};

const referralStatusColors: Record<ReferralStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  converted: "bg-green-100 text-green-700 border-green-200",
  expired: "bg-gray-100 text-gray-700 border-gray-200",
};

const payoutStatusColors: Record<PayoutStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

export default function PartnerDashboard() {
  const { data: dashboardData, isLoading: isLoadingDashboard } = usePartnerDashboardQuery();
  const requestPayoutMutation = useRequestPayoutMutation();

  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [accountDetails, setAccountDetails] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const partner = dashboardData?.partner;
  const stats = dashboardData?.stats;
  const referrals = dashboardData?.referrals ?? [];
  const payouts = dashboardData?.payouts ?? [];

  const handleCopyReferralCode = () => {
    if (partner?.referralCode) {
      navigator.clipboard.writeText(partner.referralCode);
      setCopiedCode(true);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    let paymentDetails: Record<string, unknown>;
    try {
      paymentDetails = accountDetails ? JSON.parse(accountDetails) : { details: accountDetails };
    } catch {
      paymentDetails = { details: accountDetails };
    }

    try {
      await requestPayoutMutation.mutateAsync({
        amount,
        paymentMethod,
        paymentDetails,
      });
      toast({ title: "Payout requested", description: "Your payout request has been submitted" });
      setShowPayoutDialog(false);
      setPayoutAmount("");
      setAccountDetails("");
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Could not request payout",
        variant: "destructive",
      });
    }
  };

  // Empty state - user is not a partner
  if (!partner && !isLoadingDashboard) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden"
          >
            <div className="relative px-8 py-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mt-6 text-2xl font-display font-bold text-foreground">Become a Partner</h1>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Join our partner program to earn commissions by referring new customers to WaBiz.
                </p>
                <Button className="mt-6" size="lg">
                  Apply Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card"
        >
          <div className="relative px-8 py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Award className="h-4 w-4" />
                  Partner Program
                </div>
                <h1 className="mt-5 text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground">
                  Welcome back, {partner?.contactName ?? "Partner"}
                </h1>
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  Track your referrals, commissions, and manage your partner account from this dashboard.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <div className="mt-2">
                    <Badge
                      className={
                        partner?.status === "approved"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : partner?.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {partner?.status === "approved"
                        ? "Approved"
                        : partner?.status === "pending"
                          ? "Pending Approval"
                          : partner?.status}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Referral Code</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground font-mono">
                      {partner?.referralCode ?? "N/A"}
                    </span>
                    {partner?.referralCode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopyReferralCode}
                      >
                        {copiedCode ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {isLoadingDashboard ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Referrals"
                value={stats?.totalReferrals?.toString() ?? "0"}
                icon={Users}
                subtitle="All time referrals"
              />
              <StatCard
                title="Commission Earned"
                value={`Rs ${(stats?.commissionEarned ?? 0).toLocaleString()}`}
                icon={DollarSign}
                subtitle="Lifetime earnings"
              />
              <StatCard
                title="Pending Payout"
                value={`Rs ${(stats?.pendingPayout ?? 0).toLocaleString()}`}
                icon={Clock}
                subtitle="Awaiting processing"
              />
              <StatCard
                title="Conversion Rate"
                value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`}
                icon={TrendingUp}
                subtitle="Referral to customer"
              />
              <Card className="bg-card rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Tier</p>
                    <p className="text-2xl font-display font-bold text-card-foreground mt-1">
                      {stats?.currentTier ? tierLabels[stats.currentTier] : "Standard"}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stats?.currentTier ? tierColors[stats.currentTier] : tierColors.standard}`}>
                    <Award className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          {/* Referrals Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
              <CardHeader className="border-b border-border px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-foreground">Your Referrals</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Track the status of your referred customers</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingDashboard ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : referrals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referred Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.referredEmail}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={referralStatusColors[referral.status]}
                            >
                              {referral.status}
                            </Badge>
                          </TableCell>
                          <TableCell>Rs {referral.commissionAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(referral.createdAt).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-4 text-base font-semibold text-foreground">No referrals yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Share your referral code to start earning commissions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payout History & Request */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
              <CardHeader className="border-b border-border px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg font-semibold text-foreground">Payout History</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Track your commission payouts</p>
                  </div>
                  <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                    <DialogTrigger asChild>
                      <Button variant="gradient" size="sm">
                        <HandCoins className="h-4 w-4 mr-2" />
                        Request Payout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Request Payout</DialogTitle>
                        <DialogDescription>
                          Request a payout for your earned commissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Amount (Rs)</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Available: Rs {(stats?.pendingPayout ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Payment Method</label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Account Details</label>
                          <textarea
                            placeholder="Enter account details (JSON or text)"
                            value={accountDetails}
                            onChange={(e) => setAccountDetails(e.target.value)}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRequestPayout}
                          disabled={requestPayoutMutation.isPending}
                        >
                          {requestPayoutMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingDashboard ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : payouts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">Rs {payout.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={payoutStatusColors[payout.status]}
                            >
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {payout.paymentMethod?.replace("_", " ") ?? "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Wallet className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-4 text-base font-semibold text-foreground">No payouts yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your payout history will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
