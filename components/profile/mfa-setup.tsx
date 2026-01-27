'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, QrCode, Smartphone, Check, AlertCircle, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { enrollMfa, verifyMfa, getMfaFactors, unenrollMfa } from '@/app/(app)/profile/actions';
import { useToast } from '@/components/ui/toast-provider';

export default function MfaSetup() {
    const [factors, setFactors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollData, setEnrollData] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const loadFactors = async () => {
        try {
            const data = await getMfaFactors();
            setFactors(data.all || []);
        } catch (err) {
            console.error('Error loading factors:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFactors();
    }, []);

    const handleStartEnroll = async () => {
        setIsEnrolling(true);
        setError(null);
        try {
            const data = await enrollMfa();
            setEnrollData(data);
        } catch (err: any) {
            setError(err.message || 'Greška pri pokretanju 2FA registracije');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleVerifyEnroll = async () => {
        if (!enrollData || !verificationCode) return;
        setIsVerifying(true);
        setError(null);
        try {
            await verifyMfa(enrollData.id, verificationCode);
            setEnrollData(null);
            setVerificationCode('');
            await loadFactors();
        } catch (err: any) {
            setError(err.message || 'Neispravan kod. Pokušajte ponovo.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleUnenroll = async (factorId: string) => {
        if (!confirm('Da li ste sigurni da želite isključiti 2FA?')) return;
        setIsLoading(true);
        try {
            await unenrollMfa(factorId);
            await loadFactors();
        } catch (err: any) {
            showToast('error', err.message || 'Greška pri isključivanju 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    const activeFactor = factors.find(f => f.status === 'verified');

    if (isLoading) {
        return (
            <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/30 border-b border-gray-100 py-6 px-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black text-gray-900 font-outfit">Dvo-faktorska autentifikacija (2FA)</CardTitle>
                        <CardDescription className="text-xs font-bold text-gray-400">Dodajte dodatni sloj sigurnosti svom računu.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {!activeFactor && !enrollData && (
                    <div className="space-y-6 max-w-lg">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                            <Smartphone className="h-6 w-6 text-primary shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">Zaštitite svoj račun</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Kada omogućite 2FA, biće vam tražen kod iz aplikacije (poput Google Authenticator-a) svaki put kada se prijavljujete na novi uređaj.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleStartEnroll}
                            disabled={isEnrolling}
                            className="h-11 px-8 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                        >
                            {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                            Postavi 2FA
                        </Button>
                    </div>
                )}

                {enrollData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 transition-all max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center">
                                    <QRCodeSVG value={enrollData.totp.uri} size={180} level="H" includeMargin={true} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tajni ključ</p>
                                    <code className="text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded mt-1 block break-all">
                                        {enrollData.totp.secret}
                                    </code>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Skenirajte QR kod</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Otvorite svoju autentifikatorsku aplikaciju i skenirajte kod iznad ili unesite tajni ključ ručno. Nakon toga, unesite 6-cifreni kod ispod.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Kod iz aplikacije</Label>
                                    <Input
                                        placeholder="000 000"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-center tracking-[0.5em] text-xl focus:bg-white transition-all shadow-none"
                                    />
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold mt-2 animate-pulse">
                                            <AlertCircle className="h-3 w-3" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleVerifyEnroll}
                                        disabled={isVerifying || verificationCode.length !== 6}
                                        className="flex-1 h-11 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                                    >
                                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                        Verifikuj i aktiviraj
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setEnrollData(null)}
                                        className="h-11 px-4 rounded-xl font-bold text-gray-400"
                                    >
                                        Odustani
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeFactor && (
                    <div className="space-y-6 max-w-lg">
                        <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-emerald-900">2FA je aktiviran</p>
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Aktivan</span>
                                </div>
                                <p className="text-xs text-emerald-700/70 mt-1 leading-relaxed">
                                    Vaš račun je zaštićen dvo-faktorskom autentifikacijom koristeći TOTP metodu.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-bold">Verifikovano putem aplikacije</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnenroll(activeFactor.id)}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs gap-2 rounded-lg"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Isključi 2FA
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
