'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
}

export default function SlideOver({ isOpen, onClose, title, description, children }: SlideOverProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-950">
                <SheetHeader className="px-8 py-8 border-b border-gray-50 dark:border-gray-800 flex flex-col items-start bg-white dark:bg-gray-950 sticky top-0 z-10 backdrop-blur-md text-left">
                    <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">
                            {description}
                        </SheetDescription>
                    )}
                </SheetHeader>
                <div className="h-[calc(100dvh-120px)] overflow-y-auto px-6 py-8">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
