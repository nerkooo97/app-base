import { getProductionStats } from '@/lib/actions/betonara';
import { BetonaraDashboardClient } from '@/components/betonara/dashboard-client';

export default async function BetonaraDashboardPage() {
    const stats = await getProductionStats({});

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Betonara - Dashboard</h1>
                <p className="text-muted-foreground">
                    Pregled proizvodnih performansi za obje betonare.
                </p>
            </div>

            <BetonaraDashboardClient stats={stats} />
        </div>
    );
}
