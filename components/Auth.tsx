import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { Icon } from './Icon';

interface AuthProps {
    show: boolean;
    onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ show, onClose }) => {
    if (!show) {
        return null;
    }

    const handleGoogleLogin = async () => {
        if (!supabase) {
            console.error('Supabase client is not initialized. Cannot perform authentication.');
            return;
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error('Error logging in with Google:', error);
            // You might want to display an error message to the user here.
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-greek-blue-800 mb-2">Welcome to Local Greece</h2>
                <p className="text-gray-600 mb-6">Sign in to unlock all features.</p>
                
                <button
                    onClick={handleGoogleLogin}
                    disabled={!supabase}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greek-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon name="Google" className="w-6 h-6" />
                    <span>Sign in with Google</span>
                </button>
                
                <p className="text-xs text-gray-400 mt-6">
                    By signing in, you agree to our terms of service.
                </p>
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Auth;