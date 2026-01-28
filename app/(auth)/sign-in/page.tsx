import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, ShieldCheck, Mail, Lock } from 'lucide-react';
import ForgotPasswordDialog from '@/components/auth/forgot-password-dialog';
import { getSystemName } from '@/lib/queries/settings';

export default async function SignInPage(props: {
    searchParams: Promise<{ error?: string }>;
}) {
    const searchParams = await props.searchParams;
    const error = searchParams.error;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return redirect('/');
    }

    // Fetch system name for branding via shared query
    const appName = await getSystemName(supabase);


    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Visual / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://placehold.co/1200x1600/536dfe/ffffff?text=ERP+EdVision\nManagement+System"
                        alt="ERP Visual"
                        className="w-full h-full object-cover opacity-20 scale-110 active:scale-100 transition-transform duration-10000"
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
                        <h2 className="text-4xl font-semibold text-white font-outfit leading-tight max-w-md">
                            Temelj povjerenja u svakoj izgrađenoj konstrukciji.
                        </h2>
                        <p className="text-lg text-white/70 max-w-sm font-medium leading-relaxed">
                            U Baupartneru, gradnja nije samo posao – to je predanost preciznosti, sigurnosti i dugovječnosti.
                        </p>

                        <div className="pt-8 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-white/40 text-[10px] font-semibold uppercase tracking-widest">
                        <span>© 2026 ed-vision.com</span>
                        <span>•</span>
                        <span>Sva prava zadržana</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-left space-y-2">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-lg text-gray-900">{appName}</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-gray-900 font-outfit">Dobro došli nazad</h1>
                        <p className="text-sm font-semibold text-gray-400">Prijavite se na svoj nalog kako biste nastavili rad.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form action={signIn} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">Email adresa</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="npr. ime.prezime@edvision.ba"
                                        autoComplete="email"
                                        required
                                        className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50/50 font-semibold focus:bg-white transition-all shadow-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lozinka</Label>
                                    <ForgotPasswordDialog />
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                        className="h-12 pl-12 rounded-xl border-gray-100 bg-gray-50/50 font-semibold focus:bg-white transition-all shadow-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-sm"
                        >
                            Prijavi se na sistem
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400">
                            Nemate nalog? <a href="#" className="text-primary hover:underline">Kontaktirajte administratora.</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
