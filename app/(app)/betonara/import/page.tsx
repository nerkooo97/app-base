import { BetonaraFileUploader } from '@/components/betonara/file-uploader';
import { RecipeMappingList } from '@/components/betonara/recipe-mapping-list';
import { getRecipeMappings } from '@/lib/actions/betonara';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportHistory } from '@/components/betonara/import-history';

import { createClient } from '@/lib/supabase/server';
import { ShieldAlert } from 'lucide-react';

export default async function BetonaraImportPage() {
    const supabase = await createClient();

    // Provjera permisija: Import (specijalna) ili Manage (admin/manager)
    const { data: canImport } = await supabase.rpc('authorize', { 
        requested_permission: 'betonara.import' 
    });

    const { data: canManage } = await supabase.rpc('authorize', { 
        requested_permission: 'betonara.manage' 
    });

    if (!canImport && !canManage) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-destructive/10 p-6 ring-1 ring-destructive/20 shadow-lg">
                    <ShieldAlert className="h-16 w-16 text-destructive" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h1 className="text-3xl font-black tracking-tighter text-foreground">
                        Pristup Odbijen
                    </h1>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        Nemate potrebnu dozvolu (<code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">betonara.import</code>) za uvoz podataka.
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                        Kontaktirajte administratora za dodjelu pristupa.
                    </p>
                </div>
            </div>
        );
    }

    // Učitaj podatke samo ako ima pristup
    const mappings = await getRecipeMappings();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Import podataka</h1>
                    <p className="text-muted-foreground">
                        Upravljajte uvozom podataka iz betonara i mapiranjem receptura.
                    </p>
                </div>
                <ImportHistory />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Uvoz fajlova</CardTitle>
                        <CardDescription>
                            Odaberite Excel fajlove iz Betonare 1 i Betonare 2.
                            Sistem će automatski prepoznati kolone i mapirati recepture.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BetonaraFileUploader />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Mapiranje receptura</CardTitle>
                        <CardDescription>
                            Definišite kako se nazivi iz Excel fajlova mapiraju u standardne nazive receptura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecipeMappingList initialMappings={mappings} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
