import React, { useState, useEffect } from 'react';
import { Session, Category, Language, Listing } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { navigate } from '../../utils/navigation';
import { Icon } from '../Icon';

interface ListingFormProps {
    session: Session;
    categories: Category[];
    language: Language;
    listingId?: string;
}

const formInitialState = {
    title_en: '',
    title_gr: '',
    description_en: '',
    description_gr: '',
    category_id: '',
    images: [''],
    contact: { phone: '', whatsapp: '', email: '', facebook: '', instagram: '', twitter: '' },
    lat: 0,
    lon: 0,
};

const ListingForm: React.FC<ListingFormProps> = ({ session, categories, language, listingId }) => {
    const isEditMode = Boolean(listingId);
    const [formData, setFormData] = useState<Omit<Listing, 'id' | 'approved' | 'user_id'>>(formInitialState);
    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && supabase) {
            const fetchListing = async () => {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .eq('user_id', session.user.id) // Ensure user owns this listing
                    .single();

                if (error || !data) {
                    setError('Failed to load listing or you do not have permission to edit it.');
                } else {
                    setFormData({
                        title_en: data.title_en,
                        title_gr: data.title_gr,
                        description_en: data.description_en,
                        description_gr: data.description_gr,
                        category_id: data.category_id,
                        images: data.images || [''],
                        contact: data.contact || formInitialState.contact,
                        lat: data.lat,
                        lon: data.lon,
                    });
                }
                setLoading(false);
            };
            fetchListing();
        }
    }, [listingId, session.user.id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('contact.')) {
            const contactField = name.split('.')[1];
            setFormData(prev => ({ ...prev, contact: { ...prev.contact, [contactField]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setSubmitting(true);
        setError(null);

        const submissionData = {
            ...formData,
            user_id: session.user.id,
            approved: false, // Always require re-approval on edit/create
        };

        try {
            let error;
            if (isEditMode) {
                const { error: updateError } = await supabase.from('listings').update(submissionData).eq('id', listingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('listings').insert([submissionData]);
                error = insertError;
            }

            if (error) throw error;
            
            alert(`Listing successfully ${isEditMode ? 'updated' : 'created'}! It will be reviewed by an admin shortly.`);
            navigate('/dashboard/listings');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) return <p>Loading form...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
             <button onClick={() => navigate('/dashboard/listings')} className="flex items-center gap-2 mb-6 text-sm font-semibold text-greek-blue-700 hover:text-greek-blue-900">
                <Icon name="ArrowLeft" className="w-5 h-5" />
                Back to My Listings
            </button>
            <h2 className="text-2xl font-bold text-greek-blue-800 mb-6">{isEditMode ? 'Edit Listing' : 'Create New Listing'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="title_en" label="Title (English)" value={formData.title_en} onChange={handleChange} required />
                    <InputField name="title_gr" label="Title (Greek)" value={formData.title_gr} onChange={handleChange} required />
                </div>
                <TextAreaField name="description_en" label="Description (English)" value={formData.description_en} onChange={handleChange} required />
                <TextAreaField name="description_gr" label="Description (Greek)" value={formData.description_gr} onChange={handleChange} required />
                
                {/* Category & Location */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-greek-blue-500 focus:border-greek-blue-500 sm:text-sm rounded-md">
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{language === 'en' ? cat.name_en : cat.name_gr}</option>
                            ))}
                        </select>
                    </div>
                    <InputField name="lat" label="Latitude" type="number" step="any" value={formData.lat} onChange={handleChange} required />
                    <InputField name="lon" label="Longitude" type="number" step="any" value={formData.lon} onChange={handleChange} required />
                </div>

                {/* Contact Info */}
                <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField name="contact.phone" label="Phone" value={formData.contact.phone} onChange={handleChange} required />
                    <InputField name="contact.whatsapp" label="WhatsApp Number" value={formData.contact.whatsapp} onChange={handleChange} required />
                    <InputField name="contact.email" label="Email" type="email" value={formData.contact.email} onChange={handleChange} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField name="contact.facebook" label="Facebook URL (Optional)" value={formData.contact.facebook} onChange={handleChange} />
                    <InputField name="contact.instagram" label="Instagram URL (Optional)" value={formData.contact.instagram} onChange={handleChange} />
                    <InputField name="contact.twitter" label="Twitter URL (Optional)" value={formData.contact.twitter} onChange={handleChange} />
                </div>

                {/* Image URL */}
                <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t">Image URL</h3>
                <InputField name="images" label="Main Image URL" value={formData.images[0]} onChange={(e) => handleImageChange(0, e.target.value)} required placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-gray-500">Please provide a direct link to an image. For multiple images, separate URLs with a comma (not yet supported).</p>


                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={submitting} className="px-6 py-3 bg-greek-blue-600 text-white font-semibold rounded-full hover:bg-greek-blue-700 transition-colors disabled:opacity-50">
                        {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Listing')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper components for form fields
const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} id={props.name} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-greek-blue-500 focus:border-greek-blue-500" />
    </div>
);

const TextAreaField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea {...props} id={props.name} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-greek-blue-500 focus:border-greek-blue-500" />
    </div>
);


export default ListingForm;
