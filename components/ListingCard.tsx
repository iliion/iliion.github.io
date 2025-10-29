
import React from 'react';
import { Listing, Language, TranslationSet } from '../types';
import { Icon } from './Icon';
import { navigate } from '../utils/navigation';

interface ListingCardProps {
    listing: Listing;
    language: Language;
    t: TranslationSet;
    isHovered?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    isSplitView?: boolean;
}

// ListingCard component
const ListingCard: React.FC<ListingCardProps> = ({ listing, language, t, isHovered, onMouseEnter, onMouseLeave, isSplitView }) => {
    const title = language === 'en' ? listing.title_en : listing.title_gr;
    const description = language === 'en' ? listing.description_en : listing.description_gr;

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Allow opening in new tab
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(`/listing/${listing.id}`);
    };

    if (isSplitView) {
        return (
             <a 
                href={`/listing/${listing.id}`}
                onClick={handleNavigation}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 flex cursor-pointer group border-2 ${isHovered ? 'border-greek-blue-500 shadow-md' : 'border-transparent'}`}
            >
                <img className="h-24 w-24 object-cover flex-shrink-0" src={listing.images[0]} alt={title} />
                <div className="p-3 flex flex-col justify-center">
                    <h3 className="text-md font-bold text-greek-blue-800 mb-1 leading-tight line-clamp-2">{title}</h3>
                    <p className="text-gray-600 text-xs flex-grow line-clamp-2">{description}</p>
                </div>
            </a>
        )
    }

    return (
        <a 
            href={`/listing/${listing.id}`}
            onClick={handleNavigation}
            className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group border-2 ${isHovered ? 'border-greek-blue-500' : 'border-transparent'}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="h-48 w-full overflow-hidden">
                <img className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={listing.images[0]} alt={title} />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-greek-blue-800 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm flex-grow line-clamp-3">{description}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                {listing.contact && (
                    <div className="flex items-center justify-center flex-wrap gap-2">
                        <a onClick={(e) => e.stopPropagation()} href={`tel:${listing.contact.phone}`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-greek-blue-700 bg-greek-blue-100 rounded-full hover:bg-greek-blue-200 transition-colors">
                            <Icon name="Phone" className="w-4 h-4" />
                            <span>{t.call}</span>
                        </a>
                        <a onClick={(e) => e.stopPropagation()} href={`https://wa.me/${listing.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
                            <Icon name="WhatsApp" className="w-4 h-4" />
                            <span>{t.whatsapp}</span>
                        </a>
                        <a onClick={(e) => e.stopPropagation()} href={`mailto:${listing.contact.email}`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                            <Icon name="Mail" className="w-4 h-4" />
                            <span>{t.email}</span>
                        </a>
                        
                        {listing.contact.facebook && (
                            <a onClick={(e) => e.stopPropagation()} href={listing.contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                                <Icon name="Facebook" className="w-5 h-5" />
                            </a>
                        )}
                        {listing.contact.instagram && (
                            <a onClick={(e) => e.stopPropagation()} href={listing.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center w-9 h-9 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors">
                                <Icon name="Instagram" className="w-5 h-5" />
                            </a>
                        )}
                        {listing.contact.twitter && (
                            <a onClick={(e) => e.stopPropagation()} href={listing.contact.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex items-center justify-center w-9 h-9 bg-sky-100 text-sky-500 rounded-full hover:bg-sky-200 transition-colors">
                                <Icon name="Twitter" className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </a>
    );
};

export default ListingCard;
