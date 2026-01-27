'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import Image from 'next/image';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: {
        id: string;
        name: string;
        url: string;
        file_type: string;
    } | null;
}

export default function DocumentPreviewModal({
    isOpen,
    onClose,
    document
}: DocumentPreviewModalProps) {
    if (!document) return null;

    const isImage = document.file_type.startsWith('image/');
    const isPDF = document.file_type === 'application/pdf';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-gray-950">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <DialogTitle className="text-base font-bold truncate">
                            {document.name}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9"
                            title="Otvori u novom tabu"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-9 w-9"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-4 relative">
                    {isImage && (
                        <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                            <img
                                src={document.url}
                                alt={document.name}
                                className="max-w-full max-h-full object-contain rounded-md shadow-sm"
                            />
                        </div>
                    )}

                    {isPDF && (
                        <iframe
                            src={`${document.url}#toolbar=0`}
                            className="w-full h-full rounded-md shadow-sm border border-gray-200 dark:border-gray-800 bg-white"
                            title={document.name}
                        />
                    )}

                    {!isImage && !isPDF && (
                        <div className="text-center">
                            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Pregled nije dostupan</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                Ovaj tip fajla se ne može prikazati direktno. Molimo preuzmite fajl da biste ga pregledali.
                            </p>
                            <Button asChild>
                                <a href={document.url} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Preuzmi fajl
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
