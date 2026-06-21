import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, Save, TestTube, Send, Brain, AlertTriangle } from "lucide-react";

interface AiAgentConfig {
  id?: string;
  enabled: boolean;
  provider: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  fallbackMessage: string;
  escalationTriggers: string[];
  allowedTopics: string[];
  restrictedTopics: string[];
}

const defaultConfig: AiAgentConfig = {
  enabled: false,
  provider: "anthropic",
  model: "claude-sonnet-4-6",
  apiKey: "",
  systemPrompt: "You are a helpful customer support agent for our business. Be polite, professional, and helpful. If you cannot answer a question, suggest connecting with a human agent.",
  temperature: 0.7,
  maxTokens: 1024,
  fallbackMessage: "Let me connect you with a human agent who can help you better.",
  escalationTriggers: ["agent", "human", "complaint", "refund", "cancel"],
  allowedTopics: [],
  restrictedTopics: [],
};

export default function AiAgentPage() {
  const [config, setConfig] = useState<AiAgentConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testReply, setTestReply] = useState("");
  const [testEscalated, setTestEscalated] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetch("/ai-agent", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setConfig({
            ...defaultConfig,
            ...data.data,
            escalationTriggers: data.data.escalationTriggers ?? defaultConfig.escalationTriggers,
            allowedTopics: data.data.allowedTopics ?? [],
            restrictedTopics: data.data.restrictedTopics ?? [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/ai-agent", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Failed to save");
      toast.success("AI agent configuration saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) {
      toast.error("Enter a test message");
      return;
    }
    try {
      setIsTesting(true);
      setTestReply("");
      const response = await fetch("/ai-agent/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage }),
      });
      if (!response.ok) throw new Error("Test failed");
      const data = await response.json();
      setTestReply(data.data.reply);
      setTestEscalated(data.data.escalated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl p-8 text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Bot className="h-4 w-4" />
                  AI Agent
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">AI-powered WhatsApp agent</h1>
                <p className="mt-4 text-muted-foreground">
                  Configure an AI agent to automatically respond to customer messages using your knowledge base.
                </p>
              </div>
              <Button onClick={() => void handleSave()} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5" /> Model Configuration
            </h2>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Enable AI Agent</label>
              <label className="mt-2 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} className="h-4 w-4" />
                <span className="text-sm">{config.enabled ? "Enabled" : "Disabled"}</span>
              </label>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Provider</label>
              <select value={config.provider} onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm">
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai">OpenAI (GPT)</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Model</label>
              <select value={config.model} onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm">
                {config.provider === "anthropic" ? (
                  <>
                    <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                    <option value="claude-opus-4-8">Claude Opus 4.8</option>
                    <option value="claude-haiku-3-5">Claude Haiku 3.5</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">API Key</label>
              <input type="password" value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Temperature</label>
                <input type="number" step="0.1" min="0" max="2" value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) || 0.7 })}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max Tokens</label>
                <input type="number" min="1" max="8192" value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 1024 })}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Behavior Rules
            </h2>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">System Prompt</label>
              <textarea rows={6} value={config.systemPrompt} onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fallback Message</label>
              <input value={config.fallbackMessage} onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Escalation Triggers (comma-separated)</label>
              <input value={config.escalationTriggers.join(", ")}
                onChange={(e) => setConfig({ ...config, escalationTriggers: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="agent, human, complaint, refund"
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <TestTube className="h-5 w-5" /> Test AI Agent
          </h2>
          <div className="flex gap-3">
            <input value={testMessage} onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type a test message..."
              onKeyDown={(e) => e.key === "Enter" && void handleTest()}
              className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            <Button onClick={() => void handleTest()} disabled={isTesting}>
              <Send className="mr-2 h-4 w-4" />
              {isTesting ? "Testing..." : "Send"}
            </Button>
          </div>
          {testReply && (
            <div className={`rounded-xl border p-4 ${testEscalated ? "border-yellow-300 bg-yellow-50" : "border-green-300 bg-green-50"}`}>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {testEscalated ? "Escalated to Human" : "AI Reply"}
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{testReply}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
