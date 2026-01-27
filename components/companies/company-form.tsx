'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Loader2, Building2, FileText, MapPin, Phone, Landmark, Info, Globe, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyFormProps {
    initialData?: any;
    isLoading?: boolean;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

type TabId = 'basic' | 'contact' | 'billing';

const TABS = [
    {
        id: 'basic',
        label: 'Osnovni podaci',
        description: 'Generalne informacije',
        icon: Building2
    },
    {
        id: 'contact',
        label: 'Adresa i Kontakt',
        description: 'Lokacija i komunikacija',
        icon: MapPin
    },
    {
        id: 'billing',
        label: 'Finansije i Napomene',
        description: 'Bankovni računi i bilješke',
        icon: Landmark
    },
] as const;

export default function CompanyForm({ initialData, isLoading, onSubmit, onCancel }: CompanyFormProps) {
    const [activeTab, setActiveTab] = useState<TabId>('basic');
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        registration_number: initialData?.registration_number || '',
        tax_number: initialData?.tax_number || '',
        vat_number: initialData?.vat_number || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        postal_code: initialData?.postal_code || '',
        country: initialData?.country || 'Bosnia and Herzegovina',
        canton: initialData?.canton || '',
        phone: initialData?.phone || '',
        fax: initialData?.fax || '',
        email: initialData?.email || '',
        website: initialData?.website || '',
        bank_name: initialData?.bank_name || '',
        bank_account: initialData?.bank_account || '',
        industry: initialData?.industry || '',
        notes: initialData?.notes || '',
        status: initialData?.status || 'active',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Vertical Tabs Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-2">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
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
                                            "font-bold text-sm",
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
                    {/* Tab: Osnovni podaci */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                        Informacije o firmi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">
                                                Naziv firme <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                                placeholder="npr. Edvision d.o.o."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Djelatnost</Label>
                                            <Input
                                                value={formData.industry}
                                                onChange={(e) => handleChange('industry', e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                                placeholder="npr. IT usluge"
                                            />
                                        </div>
                                    </div>
                                    {initialData && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Status</Label>
                                            <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                                                <SelectTrigger className="h-11 w-full md:w-[200px] rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Aktivna</SelectItem>
                                                    <SelectItem value="inactive">Neaktivna</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        Poreski podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">ID broj / Matični broj</Label>
                                        <Input
                                            value={formData.registration_number}
                                            onChange={(e) => handleChange('registration_number', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">PIB / OIB</Label>
                                        <Input
                                            value={formData.tax_number}
                                            onChange={(e) => handleChange('tax_number', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">PDV broj</Label>
                                        <Input
                                            value={formData.vat_number}
                                            onChange={(e) => handleChange('vat_number', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: Adresa i Kontakt */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        Adresa sjedišta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Ulica i broj</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Grad</Label>
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Poštanski broj</Label>
                                            <Input
                                                value={formData.postal_code}
                                                onChange={(e) => handleChange('postal_code', e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Kanton</Label>
                                            <Input
                                                value={formData.canton}
                                                onChange={(e) => handleChange('canton', e.target.value)}
                                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Država</Label>
                                        <Select value={formData.country} onValueChange={(val) => handleChange('country', val)}>
                                            <SelectTrigger className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                                                <SelectItem value="Serbia">Serbia</SelectItem>
                                                <SelectItem value="Croatia">Croatia</SelectItem>
                                                <SelectItem value="Montenegro">Montenegro</SelectItem>
                                                <SelectItem value="North Macedonia">North Macedonia</SelectItem>
                                                <SelectItem value="Slovenia">Slovenia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        Kontakt podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Telefon</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Fax</Label>
                                        <Input
                                            value={formData.fax}
                                            onChange={(e) => handleChange('fax', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className="pl-9 h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={formData.website}
                                                onChange={(e) => handleChange('website', e.target.value)}
                                                className="pl-9 h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                                placeholder="https://"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: Finansije i Napomene */}
                    {activeTab === 'billing' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Landmark className="h-5 w-5 text-gray-400" />
                                        Bankarski podaci
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Banka</Label>
                                        <Input
                                            value={formData.bank_name}
                                            onChange={(e) => handleChange('bank_name', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Žiro račun</Label>
                                        <Input
                                            value={formData.bank_account}
                                            onChange={(e) => handleChange('bank_account', e.target.value)}
                                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit flex items-center gap-2">
                                        <Info className="h-5 w-5 text-gray-400" />
                                        Napomene
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('notes', e.target.value)}
                                        className="min-h-[120px] rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none resize-none"
                                        placeholder="Unesite dodatne napomene o firmi..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 justify-end pt-6 border-t border-gray-100 dark:border-gray-800 mt-8">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="h-12 px-8 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    disabled={isLoading}
                >
                    Odustani
                </Button>
                <Button
                    type="submit"
                    className="h-12 px-10 rounded-xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-base"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {initialData ? 'Sačuvaj izmjene' : 'Kreiraj firmu'}
                </Button>
            </div>
        </form>
    );
}
