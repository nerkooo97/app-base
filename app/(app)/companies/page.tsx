'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllCompanies } from '@/lib/queries/companies';

import CompaniesHeader from '@/components/companies/companies-header';
import CompaniesTable from '@/components/companies/companies-table';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllCompanies(supabase);
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch =
                company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.city?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [companies, searchQuery]);

    if (isLoading && companies.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 dark:text-gray-500 font-medium text-xs">Učitavanje firmi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <CompaniesHeader />
            <CompaniesTable
                companies={filteredCompanies}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
        </div>
    );
}
