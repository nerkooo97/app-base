'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: number) => Promise<void>;
    role: any;
    isUpdating: boolean;
}

export default function DeleteRoleModal({
    isOpen,
    onClose,
    onDelete,
    role,
    isUpdating
}: DeleteRoleModalProps) {
    if (!role) return null;

    const handleDelete = async () => {
        await onDelete(role.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle className="text-xl">Brisanje uloge</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Da li ste sigurni da želite obrisati ulogu <strong>{role.name}</strong>?
                        <br /><br />
                        Ova radnja je nepovratna. Ako je uloga dodijeljena korisnicima, brisanje neće biti moguće dok se korisnicima ne promijeni uloga.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                        Odustani
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Obriši ulogu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
