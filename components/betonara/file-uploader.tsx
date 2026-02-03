'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseBetonaraExcel } from '@/lib/betonara/excel-parser';
import { saveProductionRecords, getRecipeMappings } from '@/lib/actions/betonara';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadTask {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'success' | 'error';
    error?: string;
    addedCount?: number;
    skippedCount?: number;
    plant?: string;
}

export function BetonaraFileUploader() {
    const [tasks, setTasks] = useState<FileUploadTask[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newTasks: FileUploadTask[] = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'pending'
        }));
        setTasks(prev => [...prev, ...newTasks]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        }
    });

    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const processFiles = async () => {
        setIsProcessing(true);
        const mappings = await getRecipeMappings();
        const mappingDict = mappings.reduce((acc, m) => {
            acc[m.original_name] = m.mapped_name;
            return acc;
        }, {} as Record<string, string>);

        for (const task of tasks) {
            if (task.status === 'success') continue;

            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, status: 'processing' } : t
            ));

            try {
                const records = await parseBetonaraExcel(task.file, 'Betonara 1', mappingDict);
                if (records.length === 0) throw new Error('Fajl je prazan ili neispravan');

                const plant = records[0].plant;
                let totalAdded = 0;
                let totalSkipped = 0;

                // Chunking na klijentskoj strani - šaljemo po 500 rekorda u jednom server action pozivu
                // Ovo rješava "Payload Too Large" ili timeouts kod ogromnih fajlova (npr. "pojedinačno")
                const CLIENT_CHUNK_SIZE = 500;
                for (let i = 0; i < records.length; i += CLIENT_CHUNK_SIZE) {
                    const chunk = records.slice(i, i + CLIENT_CHUNK_SIZE);
                    const result = await saveProductionRecords(chunk);
                    totalAdded += result.added;
                    totalSkipped += result.skipped;
                }

                setTasks(prev => prev.map(t =>
                    t.id === task.id ? {
                        ...t,
                        status: 'success',
                        addedCount: totalAdded,
                        skippedCount: totalSkipped,
                        plant: plant
                    } : t
                ));

                if (totalAdded > 0) {
                    toast.success(`Uspješno: ${task.file.name}. Dodano ${totalAdded} novih.`);
                } else {
                    toast.info(`Dovršeno: ${task.file.name}. Svi zapisi već postoje.`);
                }
            } catch (error: any) {
                console.error(error);
                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, status: 'error', error: error.message } : t
                ));
                toast.error(`Greška u fajlu ${task.file.name}: ${error.message}`);
            }
        }
        setIsProcessing(false);
    };

    const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'error').length;

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
            >
                <input {...getInputProps()} />
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold">Prevucite Excel fajlove ovdje</p>
                    <p className="text-sm text-muted-foreground">ili kliknite za pregled (B1 i B2 fajlovi)</p>
                </div>
            </div>

            {tasks.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lista fajlova</h3>
                        <Button
                            variant="default" // Fix: changed from "primary"
                            size="sm"
                            onClick={processFiles}
                            disabled={isProcessing || pendingCount === 0}
                        >
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Uvezi sve ({pendingCount})
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-4 rounded-lg border bg-card p-3 shadow-sm">
                                <div className={cn(
                                    "rounded-md p-2",
                                    task.status === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                                        task.status === 'error' ? "bg-destructive/10 text-destructive" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">{task.file.name}</p>
                                        {task.plant && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted uppercase">
                                                {task.plant}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {(task.file.size / 1024 / 1024).toFixed(2)} MB •
                                        {task.status === 'pending' && ' Čeka na uvoz'}
                                        {task.status === 'processing' && ' Obrađujem...'}
                                        {task.status === 'success' && (
                                            <span className="text-emerald-600 font-medium">
                                                {task.addedCount} novih, {task.skippedCount} duplikata
                                            </span>
                                        )}
                                        {task.status === 'error' && ` Greška: ${task.error}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {task.status === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                    {task.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                                    {task.status !== 'processing' && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(task.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
