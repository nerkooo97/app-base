'use client';

import * as React from "react";
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from 'lucide-react';
import { getNavLabel } from '@/config/navigation';

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-2">
                        <Home className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Početna</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.length === 0 && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Kontrolna tabla</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;
                    const label = getNavLabel(href) || segment;

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator />
                            <SidebarBreadcrumbItem
                                href={href}
                                label={label}
                                isLast={isLast}
                            />
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

function SidebarBreadcrumbItem({ href, label, isLast }: { href: string, label: string, isLast: boolean }) {
    if (isLast) {
        return (
            <BreadcrumbItem>
                <BreadcrumbPage>{label}</BreadcrumbPage>
            </BreadcrumbItem>
        );
    }

    return (
        <BreadcrumbItem>
            <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
        </BreadcrumbItem>
    );
}
