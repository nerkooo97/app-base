'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import { createCompany } from '../actions';
import CompanyForm from '@/components/companies/company-form';

export default function NewCompanyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const result = await createCompany(formData);
            if (result.success) {
                showToast('success', 'Firma uspješno kreirana!');
                router.push('/companies');
            } else {
                showToast('error', 'Greška: ' + result.error);
            }
        } catch (error: any) {
            showToast('error', 'Greška pri kreiranju firme');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/companies"
                    className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit">Nova firma</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Popunite osnovne podatke o firmi
                    </p>
                </div>
            </div>

            <CompanyForm
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/companies')}
            />
        </div>
    );
}
