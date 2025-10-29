import React, { useState, useEffect } from 'react';
import { Listing, Language, TranslationSet } from '../types';
import { Icon } from './Icon';
import { supabase } from '../lib/supabaseClient';

interface ListingPageProps {
    listingId: string;
    language: Language;
    t: TranslationSet;
}

const ListingPage: React.FC<ListingPageProps> = ({ listingId, language, t }) => {
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            if (!supabase) {
                setError("Supabase client not available.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .single();

                if (error) throw error;
                
                const listingWithImage = {
                  ...data,
                  images: data.images && data.images.length > 0 ? data.images : [`https://picsum.photos/seed/${data.id}/800/600`]
                };
                setListing(listingWithImage);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch listing details.');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [listingId]);
    
    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greek-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Listing...</p>
            </div>
        );
    }

    if (error || !listing) {
        return (
             <div className="text-center py-16 text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-bold">Could not load listing</p>
                <p>{error || "The listing could not be found."}</p>
            </div>
        )
    }

    const title = language === 'en' ? listing.title_en : listing.title_gr;
    const description = language === 'en' ? listing.description_en : listing.description_gr;

    return (
        <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 mb-6 text-sm font-semibold text-greek-blue-700 hover:text-greek-blue-900 transition-colors"
            >
                <Icon name="ArrowLeft" className="w-5 h-5" />
                <span>Back to listings</span>
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img className="h-64 md:h-96 w-full object-cover" src={listing.images[0].replace('/400/300', '/800/600')} alt={title} />

                <div className="p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-greek-blue-800 mb-4">{title}</h1>
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>

                {listing.contact && (
                    <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-greek-blue-800 mb-4">Contact Information</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4">
                            <a href={`tel:${listing.contact.phone}`} className="flex items-center gap-3 px-4 py-3 text-base font-medium text-greek-blue-700 bg-greek-blue-100 rounded-lg hover:bg-greek-blue-200 transition-colors">
                                <Icon name="Phone" className="w-5 h-5" />
                                <span>{t.call}</span>
                            </a>
                            <a href={`https://wa.me/${listing.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                <Icon name="WhatsApp" className="w-5 h-5" />
                                <span>{t.whatsapp}</span>
                            </a>
                            <a href={`mailto:${listing.contact.email}`} className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                <Icon name="Mail" className="w-5 h-5" />
                                <span>{t.email}</span>
                            </a>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lon}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-greek-blue-700 bg-greek-blue-100 rounded-lg hover:bg-greek-blue-200 transition-colors"
                            >
                                <Icon name="Location" className="w-5 h-5" />
                                <span>{t.directions}</span>
                            </a>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 mt-4">
                            {listing.contact.facebook && (
                                <a href={listing.contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                                    <Icon name="Facebook" className="w-6 h-6" />
                                </a>
                            )}
                            {listing.contact.instagram && (
                                <a href={listing.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center w-10 h-10 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors">
                                    <Icon name="Instagram" className="w-6 h-6" />
                                </a>
                            )}
                            {listing.contact.twitter && (
                                <a href={listing.contact.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex items-center justify-center w-10 h-10 bg-sky-100 text-sky-500 rounded-full hover:bg-sky-200 transition-colors">
                                    <Icon name="Twitter" className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingPage;