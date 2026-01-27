'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldCheck } from 'lucide-react';

export default function SystemStatus() {
    return (
        <Card className="bg-primary border-none text-white shadow-xl overflow-hidden relative group rounded-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all duration-1000"></div>
            <CardContent className="p-8 relative z-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black font-outfit">Status sistema</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <ShieldCheck className="h-3 w-3 text-emerald-300" />
                            <span className="text-[9px] font-bold text-emerald-200">Kriptovana veza aktivna</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-white/90 font-bold max-w-md leading-relaxed">
                    Svi podsistemi su u zelenom. ERP je direktno povezan sa vašim klasterom baze podataka bez odlaganja.
                </p>

                <div className="mt-8 flex items-center gap-3">
                    <Badge className="bg-white/10 text-white border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-all gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                        <span className="text-[10px] font-bold">Sinhronizacija uživo</span>
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
