"use client"

import * as React from "react"
import {
    Command,
    SquareTerminal,
} from "lucide-react"
import * as LucideIcons from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigationConfig } from "@/config/navigation"
import { UserWithProfileAndRoles, hasPermission } from "@/lib/auth-utils"

export function AppSidebar({ user, appName = "EdVision ERP", ...props }: React.ComponentProps<typeof Sidebar> & { user: UserWithProfileAndRoles, appName?: string }) {
    const visibleNavMain = React.useMemo(() => {
        return navigationConfig.map(group => ({
            title: group.groupLabel,
            url: "#",
            icon: (LucideIcons as any)[group.items[0]?.icon] || SquareTerminal,
            items: group.items
                .filter(item => {
                    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
                    return item.requiredPermissions.every(p => hasPermission(user, p));
                })
                .map(item => ({
                    title: item.label,
                    url: item.href,
                }))
        })).filter(group => group.items.length > 0);
    }, [user]);

    const userData = {
        name: user.profile?.full_name || user.email?.split('@')[0] || "User",
        email: user.email || "",
        avatar: user.profile?.avatar_url || "",
    };

    return (
        <Sidebar variant="inset" collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
                                    <span className="truncate text-xs">ERP System</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={visibleNavMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    )
}
