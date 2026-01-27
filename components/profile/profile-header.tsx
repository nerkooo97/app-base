'use client';

export default function ProfileHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="text-left">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white font-outfit">Moj profil</h1>
                <p className="text-xs font-bold text-gray-400 mt-1">Upravljajte svojim ličnim podacima i sigurnosnim postavkama.</p>
            </div>
        </div>
    );
}
