'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from './navigation';
import Breadcrumbs from './breadcrumbs';
import { UserWithProfileAndRoles } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';
import { LogOut, ChevronLeft, Settings2, UserCircle, LayoutDashboard, Moon, Sun } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from './theme-provider';

interface AppShellProps {
    children: React.ReactNode;
    user: UserWithProfileAndRoles;
    appName?: string;
}

export default function AppShell({ children, user, appName = 'EdVision ERP' }: AppShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 border-r bg-white dark:bg-gray-950 dark:border-gray-800 flex flex-col z-20 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Brand Area */}
                <div className="h-20 flex items-center px-6 border-b border-gray-50 dark:border-gray-800">
                    <Link href="/" className="group flex items-center h-full w-full">
                        {!isCollapsed ? (
                            <span className="font-black text-xl tracking-tight font-outfit text-gray-900 dark:text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 transition-all group-hover:opacity-80">
                                {appName}
                            </span>
                        ) : (
                            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto">
                                <span className="text-white font-black text-xs">{appName?.substring(0, 1)}</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 overflow-y-auto mt-2 px-3">
                    <Navigation user={user} isCollapsed={isCollapsed} />
                </nav>

                {/* Collapse Toggle */}
                <div className="p-4 border-t dark:border-gray-800">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center h-10 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent"
                        title={isCollapsed ? "Proširi" : "Skupi"}
                    >
                        <ChevronLeft
                            className={cn("h-5 w-5 transition-transform duration-300", isCollapsed ? "rotate-180" : "")}
                        />
                        {!isCollapsed && <span className="ml-3 text-xs font-bold">Skupi meni</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 bg-background dark:bg-gray-900 min-h-screen flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "ml-20" : "ml-64"
            )}>
                {/* Top Header / Breadcrumbs & Profile */}
                <header className="h-20 border-b bg-white dark:bg-gray-950 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
                    <Breadcrumbs />

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 py-1.5 px-3 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate opacity-60 leading-tight">
                                            {user.email}
                                        </p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white truncate leading-tight mt-0.5 group-hover:text-primary transition-colors">
                                            {user.profile?.full_name || user.email?.split('@')[0]}
                                        </p>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-100 dark:border-gray-600 shadow-sm transition-all group-hover:border-primary/30 shrink-0">
                                        {user.profile?.avatar_url ? (
                                            <img src={user.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-xs">
                                                {user.profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl border-gray-100 dark:border-gray-700 dark:bg-gray-950" sideOffset={10}>
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500">Upravljanje računom</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary transition-all font-bold text-xs dark:text-gray-300">
                                        <UserCircle className="h-4 w-4" />
                                        Moj profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary transition-all font-bold text-xs dark:text-gray-300"
                                    onClick={toggleTheme}
                                >
                                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    {theme === 'dark' ? 'Svijetli mod' : 'Tamni mod'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-50 dark:bg-gray-800" />
                                <DropdownMenuItem
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-all font-bold text-xs"
                                    onClick={async () => {
                                        const { signOut } = await import('@/app/(auth)/sign-out-action');
                                        await signOut();
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Odjava
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content Container with Unified Padding */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
