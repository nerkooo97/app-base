'use client';

import { useRef, useState, useEffect } from 'react';

interface MFACodeInputProps {
    onComplete: () => void;
    error?: boolean;
}

export default function MFACodeInput({ onComplete, error }: MFACodeInputProps) {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const joined = code.join('');
        if (joined.length === 6 && code.every(digit => digit !== '')) {
            onComplete();
        }
    }, [code, onComplete]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newCode = [...code];
        // Only take the last digit if entering manually
        newCode[index] = val.slice(-1);
        setCode(newCode);

        // Move to next input
        if (val && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(char => isNaN(Number(char)))) return;

        const newCode = [...code];
        pastedData.forEach((char, i) => {
            if (i < 6) newCode[i] = char;
        });
        setCode(newCode);

        // Focus the last filled or next empty
        const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
        inputs.current[nextIndex]?.focus();
    };

    return (
        <div className="flex items-center justify-center gap-0 bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden p-1 shadow-inner group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/20 transition-all">
            {code.map((digit, index) => (
                <div key={index} className="flex items-center flex-1 relative">
                    <input
                        ref={(el) => { inputs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-full h-16 bg-transparent text-center text-3xl font-black text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-200"
                        autoFocus={index === 0}
                    />
                    {index < 5 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-gray-200 dark:bg-gray-800" />
                    )}
                </div>
            ))}
            <input type="hidden" name="code" value={code.join('')} />
        </div>
    );
}
