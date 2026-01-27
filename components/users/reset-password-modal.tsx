'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, AlertCircle } from 'lucide-react';
import { resetUserPassword } from '@/app/(app)/users/actions';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async () => {
        setError(null);

        // Validation
        if (newPassword.length < 8) {
            setError('Lozinka mora imati najmanje 8 karaktera');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Lozinke se ne poklapaju');
            return;
        }

        setIsResetting(true);
        const result = await resetUserPassword(user.user_id, newPassword);

        if (result.success) {
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } else {
            setError(result.error || 'Greška pri resetovanju lozinke');
        }
        setIsResetting(false);
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md rounded-2xl border-gray-100 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                            <KeyRound className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-gray-900 font-outfit">Resetuj lozinku</DialogTitle>
                            <p className="text-xs font-bold text-gray-400 mt-1">
                                Korisnik: <span className="text-gray-900">{user?.full_name}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">Nova lozinka</Label>
                        <Input
                            type="password"
                            placeholder="Unesite novu lozinku"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">Potvrdi lozinku</Label>
                        <Input
                            type="password"
                            placeholder="Potvrdite novu lozinku"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none"
                        />
                    </div>

                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-bold text-blue-900 leading-relaxed">
                            Korisnik će moći da se prijavi sa novom lozinkom odmah nakon resetovanja.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 flex gap-3">
                    <DialogClose asChild>
                        <Button variant="ghost" className="flex-1 h-11 rounded-xl font-bold">
                            Odustani
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleReset}
                        disabled={isResetting || !newPassword || !confirmPassword}
                        className="flex-1 h-11 rounded-xl font-bold shadow-sm"
                    >
                        {isResetting ? 'Resetujem...' : 'Resetuj lozinku'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
