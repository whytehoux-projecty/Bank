import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../App";
import { AuthRole } from "../types";
import { portalClasses } from "../theme";
import "../styles/animations.css";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  TrendingUpIcon,
  CogIcon,
  UserCircleIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  SettingsIcon,
  PhoneIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "../constants";
import { cn } from "../lib/utils";

// Menu icon component
const HamburgerMenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

interface NavLinkSidebarProps {
  children: React.ReactNode;
}

export const NavLinkSidebar: React.FC<NavLinkSidebarProps> = ({ children }) => {
  const { currentUser, role, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || '';
  const router = useRouter();

  const isAuthPage = pathname === "/auth";
  const isActive = (path: string) => pathname === path;

  // Don't show sidebar on auth page or if not authenticated
  if (isAuthPage || role === AuthRole.Guest) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const userMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard/user",
      icon: ChartBarIcon,
      isActive: pathname === "/dashboard/user",
    },
    {
      title: "Bill Pay",
      url: "/bill-pay",
      icon: BanknotesIcon,
      isActive: pathname === "/bill-pay",
      badge: "3", // Number of upcoming bills
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: CreditCardIcon,
      isActive: isActive("/accounts"),
    },
    {
      title: "Transfers",
      url: "/transfers",
      icon: ArrowRightOnRectangleIcon,
      isActive: isActive("/transfers"),
    },
  ];

  const servicesMenuItems = [
    {
      title: "Credit Cards",
      url: "/credit-cards",
      icon: CreditCardIcon,
      isActive: pathname === "/credit-cards",
    },
    {
      title: "Loans",
      url: "/loans",
      icon: BanknotesIcon,
      isActive: pathname === "/loans",
    },
    {
      title: "Investments",
      url: "/investments",
      icon: TrendingUpIcon,
      isActive: pathname === "/investments",
    },
  ];

  const adminMenuItems = [
    {
      title: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: CogIcon,
      isActive: pathname === "/dashboard/admin",
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: UserCircleIcon,
      isActive: pathname === "/admin/users",
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: BellIcon,
      isActive: pathname === "/admin/applications",
      badge: "2", // Number of pending applications
    },
  ];

  const supportMenuItems = [
    {
      title: "Contact Support",
      url: "/contact",
      icon: PhoneIcon,
      isActive: pathname === "/contact",
    },
    {
      title: "About NovaBank",
      url: "/info",
      icon: InformationCircleIcon,
      isActive: pathname === "/info",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Banking Portal Dark Theme */}
      <Sidebar
        className={cn(
          "transition-all duration-300 border-r border-[#E2E8F0] shadow-lg h-screen overflow-y-auto",
          portalClasses.sidebar,
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <SidebarHeader className="border-b border-[#334155] bg-[#0F172A]">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link
                href="/"
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <SparklesIcon className="h-6 w-6" />
                <span>NovaBank</span>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs border-[#3B82F6] text-[#3B82F6]"
                >
                  SECURE
                </Badge>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 text-white hover:bg-[#334155]"
            >
              {isCollapsed ? (
                <HamburgerMenuIcon className="h-4 w-4" />
              ) : (
                <XMarkIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!isCollapsed && currentUser && (
            <div className="flex items-center space-x-3 pt-3">
              <div className="w-8 h-8 bg-[#1E40AF] rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-[#94A3B8] truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
        </SidebarHeader>

        {/* Content - Scrollable Sidebar Content */}
        <SidebarContent className="bg-[#0F172A] flex-1">
          {/* Banking Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
              {isCollapsed ? "" : "Banking"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center p-2 rounded-md ${
                          isActive(item.url)
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="bg-[#1E40AF] text-white text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Services Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
              {isCollapsed ? "" : "Services"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {servicesMenuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          item.isActive
                            ? "bg-[#1E40AF] text-white shadow-lg"
                            : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Menu (if admin) */}
          {role === AuthRole.Admin && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                {isCollapsed ? "" : "Administration"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            item.isActive
                              ? "bg-[#1E40AF] text-white shadow-lg"
                              : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="bg-[#1E40AF] text-white text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Support Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
              {isCollapsed ? "" : "Support"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportMenuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          item.isActive
                            ? "bg-[#1E40AF] text-white shadow-lg"
                            : "text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-[#334155] bg-[#0F172A]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#CBD5E1] hover:bg-[#334155] hover:text-white w-full"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  {!isCollapsed && <span>Sign Out</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {!isCollapsed && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar for breadcrumbs or page title - Banking Portal Style */}
        <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#0F172A]">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-sm text-[#475569]">
                {getPageDescription(pathname)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-[#CBD5E1] text-[#475569]"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area - Scrollable Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Helper functions for page titles and descriptions
const getPageTitle = (path: string | null): string => {
  if (!path) return 'NovaBank';
  const titles: Record<string, string> = {
    "/dashboard/user": "Dashboard",
    "/dashboard/admin": "Admin Dashboard",
    "/bill-pay": "Bill Pay",
    "/credit-cards": "Credit Cards",
    "/loans": "Loans",
    "/investments": "Investments",
    "/contact": "Contact Support",
    "/info": "About NovaBank",
    "/accounts": "Accounts",
    "/transfers": "Transfers",
    "/admin/users": "User Management",
    "/admin/applications": "Applications",
    "/settings": "Settings",
  };

  return titles[path] || "NovaBank";
}

const getPageDescription = (path: string | null): string => {
  if (!path) return 'Digital Banking Platform';
  const descriptions: Record<string, string> = {
    "/dashboard/user": "Overview of your accounts and recent activity",
    "/dashboard/admin": "System administration and management",
    "/bill-pay": "Manage and pay your bills",
    "/credit-cards": "Apply for and manage credit cards",
    "/loans": "Explore loan options and applications",
    "/investments": "Investment portfolio and opportunities",
    "/contact": "Get help and support",
    "/info": "Learn more about NovaBank",
    "/accounts": "View and manage your accounts",
    "/transfers": "Transfer money between accounts",
    "/admin/users": "Manage user accounts and permissions",
    "/admin/applications": "Review account applications",
    "/settings": "Account and application settings",
  };

  return descriptions[path] || "Your trusted digital banking partner";
}
