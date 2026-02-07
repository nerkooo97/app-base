import { getProductionStats, getActiveMaterials } from '@/lib/actions/betonara';
import { BetonaraDashboardClient } from '@/components/betonara/dashboard-client';

export default async function BetonaraDashboardPage() {
    const [stats, materials] = await Promise.all([
        getProductionStats({}),
        getActiveMaterials()
    ]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <BetonaraDashboardClient initialStats={stats} materials={materials} />
        </div>
    );
}
