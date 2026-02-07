import { BetonaraFileUploader } from '@/components/betonara/file-uploader';
import { RecipeMappingList } from '@/components/betonara/recipe-mapping-list';
import { getRecipeMappings } from '@/lib/actions/betonara';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportHistory } from '@/components/betonara/import-history';

export default async function BetonaraImportPage() {
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
