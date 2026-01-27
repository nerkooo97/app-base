'use client';

export default function ProfileHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="text-left">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white font-outfit tracking-tight">Moj profil</h1>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                    Upravljajte ličnim podacima i sigurnošću
                </p>
            </div>
        </div>
    );
}
