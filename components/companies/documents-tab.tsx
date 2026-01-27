'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, File, FileText, Image as ImageIcon, Trash2, Download, AlertCircle, FileIcon } from 'lucide-react';
import { uploadCompanyDocument, deleteCompanyDocument, getCompanyDocuments } from '@/lib/actions/documents';
import { formatBytes } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-provider';

import DocumentPreviewModal from './document-preview-modal';
import { Eye } from 'lucide-react';

interface DocumentsTabProps {
    companyId: string;
}

export default function DocumentsTab({ companyId }: DocumentsTabProps) {
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = useCallback(async () => {
        if (!companyId) {
            console.log('fetchDocuments: No companyId');
            return;
        }
        console.log('fetchDocuments: Fetching for', companyId);
        setIsLoading(true);
        try {
            const docs = await getCompanyDocuments(companyId);
            console.log('fetchDocuments: Received docs', docs?.length);
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            showToast('error', 'Greška prilikom učitavanja dokumenata');
        } finally {
            setIsLoading(false);
        }
    }, [companyId, showToast]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadCompanyDocument(companyId, formData);
            showToast('success', 'Dokument uspješno dodan');
            fetchDocuments();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('error', 'Neuspješan upload dokumenta');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (documentId: string, filePath: string) => {
        if (!confirm('Da li ste sigurni da želite obrisati ovaj dokument?')) return;

        try {
            // Optimistic update
            setDocuments(prev => prev.filter(d => d.id !== documentId));
            await deleteCompanyDocument(documentId, filePath, companyId);
            showToast('success', 'Dokument obrisan');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('error', 'Greška prilikom brisanja');
            fetchDocuments(); // Revert on error
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
        return <FileIcon className="h-5 w-5 text-gray-400" />;
    };

    return (
        <>
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                        <File className="h-5 w-5 text-gray-400" />
                        Dokumenti ({documents.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchDocuments}
                            className="h-10 px-4 rounded-xl font-bold shadow-sm"
                            disabled={isLoading}
                        >
                            Osvježi
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="h-10 px-4 rounded-xl font-bold shadow-sm"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Dodaj
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                            <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nema dokumenata</h3>
                            <p className="text-xs text-gray-500 mt-1">Stisnite dugme iznad da dodate prvi dokument.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                            {getFileIcon(doc.file_type)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                {doc.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                                                <span>{formatBytes(doc.size)}</span>
                                                <span>•</span>
                                                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPreviewDocument(doc)}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Pregledaj"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                            title="Preuzmi"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc.id, doc.file_path)}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Obriši"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DocumentPreviewModal
                isOpen={!!previewDocument}
                onClose={() => setPreviewDocument(null)}
                document={previewDocument}
            />
        </>
    );
}
