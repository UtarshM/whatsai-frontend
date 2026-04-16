import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Users,
  FileText,
  Link2,
  Settings,
  LogOut,
  Receipt,
  Inbox,
  Megaphone,
  Bot,
  BarChart3,
  ShieldAlert,
  Handshake,
  UsersRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppContext } from "@/context/AppContext";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Connect WhatsApp", url: "/connect", icon: Link2 },
  { title: "Campaigns", url: "/campaigns", icon: MessageSquare },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Leads", url: "/leads", icon: Megaphone },
  { title: "Automations", url: "/automations", icon: Bot },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reliability", url: "/reliability", icon: ShieldAlert },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Partner Dashboard", url: "/partners/dashboard", icon: Handshake },
  { title: "Manage Partners", url: "/partners/manage", icon: UsersRound },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { signOut, user } = useAppContext();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">WaBiz</h1>
              <p className="text-xs text-muted-foreground">WhatsApp Business</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="transition-all duration-200 rounded-lg hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {!collapsed && user && (
          <div className="mx-2 mb-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="transition-all duration-200 rounded-lg hover:bg-sidebar-accent"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
