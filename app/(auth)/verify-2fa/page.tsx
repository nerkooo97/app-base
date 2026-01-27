import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, ShieldCheck, Smartphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function Verify2FAPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const searchParams = await props.searchParams;
    const error = searchParams.error;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/sign-in');
    }

    // Check if user actually has MFA factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const activeFactor = factors?.all.find(f => f.status === 'verified');

    if (!activeFactor) {
        return redirect('/');
    }

    // Fetch system name for branding
    const { data: appNameSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'system_name')
        .single();

    const appName = appNameSetting?.value ? String(appNameSetting.value).replace(/^"|"$/g, '') : 'ERP System';

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Visual / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://placehold.co/1200x1600/536dfe/ffffff?text=Sigurnost+na+prvom+mestu\nDvo-faktorska+autentifikacija"
                        alt="Security Visual"
                        className="w-full h-full object-cover opacity-20 scale-110"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/40 z-1" />

                <div className="relative z-10 w-full p-16 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <LayoutDashboard className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white font-outfit tracking-tight">{appName}</span>
                    </div>

                    <div className="space-y-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white font-outfit leading-tight max-w-md">
                            Vaš nalog je dodatno zaštićen.
                        </h2>
                        <p className="text-lg text-white/70 max-w-sm font-medium leading-relaxed">
                            Dvo-faktorska autentifikacija sprečava neovlašćen pristup vašim podacima čak i ako neko sazna vašu lozinku.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <span>© 2026 ed-vision.com</span>
                        <span>•</span>
                        <span>Sistemska Sigurnost</span>
                    </div>
                </div>
            </div>

            {/* Right Side: 2FA Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-left space-y-2">
                        <Link href="/sign-in" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors mb-4 group">
                            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                            Nazad na prijavu
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 font-outfit">Verifikacija</h1>
                        <p className="text-sm font-bold text-gray-400">Unesite 6-cifreni kod iz vaše autentifikatorske aplikacije.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form action={async (formData) => {
                        'use server';
                        const code = formData.get('code') as string;
                        const { createClient } = await import('@/lib/supabase/server');
                        const { redirect } = await import('next/navigation');
                        const supabase = await createClient();

                        // 1. Get factors
                        const { data: factors } = await supabase.auth.mfa.listFactors();
                        const activeFactor = factors?.all.find(f => f.status === 'verified');

                        if (!activeFactor) {
                            return redirect('/sign-in');
                        }

                        // 2. Challenge
                        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                            factorId: activeFactor.id
                        });

                        if (challengeError) {
                            return redirect(`/verify-2fa?error=${encodeURIComponent(challengeError.message)}`);
                        }

                        // 3. Verify
                        const { error: verifyError } = await supabase.auth.mfa.verify({
                            factorId: activeFactor.id,
                            challengeId: challengeData.id,
                            code
                        });

                        if (verifyError) {
                            return redirect(`/verify-2fa?error=${encodeURIComponent('Neispravan kod. Pokušajte ponovo.')}`);
                        }

                        return redirect('/');
                    }} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2 text-center">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Kod za potvrdu</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    placeholder="000 000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                    className="h-16 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-center text-3xl tracking-[0.4em] focus:bg-white focus:border-primary/20 transition-all shadow-none placeholder:text-gray-200"
                                />
                                <div className="flex justify-center pt-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                                        <Smartphone className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Potvrda putem telefona</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-base gap-3"
                        >
                            <ShieldCheck className="h-5 w-5" />
                            Verifikuj i nastavi
                        </Button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-xs font-bold text-gray-400">
                            Imate problema? <a href="#" className="text-primary hover:underline">Iskoristite rezervni kod.</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
