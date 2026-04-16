import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  XCircle,
  Edit3,
  Building2,
  Filter,
  Search,
} from "lucide-react";
import {
  usePartnersListQuery,
  useApprovePartnerMutation,
  useRejectPartnerMutation,
  useUpdatePartnerCommissionMutation,
} from "@/hooks/useAppApi";
import type { Partner, PartnerStatus, PartnerType } from "@/lib/api/types";

const partnerStatusColors: Record<PartnerStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  suspended: "bg-gray-100 text-gray-700 border-gray-200",
};

const partnerTypeColors: Record<PartnerType, string> = {
  affiliate: "bg-blue-100 text-blue-700 border-blue-200",
  reseller: "bg-purple-100 text-purple-700 border-purple-200",
  white_label: "bg-amber-100 text-amber-700 border-amber-200",
  api_integration: "bg-teal-100 text-teal-700 border-teal-200",
};

const partnerTypeLabels: Record<PartnerType, string> = {
  affiliate: "Affiliate",
  reseller: "Reseller",
  white_label: "White Label",
  api_integration: "API/Integration",
};

const tierLabels = {
  standard: "Standard",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export default function PartnerManagement() {
  const { data: partners, isLoading } = usePartnersListQuery();
  const approveMutation = useApprovePartnerMutation();
  const rejectMutation = useRejectPartnerMutation();
  const updateCommissionMutation = useUpdatePartnerCommissionMutation();

  const [statusFilter, setStatusFilter] = useState<"all" | PartnerStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PartnerType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [commissionInput, setCommissionInput] = useState("");

  const filteredPartners = useMemo(() => {
    if (!partners) return [];
    return partners.filter((partner) => {
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
      const matchesType = typeFilter === "all" || partner.partnerType === typeFilter;
      const matchesSearch =
        searchQuery === "" ||
        partner.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [partners, statusFilter, typeFilter, searchQuery]);

  const handleApprove = async (partnerId: string) => {
    try {
      await approveMutation.mutateAsync(partnerId);
      toast({ title: "Partner approved", description: "The partner has been approved successfully" });
    } catch (error) {
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Could not approve partner",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (partnerId: string) => {
    try {
      await rejectMutation.mutateAsync(partnerId);
      toast({ title: "Partner rejected", description: "The partner has been rejected" });
    } catch (error) {
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Could not reject partner",
        variant: "destructive",
      });
    }
  };

  const handleCommissionEdit = (partner: Partner) => {
    setEditingCommission(partner.id);
    setCommissionInput(partner.commissionRate.toString());
  };

  const handleCommissionSave = async (partnerId: string) => {
    const rate = Number(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Invalid rate",
        description: "Commission rate must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCommissionMutation.mutateAsync({ partnerId, commissionRate: rate });
      toast({ title: "Commission updated", description: "The commission rate has been updated" });
      setEditingCommission(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update commission",
        variant: "destructive",
      });
    }
  };

  const handleCommissionCancel = () => {
    setEditingCommission(null);
    setCommissionInput("");
  };

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
                  <Building2 className="h-4 w-4" />
                  Partner Management
                </div>
                <h1 className="mt-5 text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground">
                  Manage Partner Program
                </h1>
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  Review partner applications, manage commission rates, and track partner performance.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Partners</p>
                <p className="mt-2 text-2xl font-display font-bold text-foreground">
                  {partners?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | PartnerStatus)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | PartnerType)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Partner Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
                  <SelectItem value="reseller">Reseller</SelectItem>
                  <SelectItem value="white_label">White Label</SelectItem>
                  <SelectItem value="api_integration">API/Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-[280px]"
            />
          </div>
        </motion.div>

        {/* Partners Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <CardHeader className="border-b border-border px-6 py-5">
              <CardTitle className="font-display text-lg font-semibold text-foreground">
                Partners
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredPartners.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Earned</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.contactName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {partner.companyName ?? "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{partner.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={partnerTypeColors[partner.partnerType]}
                            >
                              {partnerTypeLabels[partner.partnerType]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editingCommission === partner.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={commissionInput}
                                  onChange={(e) => setCommissionInput(e.target.value)}
                                  className="w-20 h-8"
                                  min={0}
                                  max={100}
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                              </div>
                            ) : (
                              <span className="text-sm">{partner.commissionRate}%</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">{tierLabels[partner.tier]}</span>
                          </TableCell>
                          <TableCell>{partner.totalReferrals}</TableCell>
                          <TableCell>Rs {partner.totalEarned.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={partnerStatusColors[partner.status]}
                            >
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {partner.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(partner.id)}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(partner.id)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {editingCommission === partner.id ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-green-600"
                                    onClick={() => handleCommissionSave(partner.id)}
                                    disabled={updateCommissionMutation.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    onClick={handleCommissionCancel}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCommissionEdit(partner)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    {partners?.length === 0 ? "No partners yet" : "No partners match your filters"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    {partners?.length === 0
                      ? "Partner applications will appear here for review and management."
                      : "Try adjusting your filters or search query to find partners."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
