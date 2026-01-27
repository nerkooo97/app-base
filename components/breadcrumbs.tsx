'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavLabel } from '@/config/navigation';
import { Home } from 'lucide-react';

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Početna</span>
            </Link>

            {segments.length === 0 && (
                <>
                    <span className="text-gray-200 font-normal">/</span>
                    <span className="text-gray-900">Kontrolna tabla</span>
                </>
            )}

            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;

                // Try to get label from navigation config, fallback to segment name
                const label = getNavLabel(href) || segment;

                return (
                    <div key={href} className="flex items-center gap-2">
                        <span className="text-gray-200 font-normal">/</span>
                        {isLast ? (
                            <span className="text-gray-900">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-primary transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
