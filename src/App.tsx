import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import ConnectWhatsApp from "./pages/ConnectWhatsApp";
import WalletPage from "./pages/WalletPage";
import ContactsPage from "./pages/ContactsPage";
import TemplatesPage from "./pages/TemplatesPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignAnalyticsPage from "./pages/CampaignAnalyticsPage";
import SegmentsPage from "./pages/SegmentsPage";
import TrackedLinksPage from "./pages/TrackedLinksPage";
import InboxPage from "./pages/InboxPage";
import LeadsPage from "./pages/LeadsPage";
import AutomationsPage from "./pages/AutomationsPage";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReliabilityPage from "./pages/ReliabilityPage";
import TransactionsPage from "./pages/TransactionsPage";
import SettingsPage from "./pages/SettingsPage";
import PartnerPage from "./pages/PartnerPage";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerManagement from "./pages/PartnerManagement";
import PartnerBranding from "./pages/PartnerBranding";
import AdminUserManagement from "./pages/AdminUserManagement";
import TeamsPage from "./pages/TeamsPage";
import AgentsPage from "./pages/AgentsPage";
import CannedRepliesPage from "./pages/CannedRepliesPage";
import AssignmentRulesPage from "./pages/AssignmentRulesPage";
import BusinessHoursPage from "./pages/BusinessHoursPage";
import AgentAnalyticsPage from "./pages/AgentAnalyticsPage";
import FlowRunsPage from "./pages/FlowRunsPage";
import AiAgentPage from "./pages/AiAgentPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import PaymentsPage from "./pages/PaymentsPage";
import CataloguePage from "./pages/CataloguePage";
import GrowthPage from "./pages/GrowthPage";
import FormsPage from "./pages/FormsPage";
import OpsLogsPage from "./pages/OpsLogsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/connect" element={<ConnectWhatsApp />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
              <Route path="/segments" element={<SegmentsPage />} />
              <Route path="/links" element={<TrackedLinksPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/automations" element={<AutomationsPage />} />
              <Route path="/automations/builder" element={<WorkflowBuilder />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reliability" element={<ReliabilityPage />} />
              <Route path="/partners/dashboard" element={<PartnerDashboard />} />
              <Route path="/partners/manage" element={<PartnerManagement />} />
              <Route path="/partners/branding" element={<PartnerBranding />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/teams" element={<TeamsPage />} />
              <Route path="/admin/agents" element={<AgentsPage />} />
              <Route path="/admin/canned-replies" element={<CannedRepliesPage />} />
              <Route path="/admin/assignment-rules" element={<AssignmentRulesPage />} />
              <Route path="/admin/business-hours" element={<BusinessHoursPage />} />
              <Route path="/admin/agent-analytics" element={<AgentAnalyticsPage />} />
              <Route path="/admin/flow-runs" element={<FlowRunsPage />} />
              <Route path="/admin/ai-agent" element={<AiAgentPage />} />
              <Route path="/admin/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/admin/ops-logs" element={<OpsLogsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/growth" element={<GrowthPage />} />
              <Route path="/forms" element={<FormsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
