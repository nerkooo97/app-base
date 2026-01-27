import { getUserWithProfileAndRoles } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
    const user = await getUserWithProfileAndRoles();
    const supabase = await createClient();

    // Fetch stats
    const [usersCount, rolesCount, settingsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('roles').select('*', { count: 'exact', head: true }),
        supabase.from('settings').select('*', { count: 'exact', head: true })
    ]);

    const stats = [
        { label: 'Ukupno korisnika', value: usersCount.count || 0, href: '/users' },
        { label: 'Sistemske uloge', value: rolesCount.count || 0, href: '/roles' },
        { label: 'Konfig. ključevi', value: settingsCount.count || 0, href: '/settings' }
    ];

    if (!user) return null;

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <Card className="relative overflow-hidden border-none bg-white shadow-sm group">
                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000"></div>
                <CardContent className="p-8 relative z-10">
                    <h1 className="text-3xl font-black font-outfit text-gray-900 mb-2">
                        Dobro došli, {user.profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}!
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
                        Status sistema: <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold hover:bg-emerald-100">Operativan</Badge>
                        <span className="mx-2">•</span>
                        Uloga: <span className="text-gray-900">{user.roles[0]?.name || 'Korisnik'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="group transition-all hover:-translate-y-1 hover:shadow-md border-gray-100">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                                <CardTitle className="text-[10px] font-bold text-gray-400 leading-none">
                                    {stat.label}
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                    <TrendingUp className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors">
                                    {stat.value}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                                        Upravljaj podacima <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </p>
                                    <Badge variant="outline" className="text-[9px] font-bold text-gray-300 border-gray-100">Sinhronizovano</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Role & Permissions Info */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/30 border-b border-gray-100 py-4 px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <CardTitle className="text-[10px] font-bold text-gray-400">Aktivne privilegije</CardTitle>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[9px]">Verifikovano</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {user.permissions.map((perm: string) => (
                            <Badge
                                key={perm}
                                variant="secondary"
                                className="bg-gray-50 text-gray-500 border border-gray-100 hover:bg-primary/5 hover:text-primary hover:border-primary/10 transition-all font-bold text-[10px] py-1.5 px-3"
                            >
                                {perm}
                            </Badge>
                        ))}
                        {user.permissions.length === 0 && (
                            <p className="text-sm text-gray-400 italic">Nema detektovanih dozvola.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
