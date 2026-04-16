import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Play, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// --- Custom Nodes ---

const TriggerNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-primary w-48">
    <div className="flex items-center">
      <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10 text-primary mr-2">
        <Play size={16} />
      </div>
      <div>
        <p className="text-sm font-bold">Meta Lead Trigger</p>
        <p className="text-xs text-muted-foreground">Starts on new lead</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
  </div>
);

const MessageNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 w-48">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 mr-2">
        <Plus size={16} />
      </div>
      <div>
        <p className="text-sm font-bold">Send Message</p>
        <p className="text-xs text-muted-foreground">{data.templateName || "Template: welcome"}</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const WaitNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-500 w-48">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center text-orange-600">
      <div className="rounded-full w-8 h-8 flex items-center justify-center bg-orange-100 mr-2">
        <Plus size={16} />
      </div>
      <div>
        <p className="text-sm font-bold">Wait</p>
        <p className="text-xs text-muted-foreground">{data.hours || 2} hours</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const ConditionNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 w-52">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center text-purple-600">
      <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 mr-2">
        <Plus size={16} />
      </div>
      <div>
        <p className="text-sm font-bold">Condition</p>
        <p className="text-xs text-muted-foreground">If: {data.type || "Has Tag: Joined"}</p>
      </div>
    </div>
    <div className="mt-2 flex justify-between text-[10px] font-bold">
        <span>TRUE</span>
        <span>FALSE</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" className="left-[25%] w-3 h-3 bg-green-500" />
    <Handle type="source" position={Position.Bottom} id="false" className="left-[75%] w-3 h-3 bg-red-500" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  send_message: MessageNode,
  wait: WaitNode,
  condition: ConditionNode,
};

// --- Page Component ---

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "trigger",
    data: { label: "Trigger" },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState("Lead Nurture Flow");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3001";
      const res = await fetch(`${baseUrl}/automation/definitions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: flowName.trim(),
          nodes,
          edges,
        }),
      });
      if (res.ok) {
        toast.success("Flow saved successfully!");
      } else {
        const payload = await res.json().catch(() => ({})) as { error?: string };
        toast.error(payload.error || "Failed to save flow.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving flow.");
    }
  };

  const addNode = (type: string) => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      type,
      data: { label: type, ...getDefaultNodeData(type) },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const getDefaultNodeData = (type: string) => {
      if (type === "wait") return { hours: 2 };
      if (type === "send_message") return { templateName: "welcome_lead" };
      if (type === "condition") return { type: "has_tag", tag: "Joined" };
      return {};
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/automations")}>
              <ArrowLeft size={20} />
            </Button>
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow name"
              className="w-56 text-base font-bold border-0 shadow-none focus-visible:ring-0 px-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/automations")}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save size={18} />
              Save Flow
            </Button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas */}
          <div className="flex-1 relative h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-dot-pattern"
            >
              <Background />
              <Controls />
              <Panel position="top-right">
                <Card className="p-2 flex flex-col gap-2">
                  <p className="text-xs font-bold text-muted-foreground px-2">Add Step</p>
                  <Button variant="outline" size="sm" onClick={() => addNode("send_message")}>Message</Button>
                  <Button variant="outline" size="sm" onClick={() => addNode("wait")}>Delay</Button>
                  <Button variant="outline" size="sm" onClick={() => addNode("condition")}>Condition</Button>
                </Card>
              </Panel>
            </ReactFlow>
          </div>

          {/* Properties Sidebar */}
          {selectedNode && (
            <div className="w-80 border-l bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Step Settings</h2>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                     setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                     setSelectedNode(null);
                }}>
                  <Trash2 size={18} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Step ID</Label>
                  <Input value={selectedNode.id} disabled className="bg-muted" />
                </div>

                {selectedNode.type === "wait" && (
                  <div>
                    <Label>Wait Hours</Label>
                    <Input 
                      type="number" 
                      value={selectedNode.data.hours} 
                      onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, hours: val } } : n));
                      }}
                    />
                  </div>
                )}

                {selectedNode.type === "send_message" && (
                   <div>
                     <Label>Template Name</Label>
                     <Input 
                       value={selectedNode.data.templateName} 
                       onChange={(e) => {
                           const val = e.target.value;
                           setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, templateName: val } } : n));
                       }}
                     />
                   </div>
                )}

                {selectedNode.type === "condition" && (
                   <div className="space-y-4">
                     <div>
                        <Label>Variable</Label>
                        <Input value="Has Tag" disabled className="bg-muted" />
                     </div>
                     <div>
                        <Label>Tag Value</Label>
                        <Input 
                          value={selectedNode.data.tag} 
                          onChange={(e) => {
                              const val = e.target.value;
                              setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, tag: val } } : n));
                          }}
                        />
                     </div>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </SidebarProvider>
  );
};

export default () => (
    <ReactFlowProvider>
        <WorkflowBuilder />
    </ReactFlowProvider>
);
