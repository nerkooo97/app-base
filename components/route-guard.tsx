'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRequiredPermissions } from '@/config/navigation';
import { UserWithProfileAndRoles, hasPermission } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
    user: UserWithProfileAndRoles;
    children: React.ReactNode;
}

export default function RouteGuard({ user, children }: RouteGuardProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Reset status on path change to re-verify
        setIsAuthorized(null);

        const required = getRequiredPermissions(pathname);
        const authorized = !required || required.length === 0 || required.every(p => hasPermission(user, p));

        if (!authorized) {
            console.warn(`Unauthorized access attempt to ${pathname}. Redirecting to dashboard.`);
            router.replace('/');
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router, user]);

    if (isAuthorized === null) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center animate-in fade-in duration-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-xs font-bold text-gray-400">Provjera permisija...</p>
            </div>
        );
    }

    return <>{children}</>;
}
