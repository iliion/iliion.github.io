
import React from 'react';
import { Listing, Language, TranslationSet } from '../types';
import ListingCard from './ListingCard';

interface ListViewProps {
    listings: Listing[];
    language: Language;
    t: TranslationSet;
    loading: boolean;
    hoveredId?: number | null;
    onHover?: (id: number | null) => void;
}

// Skeleton component for loading state, now with a compact variant for split view
const ListingCardSkeleton: React.FC<{ isSplitView?: boolean }> = ({ isSplitView }) => {
    if (isSplitView) {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex animate-pulse">
                <div className="h-24 w-24 bg-gray-300 flex-shrink-0"></div>
                <div className="p-3 flex flex-col justify-center w-full">
                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6 mt-1"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 w-full bg-gray-300"></div>
            <div className="p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-center gap-2">
                    <div className="h-9 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-9 w-28 bg-gray-200 rounded-full"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// ListView component
const ListView: React.FC<ListViewProps> = ({ listings, language, t, loading, hoveredId, onHover }) => {
    const isSplitView = !!onHover; // A simple way to detect if it's in split mode

    if (loading) {
        return (
            <div className={isSplitView ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {[...Array(isSplitView ? 10 : 6)].map((_, i) => <ListingCardSkeleton key={i} isSplitView={isSplitView} />)}
            </div>
        );
    }
    
    if (listings.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600">{t.noListings}</p>
            </div>
        );
    }

    return (
        <div className={isSplitView ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {listings.map(listing => (
                <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    language={language} 
                    t={t}
                    isHovered={listing.id === hoveredId}
                    onMouseEnter={onHover ? () => onHover(listing.id) : undefined}
                    onMouseLeave={onHover ? () => onHover(null) : undefined}
                    isSplitView={isSplitView}
                />
            ))}
        </div>
    );
};

export default ListView;
