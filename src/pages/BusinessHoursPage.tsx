import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Clock, Save } from "lucide-react";

interface BusinessHoursEntry {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  timezone: string;
  welcomeMessage: string | null;
  offHoursMessage: string | null;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultEntry = (dayOfWeek: number): BusinessHoursEntry => ({
  dayOfWeek,
  openTime: "09:00",
  closeTime: "18:00",
  isClosed: dayOfWeek === 0,
  timezone: "Asia/Kolkata",
  welcomeMessage: null,
  offHoursMessage: "Thanks for reaching out! Our business hours are Mon-Sat 9 AM - 6 PM. We'll get back to you soon.",
});

export default function BusinessHoursPage() {
  const [entries, setEntries] = useState<BusinessHoursEntry[]>(dayNames.map((_, i) => defaultEntry(i)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [offHoursMessage, setOffHoursMessage] = useState("");

  const fetchHours = async () => {
    try {
      const response = await fetch("/business-hours", { credentials: "include" });
      const data = await response.json();
      const existing = data.data ?? [];
      if (existing.length > 0) {
        setEntries(dayNames.map((_, i) => {
          const found = existing.find((e: BusinessHoursEntry) => e.dayOfWeek === i);
          return found ?? defaultEntry(i);
        }));
        setWelcomeMessage(existing[0]?.welcomeMessage ?? "");
        setOffHoursMessage(existing[0]?.offHoursMessage ?? "");
      }
    } catch {
      toast({ title: "Error", description: "Failed to load business hours", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHours(); }, []);

  const updateEntry = (dayOfWeek: number, field: keyof BusinessHoursEntry, value: unknown) => {
    setEntries((prev) => prev.map((e) =>
      e.dayOfWeek === dayOfWeek ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = entries.map((e) => ({
        ...e,
        welcomeMessage: welcomeMessage || undefined,
        offHoursMessage: offHoursMessage || undefined,
      }));
      const response = await fetch("/business-hours/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save");
      toast({ title: "Business hours saved" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" />
                  Business Hours
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Set your availability</h1>
                <p className="mt-4 text-muted-foreground">
                  Configure business hours to enable automatic off-hours replies and manage customer expectations.
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Weekly Schedule</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <div key={entry.dayOfWeek} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-semibold text-foreground">{dayNames[entry.dayOfWeek]}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!entry.isClosed}
                      onChange={(e) => updateEntry(entry.dayOfWeek, "isClosed", !e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm text-muted-foreground">{entry.isClosed ? "Closed" : "Open"}</span>
                  </label>
                  {!entry.isClosed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={entry.openTime}
                        onChange={(e) => updateEntry(entry.dayOfWeek, "openTime", e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={entry.closeTime}
                        onChange={(e) => updateEntry(entry.dayOfWeek, "closeTime", e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Auto-Reply Messages</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Welcome Message (first inbound)</label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                placeholder="Hi! Thanks for contacting us. How can we help?"
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Off-Hours Message</label>
              <textarea
                value={offHoursMessage}
                onChange={(e) => setOffHoursMessage(e.target.value)}
                rows={3}
                placeholder="Thanks for reaching out! Our business hours are Mon-Sat 9 AM - 6 PM."
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
