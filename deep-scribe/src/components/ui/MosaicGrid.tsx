import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type MosaicPattern = 'editorial' | 'standard';

interface MosaicGridProps<T> {
    /** The data array to render */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number, spanClass: string) => React.ReactNode;
    /** Unique key extractor for items */
    keyExtractor: (item: T) => string | number;
    /** Layout pattern to use */
    pattern?: MosaicPattern;
    /** Optional custom class name for the grid container */
    className?: string;
    /** Component to render when items array is empty */
    ListEmptyComponent?: React.ReactNode;
    /** Optional inline styles */
    style?: React.CSSProperties;
}

export function MosaicGrid<T>({
    items,
    renderItem,
    keyExtractor,
    pattern = 'standard',
    className,
    ListEmptyComponent,
    style
}: MosaicGridProps<T>) {

    if (items.length === 0 && ListEmptyComponent) {
        return <>{ListEmptyComponent}</>;
    }

    const getSpanClass = (index: number) => {
        if (pattern === 'editorial') {
            // Hero (2x2), Sub-hero (1x2), then standard tiles
            // NOTE: These match the CSS Grid configuration for adequate spanning
            if (index === 0) return 'md:col-span-2 md:row-span-2';
            if (index === 1) return 'md:col-span-1 md:row-span-2';
            return 'col-span-1 md:row-span-1';
        }
        return 'col-span-1';
    };

    // Default grid styles if none provided via className
    // We use auto-fit with minmax to ensure responsive wrapping
    const defaultStyles: React.CSSProperties = {
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gridAutoRows: '280px',
        ...style
    };

    return (
        <div
            className={cn("grid gap-6", className)}
            style={!className ? defaultStyles : style}
        >
            {items.map((item, index) => (
                <React.Fragment key={keyExtractor(item)}>
                    {renderItem(item, index, getSpanClass(index))}
                </React.Fragment>
            ))}
        </div>
    );
}
