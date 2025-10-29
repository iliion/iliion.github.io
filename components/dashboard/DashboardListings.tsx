import React, { useState, useEffect } from 'react';
import { Session, Listing, Language } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { navigate } from '../../utils/navigation';
import { Icon } from '../Icon';

interface DashboardListingsProps {
    session: Session;
    language: Language;
}

const DashboardListings: React.FC<DashboardListingsProps> = ({ session, language }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = async () => {
        if (!supabase) return;
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [session.user.id]);
    
    const handleDelete = async (listingId: number) => {
        if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            if (!supabase) return;
            const { error } = await supabase.from('listings').delete().eq('id', listingId);
            if (error) {
                alert('Failed to delete listing: ' + error.message);
            } else {
                fetchListings(); // Refresh the list
            }
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-greek-blue-800">My Listings</h2>
                <button
                    onClick={() => navigate('/dashboard/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-greek-blue-600 text-white font-semibold rounded-full hover:bg-greek-blue-700 transition-colors"
                >
                    <Icon name="Add" className="w-5 h-5" />
                    <span>Add New Listing</span>
                </button>
            </div>

            {loading && <p>Loading your listings...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            {!loading && !error && listings.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-600">You haven't created any listings yet.</p>
                    <button onClick={() => navigate('/dashboard/new')} className="mt-4 text-greek-blue-600 font-semibold hover:underline">
                        Create your first one!
                    </button>
                </div>
            )}
            
            {!loading && !error && listings.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-600">Title</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(listing => (
                                <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">
                                        {language === 'en' ? listing.title_en : listing.title_gr}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${listing.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {listing.approved ? 'Approved' : 'Pending Review'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="inline-flex gap-2">
                                            <button onClick={() => navigate(`/dashboard/edit/${listing.id}`)} className="p-2 text-gray-500 hover:text-greek-blue-600 hover:bg-gray-100 rounded-full" aria-label="Edit">
                                                <Icon name="Edit" className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(listing.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full" aria-label="Delete">
                                                <Icon name="Delete" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardListings;
