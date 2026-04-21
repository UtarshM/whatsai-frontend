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
  UsersRound,
  UserCog,
  Palette,
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

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const navigate = useNavigate();
  const { signOut, user, branding } = useAppContext();

  const role = user?.role || "USER";

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PARTNER", "USER"] },
    { title: "Connect WhatsApp", url: "/connect", icon: Link2, roles: ["USER", "ADMIN"] },
    { title: "Campaigns", url: "/campaigns", icon: MessageSquare, roles: ["USER", "ADMIN"] },
    { title: "Inbox", url: "/inbox", icon: Inbox, roles: ["USER", "ADMIN"] },
    { title: "Leads", url: "/leads", icon: Megaphone, roles: ["USER", "ADMIN"] },
    { title: "Automations", url: "/automations", icon: Bot, roles: ["USER", "ADMIN"] },
    { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["USER", "ADMIN", "PARTNER"] },
    { title: "Reliability", url: "/reliability", icon: ShieldAlert, roles: ["USER", "ADMIN"] },
    { title: "Templates", url: "/templates", icon: FileText, roles: ["USER", "ADMIN"] },
    { title: "Contacts", url: "/contacts", icon: Users, roles: ["USER", "ADMIN"] },
    { title: "Wallet", url: "/wallet", icon: Wallet, roles: ["USER", "ADMIN"] },
    { title: "Transactions", url: "/transactions", icon: Receipt, roles: ["USER", "ADMIN", "PARTNER"] },
  ];

  const partnerItems = [
    { title: "Partner Dashboard", url: "/partners/dashboard", icon: Handshake, roles: ["PARTNER", "ADMIN"] },
    { title: "Branding Settings", url: "/partners/branding", icon: Palette, roles: ["PARTNER"] },
  ];

  const adminItems = [
    { title: "Manage Users", url: "/admin/users", icon: UserCog, roles: ["ADMIN"] },
    { title: "Manage Partners", url: "/partners/manage", icon: UsersRound, roles: ["ADMIN"] },
  ];

  const filteredMainItems = mainItems.filter(item => item.roles.includes(role));
  const filteredPartnerItems = partnerItems.filter(item => item.roles.includes(role));
  const filteredAdminItems = adminItems.filter(item => item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                {branding?.brandName || "WaBiz"}
              </h1>
              <p className="text-xs text-muted-foreground">{branding?.brandName ? "White Label" : "WhatsApp Business"}</p>
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
              {filteredMainItems.map((item) => (
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

        {filteredPartnerItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Partners
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredPartnerItems.map((item) => (
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
        )}

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
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
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        {!collapsed && user && (
          <div className="mx-2 mb-2 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 rounded bg-primary/10 text-primary">
                {user.role}
              </span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                end
                className="transition-all duration-200 rounded-lg hover:bg-sidebar-accent"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
