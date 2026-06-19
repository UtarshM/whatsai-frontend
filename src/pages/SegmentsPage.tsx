import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  Filter,
  Plus,
  Trash2,
  Users,
  Pencil,
  X,
  Eye,
  Layers,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useSegmentsQuery,
  useCreateSegmentMutation,
  useUpdateSegmentMutation,
  useDeleteSegmentMutation,
  usePreviewSegmentMutation,
} from "@/hooks/useAdvancedApi";
import type {
  Segment,
  SegmentCondition,
  SegmentFilter,
  SegmentPreview,
} from "@/lib/api/advanced";

const FIELD_OPTIONS = [
  { value: "tag", label: "Tag" },
  { value: "optInStatus", label: "Opt-in status" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "createdAt", label: "Created date" },
  { value: "lastMessageAt", label: "Last message date" },
  { value: "attribute", label: "Custom attribute" },
] as const;

const OPS_BY_FIELD: Record<string, { value: string; label: string }[]> = {
  tag: [
    { value: "hasAny", label: "has any of" },
    { value: "hasAll", label: "has all of" },
    { value: "hasNone", label: "has none of" },
  ],
  optInStatus: [
    { value: "eq", label: "is" },
    { value: "in", label: "is one of" },
  ],
  name: [
    { value: "contains", label: "contains" },
    { value: "eq", label: "is" },
  ],
  email: [
    { value: "contains", label: "contains" },
    { value: "eq", label: "is" },
  ],
  phone: [
    { value: "contains", label: "contains" },
    { value: "eq", label: "is" },
  ],
  createdAt: [
    { value: "before", label: "before" },
    { value: "after", label: "after" },
    { value: "between", label: "between" },
    { value: "exists", label: "exists" },
    { value: "missing", label: "is missing" },
  ],
  lastMessageAt: [
    { value: "before", label: "before" },
    { value: "after", label: "after" },
    { value: "between", label: "between" },
    { value: "exists", label: "exists" },
    { value: "missing", label: "is missing" },
  ],
  attribute: [
    { value: "eq", label: "equals" },
    { value: "contains", label: "contains" },
    { value: "exists", label: "exists" },
    { value: "missing", label: "is missing" },
  ],
};

function defaultConditionForField(field: string): SegmentCondition {
  switch (field) {
    case "tag":
      return { field: "tag", op: "hasAny", value: [] };
    case "optInStatus":
      return { field: "optInStatus", op: "eq", value: "opt_in" };
    case "name":
    case "email":
    case "phone":
      return { field, op: "contains", value: "" } as SegmentCondition;
    case "createdAt":
    case "lastMessageAt":
      return { field, op: "after", value: "" } as SegmentCondition;
    case "attribute":
      return { field: "attribute", key: "", op: "eq", value: "" };
    default:
      return { field: "tag", op: "hasAny", value: [] };
  }
}

const inputClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm";

function ConditionRow({
  condition,
  onChange,
  onRemove,
}: {
  condition: SegmentCondition;
  onChange: (next: SegmentCondition) => void;
  onRemove: () => void;
}) {
  const ops = OPS_BY_FIELD[condition.field] ?? [];
  const showValue =
    !("op" in condition && (condition.op === "exists" || condition.op === "missing"));

  const setField = (field: string) => onChange(defaultConditionForField(field));
  const setOp = (op: string) => onChange({ ...condition, op } as SegmentCondition);

  return (
    <div className="grid items-center gap-2 rounded-xl border border-border bg-background/60 p-3 md:grid-cols-[160px_150px_1fr_auto]">
      <select className={inputClass} value={condition.field} onChange={(e) => setField(e.target.value)}>
        {FIELD_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select className={inputClass} value={(condition as { op: string }).op} onChange={(e) => setOp(e.target.value)}>
        {ops.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="min-w-0">
        {condition.field === "attribute" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="attribute name"
              value={condition.key}
              onChange={(e) => onChange({ ...condition, key: e.target.value })}
            />
            {showValue && (
              <input
                className={inputClass}
                placeholder="value"
                value={condition.value ?? ""}
                onChange={(e) => onChange({ ...condition, value: e.target.value })}
              />
            )}
          </div>
        ) : condition.field === "tag" ? (
          <input
            className={inputClass}
            placeholder="VIP, Shopify (comma separated)"
            value={condition.value.join(", ")}
            onChange={(e) =>
              onChange({
                ...condition,
                value: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
        ) : condition.field === "optInStatus" ? (
          <input
            className={inputClass}
            placeholder={condition.op === "in" ? "opt_in, pending" : "opt_in / opt_out / pending"}
            value={Array.isArray(condition.value) ? condition.value.join(", ") : condition.value}
            onChange={(e) =>
              onChange({
                ...condition,
                value:
                  condition.op === "in"
                    ? e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    : e.target.value,
              })
            }
          />
        ) : condition.field === "createdAt" || condition.field === "lastMessageAt" ? (
          showValue &&
          (condition.op === "between" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                className={inputClass}
                value={Array.isArray(condition.value) ? condition.value[0] : ""}
                onChange={(e) =>
                  onChange({
                    ...condition,
                    value: [e.target.value, Array.isArray(condition.value) ? condition.value[1] ?? "" : ""],
                  })
                }
              />
              <input
                type="date"
                className={inputClass}
                value={Array.isArray(condition.value) ? condition.value[1] : ""}
                onChange={(e) =>
                  onChange({
                    ...condition,
                    value: [Array.isArray(condition.value) ? condition.value[0] ?? "" : "", e.target.value],
                  })
                }
              />
            </div>
          ) : (
            <input
              type="date"
              className={inputClass}
              value={typeof condition.value === "string" ? condition.value : ""}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
            />
          ))
        ) : (
          // name / email / phone
          <input
            className={inputClass}
            placeholder="value"
            value={(condition as { value: string }).value}
            onChange={(e) => onChange({ ...condition, value: e.target.value } as SegmentCondition)}
          />
        )}
        {!showValue && <span className="text-xs text-muted-foreground">No value needed</span>}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove condition"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface BuilderState {
  id: string | null;
  name: string;
  description: string;
  match: "all" | "any";
  conditions: SegmentCondition[];
}

const emptyBuilder: BuilderState = {
  id: null,
  name: "",
  description: "",
  match: "all",
  conditions: [{ field: "tag", op: "hasAny", value: [] }],
};

export default function SegmentsPage() {
  const { data, isLoading } = useSegmentsQuery();
  const createSegment = useCreateSegmentMutation();
  const updateSegment = useUpdateSegmentMutation();
  const deleteSegment = useDeleteSegmentMutation();
  const previewSegment = usePreviewSegmentMutation();

  const [builder, setBuilder] = useState<BuilderState | null>(null);
  const [preview, setPreview] = useState<SegmentPreview | null>(null);

  const segments = data?.segments ?? [];

  const filter = useMemo<SegmentFilter>(
    () => ({ match: builder?.match ?? "all", conditions: builder?.conditions ?? [] }),
    [builder],
  );

  const openCreate = () => {
    setPreview(null);
    setBuilder({ ...emptyBuilder, conditions: [{ field: "tag", op: "hasAny", value: [] }] });
  };

  const openEdit = (segment: Segment) => {
    setPreview(null);
    setBuilder({
      id: segment.id,
      name: segment.name,
      description: segment.description ?? "",
      match: segment.filters?.match ?? "all",
      conditions: segment.filters?.conditions ?? [],
    });
  };

  const runPreview = async () => {
    try {
      const result = await previewSegment.mutateAsync({ filters: filter, sampleSize: 10 });
      setPreview(result);
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Could not preview this audience.",
        variant: "destructive",
      });
    }
  };

  const save = async () => {
    if (!builder) return;
    if (!builder.name.trim()) {
      toast({ title: "Name required", description: "Give this segment a name before saving." });
      return;
    }
    const payload = {
      name: builder.name.trim(),
      description: builder.description.trim() || undefined,
      filters: filter,
    };
    try {
      if (builder.id) {
        await updateSegment.mutateAsync({ id: builder.id, input: payload });
        toast({ title: "Segment updated", description: `"${payload.name}" saved.` });
      } else {
        await createSegment.mutateAsync(payload);
        toast({ title: "Segment created", description: `"${payload.name}" is ready to target.` });
      }
      setBuilder(null);
      setPreview(null);
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save the segment.",
        variant: "destructive",
      });
    }
  };

  const remove = async (segment: Segment) => {
    if (!window.confirm(`Delete segment "${segment.name}"?`)) return;
    try {
      await deleteSegment.mutateAsync(segment.id);
      toast({ title: "Segment deleted", description: `"${segment.name}" removed.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete the segment.",
        variant: "destructive",
      });
    }
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
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Layers className="h-4 w-4" />
                  Saved audiences
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Segments</h1>
                <p className="mt-3 text-muted-foreground">
                  Build reusable, rule-based audiences over your contacts. Segments resolve live, so
                  every campaign targets the contacts that match right now.
                </p>
              </div>
              <Button variant="gradient" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> New Segment
              </Button>
            </div>
          </div>
        </motion.div>

        {builder && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold text-foreground">
                {builder.id ? "Edit segment" : "New segment"}
              </h2>
              <button
                onClick={() => setBuilder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Close builder"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Segment name</label>
                <input
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder="VIP customers"
                  value={builder.name}
                  onChange={(e) => setBuilder({ ...builder, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Description (optional)</label>
                <input
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder="High-value repeat buyers"
                  value={builder.description}
                  onChange={(e) => setBuilder({ ...builder, description: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Match</span>
              <div className="inline-flex rounded-xl border border-border p-1">
                {(["all", "any"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setBuilder({ ...builder, match: m })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      builder.match === m ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "all" ? "All conditions (AND)" : "Any condition (OR)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {builder.conditions.map((condition, index) => (
                <ConditionRow
                  key={index}
                  condition={condition}
                  onChange={(next) =>
                    setBuilder({
                      ...builder,
                      conditions: builder.conditions.map((c, i) => (i === index ? next : c)),
                    })
                  }
                  onRemove={() =>
                    setBuilder({
                      ...builder,
                      conditions: builder.conditions.filter((_, i) => i !== index),
                    })
                  }
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setBuilder({
                    ...builder,
                    conditions: [...builder.conditions, { field: "tag", op: "hasAny", value: [] }],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add condition
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={runPreview} disabled={previewSegment.isPending}>
                <Eye className="h-4 w-4 mr-1" /> {previewSegment.isPending ? "Previewing…" : "Preview audience"}
              </Button>
              <Button variant="gradient" onClick={save} disabled={createSegment.isPending || updateSegment.isPending}>
                {builder.id ? "Save changes" : "Create segment"}
              </Button>
            </div>

            {preview && (
              <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {preview.total.toLocaleString()} matching contact{preview.total === 1 ? "" : "s"}
                </p>
                {preview.sample.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {preview.sample.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                        <span className="font-medium text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No contacts match these rules yet.</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        <div className="grid gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading segments…</p>}
          {!isLoading &&
            segments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Filter className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{segment.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {segment.description || `${segment.filters?.conditions?.length ?? 0} rule(s) · match ${segment.filters?.match ?? "all"}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {(segment.contactCount ?? 0).toLocaleString()} contacts
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(segment)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => remove(segment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          {!isLoading && segments.length === 0 && !builder && (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-card px-6 py-12 text-center shadow-card">
              <p className="text-base font-semibold text-foreground">No segments yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first saved audience to target campaigns by tags, attributes, and activity.
              </p>
              <Button variant="gradient" className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> New Segment
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
