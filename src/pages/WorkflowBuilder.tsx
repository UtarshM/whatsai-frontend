import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  Handle,
  Panel,
  Position,
  ReactFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bot, Clock3, GitBranch, MessageSquareMore, Plus, Save, Tag, Trash2, Waypoints } from "lucide-react";
import { toast } from "sonner";
import { fetchAutomationFlowDefinitions, saveAutomationFlowDefinition } from "@/lib/automation/server";
import { useAppContext } from "@/context/AppContext";
import type { AutomationFlowDefinition, AutomationFlowNodeData, AutomationFlowNodeType } from "@/lib/api";

type FlowNode = Node<AutomationFlowNodeData>;
type FlowEdge = Edge;

function NodeFrame({
  color,
  icon,
  title,
  subtitle,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`w-56 rounded-xl border-2 bg-white px-4 py-3 shadow-md ${color}`}>
      <Handle type="target" position={Position.Top} className="h-3 w-3" />
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  );
}

const TriggerNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <div className="w-56 rounded-xl border-2 border-primary bg-white px-4 py-3 shadow-md">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Waypoints size={16} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">Trigger</p>
        <p className="text-xs text-muted-foreground">
          {data.triggerType === "contacted_lead" ? "Lead marked contacted" : data.triggerType === "new_inbound" ? "New inbound chat" : "New lead captured"}
        </p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-primary" />
  </div>
);

const MessageNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <NodeFrame
    color="border-blue-500"
    icon={<MessageSquareMore size={16} className="text-blue-600" />}
    title="Send Template"
    subtitle={data.templateName || "Choose an approved template"}
  />
);

const InteractiveNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <NodeFrame
    color="border-emerald-500"
    icon={<Bot size={16} className="text-emerald-600" />}
    title="Interactive Reply"
    subtitle={data.body || "Prompt with buttons"}
  >
    <div className="mt-3 flex flex-wrap gap-1">
      {(data.buttons ?? []).map((button) => (
        <span key={button.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
          {button.title}
        </span>
      ))}
    </div>
  </NodeFrame>
);

const WaitNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <NodeFrame
    color="border-orange-500"
    icon={<Clock3 size={16} className="text-orange-600" />}
    title="Wait"
    subtitle={`${data.hours || 2} hour delay`}
  />
);

const TagNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <NodeFrame
    color="border-fuchsia-500"
    icon={<Tag size={16} className="text-fuchsia-600" />}
    title="Apply Tag"
    subtitle={data.tag || "Tag the contact"}
  />
);

const ConditionNode = ({ data }: { data: AutomationFlowNodeData }) => (
  <div className="w-60 rounded-xl border-2 border-purple-500 bg-white px-4 py-3 shadow-md">
    <Handle type="target" position={Position.Top} className="h-3 w-3" />
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
        <GitBranch size={16} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">Condition</p>
        <p className="text-xs text-muted-foreground">Has tag: {data.tag || "Joined"}</p>
      </div>
    </div>
    <div className="mt-3 flex justify-between text-[10px] font-bold text-muted-foreground">
      <span>TRUE</span>
      <span>FALSE</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" className="left-[28%] h-3 w-3 bg-green-500" />
    <Handle type="source" position={Position.Bottom} id="false" className="left-[72%] h-3 w-3 bg-red-500" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  lead_trigger: TriggerNode,
  send_message: MessageNode,
  send_interactive: InteractiveNode,
  wait: WaitNode,
  condition: ConditionNode,
  tag: TagNode,
};

const initialNodes: FlowNode[] = [
  {
    id: "node-trigger",
    type: "trigger",
    data: { triggerType: "new_lead" },
    position: { x: 250, y: 40 },
  },
];

const initialEdges: FlowEdge[] = [];

function defaultNodeData(type: AutomationFlowNodeType): AutomationFlowNodeData {
  if (type === "wait") return { hours: 2 };
  if (type === "send_message") return { templateName: "", languageCode: "en" };
  if (type === "send_interactive") {
    return {
      body: "Choose the next step",
      buttons: [
        { id: "btn-1", title: "Interested" },
        { id: "btn-2", title: "Later" },
      ],
    };
  }
  if (type === "condition") return { type: "has_tag", tag: "Interested" };
  if (type === "tag") return { tag: "Qualified" };
  return { triggerType: "new_lead" };
}

function WorkflowBuilderInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("id");
  const { approvedTemplates } = useAppContext();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodes[0].id);
  const [flowName, setFlowName] = useState("Lead Nurture Flow");
  const [flowDescription, setFlowDescription] = useState("Capture, qualify, and progress a lead through a chatbot-style sequence.");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  useEffect(() => {
    if (!flowId) {
      return;
    }

    const loadFlow = async () => {
      try {
        setIsLoading(true);
        const flows = await fetchAutomationFlowDefinitions();
        const flow = flows.find((item) => item.id === flowId);
        if (!flow) {
          toast.error("Workflow not found.");
          return;
        }
        setFlowName(flow.name);
        setFlowDescription(flow.description ?? "");
        setIsActive(flow.isActive);
        setNodes((flow.nodes as FlowNode[])?.length ? (flow.nodes as FlowNode[]) : initialNodes);
        setEdges((flow.edges as FlowEdge[]) ?? []);
        setSelectedNodeId((flow.nodes as FlowNode[])?.[0]?.id ?? initialNodes[0].id);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to load workflow.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadFlow();
  }, [flowId, setEdges, setNodes]);

  const onConnect = (params: Connection) => setEdges((current) => addEdge({ ...params, id: `edge-${Date.now()}` }, current));

  const addNode = (type: AutomationFlowNodeType) => {
    const nextNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      data: defaultNodeData(type),
      position: { x: 120 + Math.random() * 380, y: 120 + Math.random() * 280 },
    };
    setNodes((current) => [...current, nextNode]);
    setSelectedNodeId(nextNode.id);
  };

  const updateSelectedNode = (nextData: AutomationFlowNodeData) => {
    if (!selectedNode) return;
    setNodes((current) => current.map((node) => (
      node.id === selectedNode.id ? { ...node, data: { ...node.data, ...nextData } } : node
    )));
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) {
      return;
    }
    setNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
  };

  const handleSave = async () => {
    if (!flowName.trim()) {
      toast.error("Please enter a flow name before saving.");
      return;
    }
    if (nodes.length === 0) {
      toast.error("Add at least one node before saving.");
      return;
    }

    try {
      setIsSaving(true);
      await saveAutomationFlowDefinition({
        id: flowId ?? undefined,
        name: flowName.trim(),
        description: flowDescription.trim(),
        nodes: nodes as any,
        edges: edges as any,
        isActive,
      });
      toast.success(flowId ? "Flow updated successfully!" : "Flow saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save flow.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/automations")}>
                <ArrowLeft size={20} />
              </Button>
              <div className="min-w-0">
                <Input
                  value={flowName}
                  onChange={(event) => setFlowName(event.target.value)}
                  placeholder="Flow name"
                  className="w-80 text-base font-bold border-0 shadow-none focus-visible:ring-0 px-0"
                />
                <Input
                  value={flowDescription}
                  onChange={(event) => setFlowDescription(event.target.value)}
                  placeholder="Describe what this chatbot journey should do"
                  className="w-[28rem] text-sm border-0 shadow-none focus-visible:ring-0 px-0 text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
                <span>{isActive ? "Active" : "Draft"}</span>
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              </label>
              <Button variant="outline" onClick={() => navigate("/automations")}>Cancel</Button>
              <Button onClick={() => void handleSave()} className="gap-2" disabled={isSaving || isLoading}>
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Flow"}
              </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dot-pattern"
              >
                <Background />
                <Controls />
                <Panel position="top-right">
                  <Card className="p-3 flex flex-col gap-2 w-48">
                    <p className="text-xs font-bold text-muted-foreground px-1">Add Step</p>
                    <Button variant="outline" size="sm" onClick={() => addNode("send_message")}>Template Message</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode("send_interactive")}>Interactive Reply</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode("wait")}>Delay</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode("condition")}>Condition</Button>
                    <Button variant="outline" size="sm" onClick={() => addNode("tag")}>Tag Contact</Button>
                  </Card>
                </Panel>
              </ReactFlow>
            </div>

            <div className="w-[360px] border-l bg-white p-6 overflow-y-auto">
              {selectedNode ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Step Settings</h2>
                      <p className="text-xs text-muted-foreground mt-1">{selectedNode.type}</p>
                    </div>
                    {selectedNode.type !== "trigger" && selectedNode.type !== "lead_trigger" && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDeleteSelectedNode}>
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label>Step ID</Label>
                      <Input value={selectedNode.id} disabled className="bg-muted mt-2" />
                    </div>

                    {(selectedNode.type === "trigger" || selectedNode.type === "lead_trigger") && (
                      <div>
                        <Label>Trigger Type</Label>
                        <select
                          value={selectedNode.data.triggerType ?? "new_lead"}
                          onChange={(event) => updateSelectedNode({ triggerType: event.target.value as AutomationFlowNodeData["triggerType"] })}
                          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                        >
                          <option value="new_lead">New lead captured</option>
                          <option value="new_inbound">New inbound chat</option>
                          <option value="contacted_lead">Lead marked contacted</option>
                        </select>
                      </div>
                    )}

                    {selectedNode.type === "wait" && (
                      <div>
                        <Label>Wait Hours</Label>
                        <Input
                          type="number"
                          min={1}
                          value={selectedNode.data.hours ?? 2}
                          className="mt-2"
                          onChange={(event) => updateSelectedNode({ hours: Number(event.target.value) || 1 })}
                        />
                      </div>
                    )}

                    {selectedNode.type === "send_message" && (
                      <>
                        <div>
                          <Label>Approved Template</Label>
                          <select
                            value={selectedNode.data.templateName ?? ""}
                            onChange={(event) => {
                              const selectedTemplate = approvedTemplates.find((template) => template.name === event.target.value);
                              updateSelectedNode({
                                templateName: event.target.value,
                                languageCode: selectedTemplate?.language.toLowerCase().startsWith("hi") ? "hi" : "en",
                              });
                            }}
                            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                          >
                            <option value="">Choose template</option>
                            {approvedTemplates.map((template) => (
                              <option key={template.id} value={template.name}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Language Code</Label>
                          <Input
                            value={selectedNode.data.languageCode ?? "en"}
                            className="mt-2"
                            onChange={(event) => updateSelectedNode({ languageCode: event.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === "send_interactive" && (
                      <>
                        <div>
                          <Label>Prompt</Label>
                          <textarea
                            rows={4}
                            value={selectedNode.data.body ?? ""}
                            onChange={(event) => updateSelectedNode({ body: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Buttons</Label>
                          <div className="mt-2 space-y-2">
                            {(selectedNode.data.buttons ?? []).map((button, index) => (
                              <Input
                                key={button.id}
                                value={button.title}
                                onChange={(event) => updateSelectedNode({
                                  buttons: (selectedNode.data.buttons ?? []).map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, title: event.target.value } : item
                                  )),
                                })}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedNode.type === "condition" && (
                      <div>
                        <Label>Tag to Check</Label>
                        <Input
                          value={selectedNode.data.tag ?? ""}
                          className="mt-2"
                          onChange={(event) => updateSelectedNode({ type: "has_tag", tag: event.target.value })}
                        />
                      </div>
                    )}

                    {selectedNode.type === "tag" && (
                      <div>
                        <Label>Tag to Apply</Label>
                        <Input
                          value={selectedNode.data.tag ?? ""}
                          className="mt-2"
                          onChange={(event) => updateSelectedNode({ tag: event.target.value })}
                        />
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Builder note</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Connect nodes in sequence. Condition nodes branch on the <span className="font-mono">true</span> and <span className="font-mono">false</span> handles, which the flow engine already understands.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
                  Select a step on the canvas to edit its chatbot logic.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
