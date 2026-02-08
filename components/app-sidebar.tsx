"use client"

import * as React from "react"
import {
    Command,
    SquareTerminal,
} from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Logo } from "@/components/logo"

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
    useSidebar,
} from "@/components/ui/sidebar"
import { navigationConfig } from "@/config/navigation"
import { UserWithProfileAndRoles, hasPermission, getFirstAuthorizedRoute } from "@/lib/auth-utils"

export function AppSidebar({ user, appName = "EdVision ERP", ...props }: React.ComponentProps<typeof Sidebar> & { user: UserWithProfileAndRoles, appName?: string }) {
    const { state } = useSidebar();
    const homeUrl = React.useMemo(() => getFirstAuthorizedRoute(user), [user]);
    const visibleNavMain = React.useMemo(() => {
        return navigationConfig.map(group => ({
            title: group.groupLabel,
            url: "#",
            icon: (LucideIcons as any)[group.items[0]?.icon] || SquareTerminal,
            items: group.items
                .filter(item => {
                    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
                    return item.requiredPermissions.some(p => hasPermission(user, p));
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
                            <a href={homeUrl} className="flex items-center justify-center">
                                {state === "collapsed" ? (
                                    <span className="text-green-600 font-bold text-xl">
                                        BP
                                    </span>
                                ) : (
                                    <Logo height={48} className="w-full" />
                                )}
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
