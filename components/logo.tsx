import Image from 'next/image';

interface LogoProps {
    className?: string;
    height?: number;
    white?: boolean;
}

export function Logo({ className = '', height = 40, white = false }: LogoProps) {
    return (
        <div className={className} style={{ height: `${height}px` }}>
            <Image
                src="/logo-standard.png"
                alt="EdVision Logo"
                width={0}
                height={0}
                sizes="100vw"
                style={{ 
                    width: 'auto', 
                    height: '100%',
                    filter: white ? 'brightness(0) invert(1)' : 'none'
                }}
                priority
            />
        </div>
    );
}
