import React, { useState, useEffect, useMemo } from 'react';
import { Session, Listing, Language, Category } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Icon } from './Icon';
import { navigate } from '../utils/navigation';

interface AdminDashboardProps {
    session: Session | null;
    language: Language;
    categories: Category[];
}

const AccessDenied: React.FC = () => (
    <div className="text-center py-20 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You must be an administrator to view this page.</p>
        <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-greek-blue-600 text-white font-semibold rounded-full hover:bg-greek-blue-700 transition-colors"
        >
            Go to Homepage
        </button>
    </div>
);

const SkeletonRow: React.FC = () => (
    <tr className="border-b border-gray-100">
        <td className="p-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
        <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
        <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/3"></div></td>
        <td className="p-4 text-right">
            <div className="inline-flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
        </td>
    </tr>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, language, categories }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    const fetchPendingListings = async () => {
        if (!supabase) return;
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('approved', false);

            if (error) throw error;
            setListings(data);
        } catch (err: any) {
            setError('Failed to fetch pending listings: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.user_metadata?.role === 'admin') {
            fetchPendingListings();
        }
    }, [session]);

    const handleApprove = async (id: number) => {
        if (!supabase) return;
        const { error } = await supabase.from('listings').update({ approved: true }).eq('id', id);
        if (error) {
            alert('Error approving listing: ' + error.message);
        } else {
            fetchPendingListings(); // Refresh list
        }
    };

    const handleReject = async (id: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to reject and delete this listing permanently?')) {
            const { error } = await supabase.from('listings').delete().eq('id', id);
            if (error) {
                alert('Error rejecting listing: ' + error.message);
            } else {
                fetchPendingListings(); // Refresh list
            }
        }
    };

    const categoryMap = useMemo(() => 
        categories.reduce((acc, cat) => {
            acc[cat.id] = language === 'en' ? cat.name_en : cat.name_gr;
            return acc;
        }, {} as Record<string, string>), 
    [categories, language]);

    const filteredAndSortedListings = useMemo(() => {
        let result = [...listings];
        if (filterCategory !== 'all') {
            result = result.filter(l => l.category_id === filterCategory);
        }
        result.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [listings, filterCategory, sortBy]);

    if (!session || session.user.user_metadata?.role !== 'admin') {
        return <AccessDenied />;
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-greek-blue-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Review and approve new business listings.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-greek-blue-800">Pending Submissions</h2>
                        <p className="text-sm text-gray-500">{filteredAndSortedListings.length} listing(s) awaiting review.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-white rounded-md border-gray-300 shadow-sm focus:border-greek-blue-300 focus:ring focus:ring-greek-blue-200 focus:ring-opacity-50 text-sm">
                            <option value="all">All Categories</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{language === 'en' ? cat.name_en : cat.name_gr}</option>)}
                        </select>
                         <select value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')} className="bg-white rounded-md border-gray-300 shadow-sm focus:border-greek-blue-300 focus:ring focus:ring-greek-blue-200 focus:ring-opacity-50 text-sm">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {error && <p className="text-red-500 py-4">{error}</p>}
                
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600 tracking-wider">Title</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 tracking-wider">Category</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 tracking-wider">Submitted On</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredAndSortedListings.length > 0 ? (
                                filteredAndSortedListings.map(listing => (
                                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">
                                            {language === 'en' ? listing.title_en : listing.title_gr}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {categoryMap[listing.category_id] || 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(listing.created_at || '').toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="inline-flex items-center gap-3">
                                                <a href={`/listing/${listing.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-greek-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="View Listing">
                                                    <Icon name="ExternalLink" className="w-5 h-5" />
                                                </a>
                                                <button onClick={() => handleApprove(listing.id)} className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors" title="Approve">
                                                    <Icon name="Check" className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleReject(listing.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors" title="Reject">
                                                    <Icon name="X" className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : null}
                        </tbody>
                    </table>
                     {!loading && filteredAndSortedListings.length === 0 && (
                        <div className="text-center py-16">
                            <Icon name="Check" className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold text-lg">All caught up!</p>
                            <p className="text-sm text-gray-500 mt-2">There are no new submissions to review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
