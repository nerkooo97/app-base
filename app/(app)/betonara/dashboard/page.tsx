import { getProductionStats, getActiveMaterials } from '@/lib/actions/betonara';
import { BetonaraDashboardClient } from '@/components/betonara/dashboard-client';

export default async function BetonaraDashboardPage() {
    const [stats, materials] = await Promise.all([
        getProductionStats({}),
        getActiveMaterials()
    ]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Kontrolna tabla - Betonara</h1>
                <p className="text-muted-foreground">
                    Analitika i pregled proizvodnih procesa u realnom vremenu.
                </p>
            </div>

            <BetonaraDashboardClient initialStats={stats} materials={materials} />
        </div>
    );
}
