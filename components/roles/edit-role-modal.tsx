'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: { name: string, description: string, hierarchy: number }) => Promise<void>;
    role: any;
    isUpdating: boolean;
}

export default function EditRoleModal({
    isOpen,
    onClose,
    onUpdate,
    role,
    isUpdating
}: EditRoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [hierarchy, setHierarchy] = useState('');

    useEffect(() => {
        if (role) {
            setName(role.name || '');
            setDescription(role.description || '');
            setHierarchy(role.hierarchy_level?.toString() || '0');
        }
    }, [role, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(role.id, {
            name,
            description,
            hierarchy: parseInt(hierarchy) || 0
        });
    };

    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Uredi ulogu</DialogTitle>
                        <DialogDescription>
                            Izmijenite detalje uloge. Kliknite sačuvaj kada završite.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Naziv
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="npr. manager"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Opis
                            </Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                placeholder="Opis uloge..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hierarchy" className="text-right">
                                Nivo
                            </Label>
                            <Input
                                id="hierarchy"
                                type="number"
                                value={hierarchy}
                                onChange={(e) => setHierarchy(e.target.value)}
                                className="col-span-3"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sačuvaj izmjene
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
