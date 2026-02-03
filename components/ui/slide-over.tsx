'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils";

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
    footer?: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    className?: string;
}

export default function SlideOver({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    onSubmit,
    className
}: SlideOverProps) {
    const ContentWrapper = onSubmit ? "form" : "div";

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    "w-full sm:max-w-md p-0 border-l border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-950 flex flex-col h-full",
                    className
                )}
            >
                <ContentWrapper
                    // @ts-ignore - dynamic component handling
                    onSubmit={onSubmit}
                    className="flex flex-col h-full overflow-hidden"
                >
                    <SheetHeader className="px-8 py-8 border-b border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 text-left shrink-0">
                        <SheetTitle className="text-2xl font-semibold font-outfit text-gray-900 dark:text-white leading-none">
                            {title}
                        </SheetTitle>
                        {description && (
                            <SheetDescription className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5 leading-none">
                                {description}
                            </SheetDescription>
                        )}
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 min-h-0">
                        {children}
                    </div>

                    {footer && (
                        <SheetFooter className="p-8 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                            {footer}
                        </SheetFooter>
                    )}
                </ContentWrapper>
            </SheetContent>
        </Sheet>
    );
}
