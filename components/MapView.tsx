
import React, { useState, useMemo } from 'react';
import { Listing, Language, TranslationSet } from '../types';
import { navigate } from '../utils/navigation';
import { Icon } from './Icon';

interface MapViewProps {
    listings: Listing[];
    language: Language;
    loading: boolean;
    t: TranslationSet;
    hoveredId?: number | null;
    onHover?: (id: number | null) => void;
}

const MAP_LAYERS = {
    default: "https://upload.wikimedia.org/wikipedia/commons/4/47/Map_of_Greece_with_prefectures_en.svg",
    satellite: "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79782/greece_oli_2013065_lrg.jpg",
};

// New types for clustering
interface Cluster {
    type: 'cluster';
    id: string;
    listings: Listing[];
    lat: number;
    lon: number;
    count: number;
}
type MapPoint = Listing | Cluster;

function isCluster(point: MapPoint): point is Cluster {
    return (point as Cluster).type === 'cluster';
}

// Defines the geographic bounds for Greece to normalize coordinates
const GREECE_BOUNDS = {
    minLat: 34.8,
    maxLat: 41.8,
    minLon: 19.5,
    maxLon: 29.7,
};

const ClusterModal: React.FC<{
    cluster: Cluster;
    onClose: () => void;
    language: Language;
    t: TranslationSet;
}> = ({ cluster, onClose, language, t }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-greek-blue-800">{cluster.count} {t.listingsInArea}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                        <Icon name="X" className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto p-4">
                    <div className="space-y-3">
                        {cluster.listings.map(listing => (
                            <a 
                                key={listing.id}
                                href={`/listing/${listing.id}`}
                                onClick={(e) => { e.preventDefault(); navigate(`/listing/${listing.id}`); onClose(); }}
                                className="block p-3 bg-gray-50 rounded-lg hover:bg-greek-blue-50 transition-colors group"
                            >
                                <h4 className="font-semibold text-greek-blue-700 group-hover:underline">
                                    {language === 'en' ? listing.title_en : listing.title_gr}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {language === 'en' ? listing.description_en : listing.description_gr}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// MapView component
const MapView: React.FC<MapViewProps> = ({ listings, language, loading, t, hoveredId, onHover }) => {
    const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
    const [mapLayer, setMapLayer] = useState<'default' | 'satellite'>('default');

    // Normalizes latitude/longitude to a 0-100 scale for positioning
    const normalizeCoord = (value: number, min: number, max: number) => {
        return ((value - min) / (max - min)) * 100;
    };

    const processedPoints = useMemo<MapPoint[]>(() => {
        if (loading || !listings || listings.length === 0) return [];
        
        // Defensively filter for listings with valid coordinates to prevent runtime errors
        const validListings = listings.filter(l => typeof l?.lat === 'number' && typeof l?.lon === 'number');
        if (validListings.length === 0) return [];

        const CLUSTER_RADIUS_NORMALIZED = 6;
        const clusteredListingIds = new Set<number>();
        const clusters: Cluster[] = [];
        
        validListings.forEach(listing => {
            if (clusteredListingIds.has(listing.id)) return;

            const neighbors = [listing];
            const listingPos = {
                x: normalizeCoord(listing.lon, GREECE_BOUNDS.minLon, GREECE_BOUNDS.maxLon),
                y: 100 - normalizeCoord(listing.lat, GREECE_BOUNDS.minLat, GREECE_BOUNDS.maxLat),
            };

            validListings.forEach(otherListing => {
                if (listing.id === otherListing.id || clusteredListingIds.has(otherListing.id)) return;

                const otherPos = {
                    x: normalizeCoord(otherListing.lon, GREECE_BOUNDS.minLon, GREECE_BOUNDS.maxLon),
                    y: 100 - normalizeCoord(otherListing.lat, GREECE_BOUNDS.minLat, GREECE_BOUNDS.maxLat),
                };
                const distance = Math.sqrt(Math.pow(listingPos.x - otherPos.x, 2) + Math.pow(listingPos.y - otherPos.y, 2));

                if (distance < CLUSTER_RADIUS_NORMALIZED) {
                    neighbors.push(otherListing);
                }
            });

            if (neighbors.length > 1) {
                neighbors.forEach(n => clusteredListingIds.add(n.id));
                const avgLat = neighbors.reduce((sum, l) => sum + l.lat, 0) / neighbors.length;
                const avgLon = neighbors.reduce((sum, l) => sum + l.lon, 0) / neighbors.length;
                clusters.push({
                    type: 'cluster',
                    id: `cluster-${avgLat}-${avgLon}`,
                    listings: neighbors,
                    lat: avgLat,
                    lon: avgLon,
                    count: neighbors.length
                });
            }
        });

        const singleListings = validListings.filter(l => !clusteredListingIds.has(l.id));
        return [...clusters, ...singleListings];
    }, [listings, loading]);


    const handlePinClick = (listing: Listing) => {
        navigate(`/listing/${listing.id}`);
    };

    const handleClusterClick = (cluster: Cluster) => {
        setSelectedCluster(cluster);
    };

    return (
        <div className="w-full h-full bg-greek-blue-200 rounded-xl shadow-lg relative overflow-hidden border-4 border-white">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{
                    backgroundImage: `url('${MAP_LAYERS[mapLayer]}')`,
                }}
            ></div>

            <div className="absolute top-3 right-3 z-10 bg-white/70 backdrop-blur-sm rounded-full p-1 flex items-center shadow">
                <button
                    onClick={() => setMapLayer('default')}
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${mapLayer === 'default' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-600'}`}
                >
                    {t.defaultView}
                </button>
                <button
                    onClick={() => setMapLayer('satellite')}
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${mapLayer === 'satellite' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-600'}`}
                >
                    {t.satellite}
                </button>
            </div>
            
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 transition-opacity duration-300">
                    <div className="text-center">
                         <svg className="animate-spin h-8 w-8 text-greek-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-greek-blue-700 font-semibold">Loading Map...</p>
                    </div>
                </div>
            )}
            
            {!loading && processedPoints.map(point => {
                const top = 100 - normalizeCoord(point.lat, GREECE_BOUNDS.minLat, GREECE_BOUNDS.maxLat);
                const left = normalizeCoord(point.lon, GREECE_BOUNDS.minLon, GREECE_BOUNDS.maxLon);

                if (isCluster(point)) {
                    return (
                        <div
                            key={point.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                            style={{ top: `${top}%`, left: `${left}%` }}
                            onClick={() => handleClusterClick(point)}
                        >
                            <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform">
                                {point.count}
                            </div>
                        </div>
                    );
                }

                // Single listing pin
                const listing = point;
                return (
                    <div
                        key={listing.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-0"
                        style={{ top: `${top}%`, left: `${left}%` }}
                        onMouseEnter={() => onHover?.(listing.id)}
                        onMouseLeave={() => onHover?.(null)}
                        onClick={() => handlePinClick(listing)}
                    >
                        <div className={`w-4 h-4 bg-greek-blue-600 rounded-full border-2 border-white shadow-lg transition-transform duration-200 ${listing.id === hoveredId ? 'scale-150 ring-2 ring-white' : 'group-hover:scale-125'}`}></div>
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            })}

            {hoveredId && listings.find(l => l.id === hoveredId) && (() => {
                const activeListing = listings.find(l => l.id === hoveredId)!;
                return (
                    <div 
                        className="absolute bg-white p-3 rounded-lg shadow-2xl transition-all duration-200 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 z-20"
                        style={{ 
                            top: `${100 - normalizeCoord(activeListing.lat, GREECE_BOUNDS.minLat, GREECE_BOUNDS.maxLat)}%`, 
                            left: `${normalizeCoord(activeListing.lon, GREECE_BOUNDS.minLon, GREECE_BOUNDS.maxLon)}%`,
                            minWidth: '200px'
                        }}
                    >
                        <h4 className="font-bold text-greek-blue-800 text-sm">
                            {language === 'en' ? activeListing.title_en : activeListing.title_gr}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                            {language === 'en' ? activeListing.description_en : activeListing.description_gr}
                        </p>
                    </div>
                );
            })()}
            
            {selectedCluster && (
                <ClusterModal 
                    cluster={selectedCluster} 
                    onClose={() => setSelectedCluster(null)} 
                    language={language}
                    t={t}
                />
            )}
        </div>
    );
};

export default MapView;
