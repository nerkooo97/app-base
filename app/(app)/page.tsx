import { getUserWithProfileAndRoles } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats } from '@/lib/queries/dashboard';

import { redirect } from 'next/navigation';
import { hasPermission, getFirstAuthorizedRoute } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/config/permissions';

export default async function DashboardPage() {
    const user = await getUserWithProfileAndRoles();
    const supabase = await createClient();

    if (!user) return redirect('/sign-in');

    // Provjera da li korisnik ima pravo na dashboard
    if (!hasPermission(user, PERMISSIONS.DASHBOARD_VIEW)) {
        const firstRoute = getFirstAuthorizedRoute(user);
        if (firstRoute !== '/') {
            return redirect(firstRoute);
        }
    }

    // Fetch stats via shared query
    const stats = await getDashboardStats(supabase);

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <Card className="relative overflow-hidden border-none bg-white dark:bg-gray-950 shadow-sm group">
                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000"></div>
                <CardContent className="p-8 relative z-10">
                    <h1 className="text-3xl font-semibold font-outfit text-gray-900 dark:text-white mb-2">
                        Dobro došli, {user.profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}!
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                        Status sistema: <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-none font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900">Operativan</Badge>
                        <span className="mx-2">•</span>
                        Uloga: <span className="text-gray-900 dark:text-white normal-case">{user.roles[0]?.name || 'Korisnik'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="group transition-all hover:-translate-y-1 hover:shadow-md border-gray-100 dark:border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                                <CardTitle className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 leading-none uppercase tracking-widest">
                                    {stat.label}
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                    <TrendingUp className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="text-3xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-[10px] font-semibold text-primary flex items-center gap-1 uppercase tracking-wider">
                                        Upravljaj <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </p>
                                    <Badge variant="outline" className="text-[9px] font-semibold text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 uppercase tracking-widest">Sinhronizovano</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Role & Permissions Info */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-4 px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <CardTitle className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aktivne privilegije</CardTitle>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-[9px] uppercase tracking-widest">Verifikovano</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {user.permissions.map((perm: string) => (
                            <Badge
                                key={perm}
                                variant="secondary"
                                className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-primary/5 hover:text-primary hover:border-primary/10 transition-all font-bold text-[10px] py-1.5 px-3"
                            >
                                {perm}
                            </Badge>
                        ))}
                        {user.permissions.length === 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Nema detektovanih dozvola.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
