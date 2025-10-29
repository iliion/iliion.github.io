import React from 'react';
import { Session, TranslationSet, Language, Category } from '../types';
import { navigate } from '../utils/navigation';
import DashboardListings from './dashboard/DashboardListings';
import ListingForm from './dashboard/ListingForm';

interface DashboardPageProps {
    session: Session | null;
    language: Language;
    t: TranslationSet;
    categories: Category[];
}

const AccessDenied: React.FC = () => (
    <div className="text-center py-20 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You must be logged in as a business user to view this page.</p>
        <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-greek-blue-600 text-white font-semibold rounded-full hover:bg-greek-blue-700 transition-colors"
        >
            Go to Homepage
        </button>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ session, language, t, categories }) => {
    const pathname = window.location.pathname;

    if (!session || session.user.user_metadata?.role !== 'business') {
        return <AccessDenied />;
    }

    const renderDashboardContent = () => {
        if (pathname.startsWith('/dashboard/new')) {
            return <ListingForm session={session} categories={categories} language={language} />;
        }
        if (pathname.startsWith('/dashboard/edit/')) {
            const id = pathname.split('/')[3];
            return <ListingForm session={session} listingId={id} categories={categories} language={language} />;
        }
        // Default to listings view
        if (pathname.startsWith('/dashboard/listings') || pathname === '/dashboard') {
            return <DashboardListings session={session} language={language} />;
        }
        return <p>Page not found.</p>
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-greek-blue-800">My Dashboard</h1>
                <p className="text-gray-600">Manage your business listings here.</p>
            </div>
            {renderDashboardContent()}
        </div>
    );
};

export default DashboardPage;
