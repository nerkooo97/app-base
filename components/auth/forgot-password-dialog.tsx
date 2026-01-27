'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export default function ForgotPasswordDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="text-[10px] font-bold text-primary hover:text-primary/80 transition-all">
                    Zaboravili ste lozinku?
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-gray-100 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Info className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-gray-900 font-outfit">Resetovanje lozinke</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-gray-400">Instrukcije za oporavak vašeg naloga.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-8 space-y-4">
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Zbog sigurnosnih polisa sistema, samostalno resetovanje lozinke putem emaila je trenutno onemogućeno.
                    </p>
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-xs font-bold text-gray-900 leading-relaxed">
                            Molimo Vas da kontaktirate <span className="text-primary">sistem administratora</span> putem internog ticketa ili službenog telefona kako biste dobili privremenu lozinku.
                        </p>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-0 flex justify-end">
                    <DialogClose asChild>
                        <Button type="button" className="rounded-xl font-bold h-10 px-6">
                            Razumijem
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
