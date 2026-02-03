import { BetonaraReportsClient } from '@/components/betonara/reports-client';

export default async function BetonaraReportsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Izvještaji proizvodnje</h1>
                <p className="text-muted-foreground">
                    Detaljan pregled utroška repromaterijala po recepturama.
                </p>
            </div>

            <BetonaraReportsClient />
        </div>
    );
}
