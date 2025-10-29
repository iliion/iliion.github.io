
import { Category, TranslationSet } from './types';

export const CATEGORIES: Category[] = [
    { id: '1', name_en: 'Wellness & Beauty', name_gr: 'Ευεξία & Ομορφιά', icon: 'Wellness' },
    { id: '2', name_en: 'Workshops & Classes', name_gr: 'Εργαστήρια & Μαθήματα', icon: 'Workshop' },
    { id: '3', name_en: 'Cultural Experiences', name_gr: 'Πολιτιστικές Εμπειρίες', icon: 'Culture' },
    { id: '4', name_en: 'Outdoor Adventures', name_gr: 'Υπαίθριες Περιπέτειες', icon: 'Adventure' },
];

export const TRANSLATIONS: { [key: string]: TranslationSet } = {
    en: {
        headerTitle: 'Local Greece',
        searchPlaceholder: 'Search for experiences, workshops, tours...',
        allCategories: 'Categories',
        nearMe: 'Near Me',
        list: 'List',
        map: 'Map',
        split: 'Split',
        noListings: 'No listings found matching your criteria.',
        call: 'Call',
        whatsapp: 'WhatsApp',
        email: 'Email',
        directions: 'Get Directions',
        listingsInArea: 'Listings in this area',
        defaultView: 'Default',
        satellite: 'Satellite',
    },
    gr: {
        headerTitle: 'Ελλάδα Τοπικά',
        searchPlaceholder: 'Αναζήτηση για εμπειρίες, εργαστήρια, περιηγήσεις...',
        allCategories: 'Κατηγορίες',
        nearMe: 'Κοντά μου',
        list: 'Λίστα',
        map: 'Χάρτης',
        split: 'Διαίρεση',
        noListings: 'Δεν βρέθηκαν καταχωρήσεις που να ταιριάζουν με τα κριτήριά σας.',
        call: 'Κλήση',
        whatsapp: 'WhatsApp',
        email: 'Email',
        directions: 'Λήψη οδηγιών',
        listingsInArea: 'Καταχωρήσεις σε αυτήν την περιοχή',
        defaultView: 'Προεπιλογή',
        satellite: 'Δορυφόρος',
    },
};