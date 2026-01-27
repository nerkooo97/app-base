'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import MFACodeInput from './mfa-code-input';

interface MFAFormProps {
    onVerify: (formData: FormData) => Promise<void>;
}

export default function MFAForm({ onVerify }: MFAFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = useCallback(() => {
        if (formRef.current && !isSubmitting) {
            setIsSubmitting(true);
            formRef.current.requestSubmit();
        }
    }, [isSubmitting]);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                // We don't try/catch here because we want redirects to bubble up
                // and Next.js handles them.
                await onVerify(formData);
            }}
            className="space-y-8"
        >
            <div className="space-y-4">
                <div className="space-y-2 text-center">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Kod za potvrdu</Label>

                    <MFACodeInput onComplete={handleComplete} />

                    <div className="flex justify-center pt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                            {isSubmitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Smartphone className="h-3.5 w-3.5" />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                {isSubmitting ? 'Verifikacija u toku...' : 'Potvrda putem telefona'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden button for accessibility / fallback, but user said they don't want it visible */}
            <Button
                type="submit"
                className="hidden"
                disabled={isSubmitting}
            >
                Verifikuj
            </Button>

            {/* If it takes too long or they want manual, we could show it, but for now we follow user request */}
        </form>
    );
}
