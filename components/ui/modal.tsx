'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
}

export default function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-6 border-b border-gray-50 bg-white text-left">
                    <DialogTitle className="text-lg font-semibold text-gray-900 font-outfit">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="p-8 bg-white">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
