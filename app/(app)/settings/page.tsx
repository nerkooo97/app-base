'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllSettings } from '@/lib/queries/settings';
import { updateSetting } from './actions';
import { useToast } from '@/components/ui/toast-provider';

// Components
import SettingsHeader from '@/components/settings/settings-header';
import SettingItem from '@/components/settings/setting-item';
import SystemStatus from '@/components/settings/system-status';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    const supabase = createClient();
    const { showToast } = useToast();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllSettings(supabase);

            const safeJsonParse = (val: any) => {
                if (typeof val !== 'string') return val;
                try {
                    return JSON.parse(val);
                } catch (e) {
                    return val;
                }
            };

            const parsedData = data?.map(s => ({
                ...s,
                parsedValue: safeJsonParse(s.value)
            })) || [];

            setSettings(parsedData);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleUpdate = async (key: string, newValue: any) => {
        setIsSaving(key);
        const result = await updateSetting(key, newValue);

        if (result.success) {
            setSettings(prev => prev.map(s =>
                s.key === key ? { ...s, parsedValue: newValue } : s
            ));
            showToast('success', 'Postavka uspješno ažurirana!');
        } else {
            showToast('error', 'Greška pri ažuriranju: ' + result.error);
        }
        setIsSaving(null);
    };

    if (isLoading && settings.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 font-medium text-xs">Učitavanje postavki...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <SettingsHeader />

            <div className="grid gap-8">
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-gray-50/30 text-left">
                        <h2 className="text-[10px] font-bold text-gray-400 uppercase">Konfiguracijski ključevi</h2>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {settings.map((setting) => (
                            <SettingItem
                                key={setting.key}
                                setting={setting}
                                onUpdate={handleUpdate}
                                isSaving={isSaving === setting.key}
                            />
                        ))}
                    </div>
                </div>

                <SystemStatus />
            </div>
        </div>
    );
}
