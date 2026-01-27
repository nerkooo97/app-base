'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Mail, Lock, Check } from 'lucide-react';
import { updateEmail, updatePassword } from '@/app/(app)/profile/actions';
import { useToast } from '@/components/ui/toast-provider';

interface SecurityFormProps {
    currentEmail: string;
}

export default function SecurityForm({ currentEmail }: SecurityFormProps) {
    const [email, setEmail] = useState(currentEmail);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [emailSuccess, setEmailSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const { showToast } = useToast();

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingEmail(true);
        setEmailSuccess(false);
        try {
            await updateEmail(email);
            setEmailSuccess(true);
            setTimeout(() => setEmailSuccess(false), 3000);
        } catch (error: any) {
            showToast('error', error.message || 'Greška pri ažuriranju emaila');
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('warning', 'Lozinke se ne podudaraju');
            return;
        }
        if (password.length < 6) {
            showToast('warning', 'Lozinka mora imati najmanje 6 karaktera');
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordSuccess(false);
        try {
            await updatePassword(password);
            setPasswordSuccess(true);
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            showToast('error', error.message || 'Greška pri ažuriranju lozinke');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">Email adresa</CardTitle>
                            <CardDescription className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Primarna adresa za prijavu</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleUpdateEmail} className="space-y-6 max-w-md">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Email adresa</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={isUpdatingEmail || email === currentEmail}
                                className="h-11 px-8 rounded-xl font-semibold shadow-sm active:scale-95 transition-all"
                            >
                                {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Ažuriraj email
                            </Button>
                            {emailSuccess && (
                                <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-semibold text-xs animate-in fade-in slide-in-from-left-2 transition-all uppercase tracking-wider">
                                    <Check className="h-4 w-4" />
                                    Kod za potvrdu poslan
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">Promjena lozinke</CardTitle>
                            <CardDescription className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Redovno mijenjajte lozinku</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Nova lozinka</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Potvrda lozinke</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={isUpdatingPassword || !password}
                                className="h-11 px-8 rounded-xl font-semibold shadow-sm active:scale-95 transition-all"
                            >
                                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Promijeni lozinku
                            </Button>
                            {passwordSuccess && (
                                <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-semibold text-xs animate-in fade-in slide-in-from-left-2 transition-all uppercase tracking-wider">
                                    <Check className="h-4 w-4" />
                                    Lozinka promijenjena
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
