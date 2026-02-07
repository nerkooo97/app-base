import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, ArrowLeft } from 'lucide-react';
import MFAForm from '@/components/auth/mfa-form';
import Link from 'next/link';
import { getSystemName } from '@/lib/queries/settings';

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
    const appName = await getSystemName(supabase);


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
                        <span className="text-2xl font-semibold text-white font-outfit tracking-tight">{appName}</span>
                    </div>

                    <div className="space-y-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-semibold text-white font-outfit leading-tight max-w-md">
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
                        <form action={async () => {
                            'use server';
                            const { signOut } = await import('../sign-out-action');
                            await signOut();
                        }}>
                            <button type="submit" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition-colors mb-4 group cursor-pointer">
                                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                                Odustani i nazad na prijavu
                            </button>
                        </form>
                        <h1 className="text-3xl font-semibold text-gray-900 font-outfit">Verifikacija</h1>
                        <p className="text-sm font-semibold text-gray-400">Unesite 6-cifreni kod iz vaše autentifikatorske aplikacije.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <MFAForm onVerify={async (formData) => {
                        'use server';
                        const { verify2FA } = await import('../actions');
                        await verify2FA(formData);
                    }} />

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
