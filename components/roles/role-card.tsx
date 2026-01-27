'use client';

import { ShieldCheck, MoreVertical, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
    role: any;
    onManagePermissions: (role: any) => void;
    onEdit?: (role: any) => void;
    onDelete?: (roleId: number) => void;
}

export default function RoleCard({ role, onManagePermissions, onEdit, onDelete }: RoleCardProps) {
    return (
        <Card className="group transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950 shadow-none">
            <CardHeader className="p-8 pb-4">
                <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nivo {role.hierarchy_level}</span>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {role.name}
                    </CardTitle>
                    {role.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {role.description}
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-8 py-4">
                <div className="space-y-3">
                    <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dozvole</h3>
                    <div className="flex flex-wrap gap-2">
                        {role.role_permissions?.length > 0 ? (
                            <>
                                {role.role_permissions.slice(0, 5).map((rp: any) => (
                                    <Badge
                                        key={rp.permission_name}
                                        variant="secondary"
                                        className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-none font-semibold text-[10px] px-0 py-0 shadow-none"
                                    >
                                        #{rp.permission_name}
                                    </Badge>
                                ))}
                                {role.role_permissions?.length > 5 && (
                                    <span className="text-[10px] font-semibold text-primary">
                                        +{role.role_permissions.length - 5} još
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-semibold italic">Bez dodijeljenih dozvola</span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-8 py-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                    ID: {String(role.id).slice(0, 8)}
                </span>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManagePermissions(role)}
                        className="h-auto p-0 text-gray-400 font-semibold text-[10px] hover:bg-transparent hover:text-gray-600 transition-all uppercase tracking-wider"
                    >
                        Dozvole
                    </Button>
                    {(role.name !== 'super_admin' && onEdit && onDelete) && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(role)}
                                className="h-auto p-0 text-primary font-semibold text-[10px] hover:bg-transparent hover:text-primary/80 transition-all uppercase tracking-wider"
                            >
                                Uredi
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(role.id)}
                                className="h-auto p-0 text-red-500 font-semibold text-[10px] hover:bg-transparent hover:text-red-600 transition-all uppercase tracking-wider"
                            >
                                Obriši
                            </Button>
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
