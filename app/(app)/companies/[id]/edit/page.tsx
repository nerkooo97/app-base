'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getCompanyById } from '@/lib/queries/companies';
import { useToast } from '@/components/ui/toast-provider';
import { updateCompany } from '../../actions';
import CompanyForm from '@/components/companies/company-form';

export default function EditCompanyPage() {
    const params = useParams();
    const companyId = params?.id as string;
    const [company, setCompany] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchCompany = useCallback(async () => {
        if (!companyId) return;
        setIsFetching(true);
        try {
            const data = await getCompanyById(supabase, companyId);
            setCompany(data);
        } catch (error) {
            console.error('Error fetching company:', error);
        } finally {
            setIsFetching(false);
        }
    }, [companyId, supabase]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const result = await updateCompany(companyId, formData);
            if (result.success) {
                showToast('success', 'Firma uspješno ažurirana!');
                router.push(`/companies/${companyId}`);
            } else {
                showToast('error', 'Greška: ' + result.error);
            }
        } catch (error: any) {
            showToast('error', 'Greška pri ažuriranju firme');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 dark:text-gray-500 font-medium text-xs">Učitavanje podataka...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href={`/companies/${companyId}`}
                    className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit">Uredi firmu</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        {company?.name}
                    </p>
                </div>
            </div>

            <CompanyForm
                initialData={company}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/companies/${companyId}`)}
            />
        </div>
    );
}
