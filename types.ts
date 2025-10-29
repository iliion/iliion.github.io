export type Language = 'en' | 'gr';

export interface Coords {
    latitude: number;
    longitude: number;
}

export interface Category {
    id: string;
    name_en: string;
    name_gr: string;
    icon: string;
}

export interface Listing {
    id: number;
    title_en: string;
    title_gr: string;
    description_en: string;
    description_gr: string;
    images: string[];
    contact?: {
        phone: string;
        whatsapp: string;
        email: string;
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
    lat: number;
    lon: number;
    category_id: string;
    approved: boolean;
    user_id?: string; // To link listing to a user
    created_at?: string; // Add created_at for sorting
}

export interface TranslationSet {
    [key: string]: string;
}

// Simplified types for Supabase session and user
export interface User {
  id: string;
  email?: string;
  user_metadata: {
    [key: string]: any;
    avatar_url?: string;
    full_name?: string;
    role?: 'business' | 'admin'; // Add admin role
  };
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  // Fix: Made expires_at optional to match the type from Supabase's auth client, resolving type errors in App.tsx.
  expires_at?: number;
  refresh_token: string;
  user: User;
}