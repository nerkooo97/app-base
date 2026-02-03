'use client';

import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, ShieldAlert } from 'lucide-react';

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: any;
    allPermissions: string[];
    onTogglePermission: (perm: string) => void;
    isUpdating: boolean;
}

export default function PermissionsModal({
    isOpen,
    onClose,
    role,
    allPermissions,
    onTogglePermission,
    isUpdating
}: PermissionsModalProps) {
    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title={`Upravljanje dozvolama`}
            description={`Konfigurišite pristup za ulogu: ${role?.name}`}
            footer={
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    onClick={onClose}
                >
                    Zatvori postavke
                </Button>
            }
        >
            <div className="space-y-3 text-left">
                {allPermissions.map(perm => {
                    const isActive = role?.role_permissions.some((rp: any) => rp.permission_name === perm);
                    return (
                        <div
                            key={perm}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? 'bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30' : 'bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                    {isActive ? <Shield className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor={`perm-${perm}`} className={`text-xs font-bold cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {perm}
                                    </Label>
                                    <span className="text-[9px] text-gray-300 dark:text-gray-600 font-bold mt-0.5 uppercase tracking-wide">Sistemska privilegija</span>
                                </div>
                            </div>
                            <Switch
                                id={`perm-${perm}`}
                                checked={isActive}
                                onCheckedChange={() => onTogglePermission(perm)}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    );
                })}

                {allPermissions.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">Nema definisanih dozvola u sistemu.</p>
                    </div>
                )}
            </div>
        </SlideOver>
    );
}
