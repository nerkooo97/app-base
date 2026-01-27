'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { UserWithProfileAndRoles, hasPermission } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface NavigationProps {
    user: UserWithProfileAndRoles;
    isCollapsed?: boolean;
}

// Helper to render Lucide icons dynamically
const Icon = ({ name, isCollapsed }: { name: string, isCollapsed?: boolean }) => {
    const LucideIcon = (LucideIcons as any)[name];
    if (!LucideIcon) return <LucideIcons.HelpCircle className="h-5 w-5" />;
    return <LucideIcon className="h-5 w-5" />;
};

export default function Navigation({ user, isCollapsed }: NavigationProps) {
    const pathname = usePathname();

    const visibleGroups = navigationConfig.map(group => {
        const visibleItems = group.items.filter(item => {
            // If no permissions required, show to everyone
            if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
                return true;
            }
            // Check if user has all required permissions
            return item.requiredPermissions.every(p => hasPermission(user, p));
        });

        return {
            ...group,
            items: visibleItems
        };
    }).filter(group => group.items.length > 0);

    return (
        <div className="space-y-6">
            {visibleGroups.map((group) => (
                <div key={group.groupLabel}>
                    {!isCollapsed && (
                        <p className="px-3 text-[10px] font-bold text-gray-400 mb-2 truncate">
                            {group.groupLabel}
                        </p>
                    )}
                    <ul className="space-y-1">
                        {group.items.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        title={isCollapsed ? item.label : undefined}
                                        className={cn(
                                            "group flex items-center rounded-lg px-3 py-2 text-sm font-bold transition-all",
                                            isCollapsed ? "justify-center" : "justify-between",
                                            isActive
                                                ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={cn(
                                                "opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0",
                                                isActive && "opacity-100"
                                            )}>
                                                <Icon name={item.icon} isCollapsed={isCollapsed} />
                                            </div>
                                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}
