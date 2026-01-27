'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings2 } from 'lucide-react';

interface SettingItemProps {
    setting: any;
    onUpdate: (key: string, value: any) => Promise<void>;
    isSaving: boolean;
}

export default function SettingItem({ setting, onUpdate, isSaving }: SettingItemProps) {
    const displayKey = setting.key.replace(/_/g, ' ');

    return (
        <div className="p-6 group hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-primary/20 transition-all shrink-0">
                        <Settings2 className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-left space-y-1">
                        <Label className="text-sm font-bold text-gray-900 capitalize">
                            {displayKey}
                        </Label>
                        <p className="text-[10px] text-gray-400 font-bold opacity-80">
                            {setting.description || 'Nema opisa za ovaj ključ.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {typeof setting.parsedValue === 'boolean' ? (
                        <div className="flex items-center gap-3">
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                            <Switch
                                checked={setting.parsedValue}
                                onCheckedChange={(val) => onUpdate(setting.key, val)}
                                disabled={isSaving}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    ) : (
                        <div className="relative flex items-center">
                            <Input
                                defaultValue={setting.parsedValue}
                                onBlur={(e) => {
                                    if (e.target.value !== setting.parsedValue) {
                                        onUpdate(setting.key, e.target.value);
                                    }
                                }}
                                disabled={isSaving}
                                className="h-10 rounded-xl border-gray-100 bg-gray-50/50 text-xs font-bold px-4 focus:bg-white transition-all shadow-none min-w-[240px]"
                            />
                            {isSaving && (
                                <div className="absolute right-3">
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
