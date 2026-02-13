import { getActiveMaterials } from '@/lib/actions/betonara';
import { getUnifiedProductionStats } from '@/lib/actions/betonara-v2';
import { BetonaraDashboardClient } from '@/components/betonara/dashboard-client';

export default async function BetonaraDashboardPage() {
    const [stats, materials] = await Promise.all([
        getUnifiedProductionStats({}),
        getActiveMaterials()
    ]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <BetonaraDashboardClient initialStats={stats} materials={materials} />
        </div>
    );
}
