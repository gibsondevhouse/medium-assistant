import React from 'react';

interface MosaicGridProps {
    children: React.ReactNode;
    className?: string;
}

export const MosaicGrid: React.FC<MosaicGridProps> = ({ children, className = '' }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 auto-rows-[minmax(300px,auto)] ${className}`}>
            {children}
        </div>
    );
};

// Sub-components for semantic layout within the mosaic
export const HeroSpan: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`col-span-1 md:col-span-2 lg:col-span-6 row-span-2 ${className}`}>
        {children}
    </div>
);

export const LargeSpan: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`col-span-1 md:col-span-2 lg:col-span-3 ${className}`}>
        {children}
    </div>
);

export const StandardSpan: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`col-span-1 md:col-span-1 lg:col-span-2 ${className}`}>
        {children}
    </div>
);
