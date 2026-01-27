'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CompaniesHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit">Firme</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    Upravljajte svim firmama i njihovim kontaktima
                </p>
            </div>
            <Link href="/companies/new">
                <Button className="h-11 px-6 rounded-xl font-bold shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova firma
                </Button>
            </Link>
        </div>
    );
}
