
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ListView from './components/ListView';
import MapView from './components/MapView';
import ListingPage from './components/ListingPage';
import Auth from './components/Auth';
import Pagination from './components/Pagination';
import DashboardPage from './components/DashboardPage';
import AdminDashboard from './components/AdminDashboard';
import AiAssistant from './components/AiAssistant';
import { supabase } from './lib/supabaseClient';
import { useGeolocation } from './hooks/useGeolocation';
import { haversineDistance } from './utils/geo';
import { Language, Listing, Category, Session } from './types';
import { TRANSLATIONS, CATEGORIES as staticCategories } from './constants';
import { FAKE_LISTINGS } from './utils/fakeData';

const App: React.FC = () => {
  // State management
  const [language, setLanguage] = useState<Language>('en');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [isNearMe, setIsNearMe] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 9;

  const [hoveredListingId, setHoveredListingId] = useState<number | null>(null);

  const { location: userLocation } = useGeolocation();
  const t = TRANSLATIONS[language];

  // Routing effect
  useEffect(() => {
    const onLocationChange = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  // Auth effect
  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setShowAuth(false); // Close modal on auth change
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setNotification(null);

        if (!supabase) {
            console.warn("Supabase not connected, falling back to mock data.");
            setNotification("Supabase is not configured. Displaying sample data. See `lib/supabaseClient.ts` to connect your database.");
            setAllListings(FAKE_LISTINGS);
            setLoading(false);
            return;
        }
        
        try {
            const { data: listingData, error: listingError } = await supabase.from('listings').select('*').eq('approved', true);
            if (listingError) throw listingError;

            const listingsWithImages = listingData.map(l => ({
              ...l,
              images: l.images && l.images.length > 0 ? l.images : [`https://picsum.photos/seed/${l.id}/400/300`]
            }));
            setAllListings(listingsWithImages);

        } catch (err: any) {
            console.error("Failed to fetch from Supabase, falling back to mock data.", err);
            setNotification("Could not connect to the database. Displaying sample data.");
            setAllListings(FAKE_LISTINGS);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);
  
  // Filtering logic
  const filteredListings = useMemo(() => {
    let listings = [...allListings];

    if (selectedCategories.length > 0) {
        listings = listings.filter(l => selectedCategories.includes(l.category_id));
    }

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        listings = listings.filter(l => 
            l.title_en.toLowerCase().includes(lowercasedTerm) ||
            l.title_gr.toLowerCase().includes(lowercasedTerm) ||
            l.description_en.toLowerCase().includes(lowercasedTerm) ||
            l.description_gr.toLowerCase().includes(lowercasedTerm)
        );
    }
    
    if (isNearMe && userLocation) {
        listings = listings
            .map(l => ({
                ...l,
                distance: haversineDistance({ latitude: l.lat, longitude: l.lon }, userLocation)
            }))
            .filter(l => l.distance < 50)
            .sort((a, b) => a.distance - b.distance);
    }
    
    return listings;
  }, [allListings, selectedCategories, searchTerm, isNearMe, userLocation]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  const paginatedListings = useMemo(() => {
      const startIndex = (currentPage - 1) * listingsPerPage;
      return filteredListings.slice(startIndex, startIndex + listingsPerPage);
  }, [filteredListings, currentPage]);

  useEffect(() => {
      setCurrentPage(1); // Reset to first page on filter change
  }, [filteredListings]);

  // Handlers
  const handleCategoryToggle = (categoryId: string) => {
      setSelectedCategories(prev => 
          prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId) 
              : [...prev, categoryId]
      );
  };
  
  const handleNearMeToggle = () => {
      if (!userLocation) {
        alert("Please enable location services to use this feature.");
      }
      setIsNearMe(prev => !prev);
  };

  const handleSetViewMode = (mode: 'list' | 'map' | 'split') => {
      if (viewMode !== mode) {
          setHoveredListingId(null);
          setViewMode(mode);
      }
  };
  
  // Main router logic
  const renderContent = () => {
    if (pathname.startsWith('/admin')) {
        return <AdminDashboard session={session} language={language} categories={categories} />;
    }
    
    if (pathname.startsWith('/dashboard')) {
      return <DashboardPage session={session} language={language} t={t} categories={categories} />;
    }

    if (pathname.startsWith('/listing/')) {
        const id = pathname.split('/')[2];
        return <ListingPage listingId={id} language={language} t={t} />;
    }

    // Main discovery page
    return (
        <>
            <FilterBar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                viewMode={viewMode}
                setViewMode={handleSetViewMode}
                isNearMe={isNearMe}
                onNearMeToggle={handleNearMeToggle}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                language={language}
                t={t}
            />
            {viewMode === 'split' ? (
                <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-220px)]">
                    <div className="w-full md:w-2/5 lg:w-1/3 h-[50vh] md:h-full overflow-y-auto">
                        <ListView
                            listings={filteredListings}
                            language={language}
                            t={t}
                            loading={loading}
                            hoveredId={hoveredListingId}
                            onHover={setHoveredListingId}
                        />
                    </div>
                    <div className="w-full md:w-3/5 lg:w-2/3 h-[50vh] md:h-full">
                        <MapView
                            listings={filteredListings}
                            language={language}
                            loading={loading}
                            t={t}
                            hoveredId={hoveredListingId}
                            onHover={setHoveredListingId}
                        />
                    </div>
                </div>
            ) : viewMode === 'list' ? (
                <>
                    <ListView
                        listings={paginatedListings}
                        language={language}
                        t={t}
                        loading={loading}
                    />
                    {totalPages > 1 && (
                      <Pagination 
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                      />
                    )}
                </>
            ) : (
                <div className="w-full h-[calc(100vh-220px)]">
                    <MapView
                        listings={filteredListings}
                        language={language}
                        loading={loading}
                        t={t}
                        hoveredId={hoveredListingId}
                        onHover={setHoveredListingId}
                    />
                </div>
            )}
        </>
    );
  }

  return (
      <div className="bg-gray-50 min-h-screen">
          <Header 
              language={language}
              setLanguage={setLanguage}
              t={t}
              session={session}
              onLogin={() => setShowAuth(true)}
              onLogout={() => supabase?.auth.signOut()}
          />
          <main className="container mx-auto p-4 md:p-6">
              {notification && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-md" role="alert">
                    <p className="font-bold">Heads up!</p>
                    <p>{notification}</p>
                  </div>
              )}
              {renderContent()}
          </main>
          <Auth show={showAuth} onClose={() => setShowAuth(false)} />
          <AiAssistant />
      </div>
  );
};

export default App;
