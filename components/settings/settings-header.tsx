'use client';

export default function SettingsHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="text-left">
                <h1 className="text-2xl font-black text-gray-900 font-outfit">Postavke sistema</h1>
                <p className="text-xs font-bold text-gray-400 mt-1">Globalna konfiguracija ERP-a i sistemske postavke.</p>
            </div>
        </div>
    );
}
