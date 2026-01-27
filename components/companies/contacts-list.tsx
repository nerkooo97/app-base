'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Mail, Phone, Trash2 } from 'lucide-react';
import CreateContactModal from './create-contact-modal';
import { deleteContact } from '@/app/(app)/companies/actions';
import { useToast } from '@/components/ui/toast-provider';

interface ContactsListProps {
    companyId: string;
    contacts: any[];
    onUpdate: () => void;
}

export default function ContactsList({ companyId, contacts, onUpdate }: ContactsListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleDelete = async (contactId: string) => {
        if (!confirm('Da li ste sigurni da želite obrisati ovaj kontakt?')) return;

        setIsDeleting(contactId);
        try {
            const result = await deleteContact(contactId, companyId);
            if (result.success) {
                showToast('success', 'Kontakt obrisan');
                onUpdate();
            } else {
                showToast('error', 'Greška: ' + result.error);
            }
        } catch (error) {
            showToast('error', 'Greška pri brisanju kontakta');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <>
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit">
                                Kontakt osobe
                                <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 font-normal">({contacts.length})</span>
                            </CardTitle>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="h-9 px-4 rounded-xl font-bold shadow-sm text-xs"
                        >
                            <Plus className="h-3 w-3 mr-2" />
                            Dodaj kontakt
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {contacts.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400 dark:text-gray-500 text-xs font-black">Nema dodeljenih kontakata.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {contacts.map((contact) => (
                                <div key={contact.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                        {contact.first_name} {contact.last_name}
                                                    </h4>
                                                    {contact.is_primary && (
                                                        <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-none font-bold text-[10px] px-2 py-0">
                                                            Primarni
                                                        </Badge>
                                                    )}
                                                </div>
                                                {contact.position && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        {contact.position}
                                                        {contact.department && ` • ${contact.department}`}
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1 mt-2">
                                                    {contact.email && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                                                        </div>
                                                    )}
                                                    {contact.phone && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                            <a href={`tel:${contact.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-primary">{contact.phone}</a>
                                                        </div>
                                                    )}
                                                    {contact.mobile && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                            <a href={`tel:${contact.mobile}`} className="text-gray-600 dark:text-gray-400 hover:text-primary">{contact.mobile} (mob)</a>
                                                        </div>
                                                    )}
                                                </div>
                                                {contact.notes && (
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                                        {contact.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(contact.id)}
                                            disabled={isDeleting === contact.id}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                companyId={companyId}
                onSuccess={onUpdate}
            />
        </>
    );
}
