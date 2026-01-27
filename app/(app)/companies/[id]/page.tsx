'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCompanyById } from '@/lib/queries/companies';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Building2, User, Landmark, FileText, Info, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactsList from '@/components/companies/contacts-list';
import DocumentsTab from '@/components/companies/documents-tab';
import { cn } from '@/lib/utils';

type TabId = 'profile' | 'people' | 'financials' | 'notes' | 'documents';

const TABS = [
    {
        id: 'profile',
        label: 'Profil',
        description: 'Osnovne informacije i kontakt',
        icon: Building2
    },
    {
        id: 'people',
        label: 'Kontakt Osobe',
        description: 'Zaposlenici i saradnici',
        icon: User
    },
    {
        id: 'financials',
        label: 'Finansije',
        description: 'Poreski i bankovni podaci',
        icon: Landmark
    },
    {
        id: 'documents',
        label: 'Dokumenti',
        description: 'Ugovori, rješenja i prilozi',
        icon: FileText
    },
    {
        id: 'notes',
        label: 'Napomene',
        description: 'Bilješke i ostalo',
        icon: Info
    },
] as const;

export default function CompanyDetailPage() {
    const params = useParams();
    const companyId = params?.id as string;
    const [company, setCompany] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const supabase = createClient();

    const fetchCompany = useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const data = await getCompanyById(supabase, companyId);
            setCompany(data);
        } catch (error) {
            console.error('Error fetching company:', error);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, supabase]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    if (isLoading) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400 dark:text-gray-500 font-medium text-xs">Učitavanje podataka...</p>
            </div>
        );
    }

    if (!company) {
        return <div>Company not found</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/companies"
                        className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white font-outfit">{company.name}</h1>
                            <Badge className={`font-semibold text-[10px] gap-1.5 px-2 py-0.5 border-none ${company.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-gray-50 dark:bg-gray-900 text-gray-500'
                                }`}>
                                {company.status === 'active' && (
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                )}
                                {company.status === 'active' ? 'Aktivna' : 'Neaktivna'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">#{company.id.slice(0, 8)}</p>
                    </div>
                </div>
                <Link href={`/companies/${companyId}/edit`}>
                    <Button className="h-11 px-6 rounded-xl font-bold shadow-sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Uredi
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Vertical Tabs */}
                <div className="lg:col-span-3 space-y-2">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-2">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabId)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border-2",
                                        isActive
                                            ? "bg-gray-50 dark:bg-gray-900 border-primary shadow-sm"
                                            : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-800"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className={cn(
                                            "font-semibold text-sm",
                                            isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                        )}>
                                            {tab.label}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-medium mt-0.5",
                                            isActive ? "text-primary dark:text-primary/90" : "text-gray-400 dark:text-gray-600"
                                        )}>
                                            {tab.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 min-h-[500px]">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Basic Info */}
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                        Osnovni podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-4">
                                    {company.industry && (
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Djelatnost</div>
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">{company.industry}</div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(company.address || company.city) && (
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" /> Adresa
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    {company.address && <div>{company.address}</div>}
                                                    <div>
                                                        {company.postal_code && `${company.postal_code} `}
                                                        {company.city}
                                                        {company.canton && `, ${company.canton}`}
                                                    </div>
                                                    {company.country && <div className="text-gray-500 dark:text-gray-400 mt-1">{company.country}</div>}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                <Phone className="h-3 w-3" /> Kontakt
                                            </div>
                                            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                {company.email && (
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <a href={`mailto:${company.email}`} className="text-sm text-primary hover:underline font-medium">{company.email}</a>
                                                    </div>
                                                )}
                                                {company.phone && (
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <a href={`tel:${company.phone}`} className="text-sm text-gray-900 dark:text-white hover:text-primary font-medium">{company.phone}</a>
                                                    </div>
                                                )}
                                                {company.fax && (
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white font-medium">{company.fax}</span>
                                                    </div>
                                                )}
                                                {company.website && (
                                                    <div className="flex items-center gap-3">
                                                        <Globe className="h-4 w-4 text-gray-400" />
                                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">{company.website}</a>
                                                    </div>
                                                )}
                                                {!company.email && !company.phone && !company.fax && !company.website && (
                                                    <div className="text-xs text-gray-400 italic">Nema kontakt podataka</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        Poreski podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {company.registration_number && (
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">ID broj</div>
                                            <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg inline-block border border-gray-100 dark:border-gray-800">
                                                {company.registration_number}
                                            </div>
                                        </div>
                                    )}
                                    {company.tax_number && (
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">PIB/OIB</div>
                                            <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg inline-block border border-gray-100 dark:border-gray-800">
                                                {company.tax_number}
                                            </div>
                                        </div>
                                    )}
                                    {company.vat_number && (
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">PDV broj</div>
                                            <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg inline-block border border-gray-100 dark:border-gray-800">
                                                {company.vat_number}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Landmark className="h-5 w-5 text-gray-400" />
                                        Bankarski podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    {(company.bank_name || company.bank_account) ? (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <Landmark className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                {company.bank_name && (
                                                    <div className="font-semibold text-gray-900 dark:text-white text-lg">{company.bank_name}</div>
                                                )}
                                                {company.bank_account && (
                                                    <div className="font-mono text-gray-500 dark:text-gray-400 mt-1">{company.bank_account}</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center italic">Nema unesenih bankarskih podataka</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'people' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <ContactsList companyId={companyId} contacts={company.contacts || []} onUpdate={fetchCompany} />
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <DocumentsTab companyId={companyId} />
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Info className="h-5 w-5 text-gray-400" />
                                        Napomene
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {company.notes ? (
                                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {company.notes}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic text-center py-8">
                                            Nema unesenih napomena.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
