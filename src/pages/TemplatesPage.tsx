import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText, Plus, Send, ShieldCheck, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";

const statusConfig = {
  Approved: { icon: CheckCircle2, className: "bg-success/10 text-success" },
  Pending: { icon: Clock, className: "bg-warning/10 text-warning" },
  Rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

export default function TemplatesPage() {
  const { templates } = useAppContext();
  const approvedCount = templates.filter((template) => template.status === "Approved").length;

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
                  <ShieldCheck className="h-4 w-4" />
                  Approval-aware template system
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage the approved messaging layer behind every campaign</h1>
                <p className="mt-4 text-muted-foreground">
                  Templates are positioned here as a governance asset, not just content blocks. Teams can see approval state, category separation, and use-ready assets in one place.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Templates</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{templates.length} total</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{approvedCount} ready</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Purpose</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Utility + marketing</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Template library</h2>
            <p className="text-muted-foreground mt-1">Create, review, and activate WhatsApp message templates</p>
          </div>
          <Button variant="gradient" size="sm" onClick={() => toast({ title: "Template builder", description: "The data model is ready for a full create-template flow next." })}>
            <Plus className="h-4 w-4 mr-1" /> Create Template
          </Button>
        </div>

        <div className="grid gap-4">
          {templates.map((template, index) => {
            const statusInfo = statusConfig[template.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4 mb-4 flex-col lg:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-semibold text-foreground">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{template.language}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {template.status}
                    </span>
                    {template.status === "Approved" && (
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Template selected", description: `${template.name} is ready to use in campaigns.` })}>
                        <Send className="h-3.5 w-3.5 mr-1" /> Use
                      </Button>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground font-mono">
                  {template.preview}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
