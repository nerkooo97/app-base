'use client';

import * as React from "react";
import { AppSidebar } from "./app-sidebar"
import Breadcrumbs from './breadcrumbs';
import { UserWithProfileAndRoles } from '@/lib/auth-utils';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import RouteGuard from './route-guard';

interface AppShellProps {
    children: React.ReactNode;
    user: UserWithProfileAndRoles;
    appName?: string;
}

export default function AppShell({ children, user, appName = 'EdVision ERP' }: AppShellProps) {
    return (
        <SidebarProvider>
            <AppSidebar user={user} appName={appName} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <div className="flex-1">
                        <Breadcrumbs />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <RouteGuard user={user}>
                        {children}
                    </RouteGuard>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
