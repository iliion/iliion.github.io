import React from 'react';
import { Language, TranslationSet, Session } from '../types';
import { navigate } from '../utils/navigation';
import { Icon } from './Icon';


const NavLink: React.FC<{href: string, children: React.ReactNode, className?: string}> = ({ href, children, className }) => (
    <a 
        href={href} 
        onClick={(e) => { e.preventDefault(); navigate(href); }}
        className={className}
    >
        {children}
    </a>
);


const Header: React.FC<{
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationSet;
    session: Session | null;
    onLogin: () => void;
    onLogout: () => void;
}> = ({ language, setLanguage, t, session, onLogin, onLogout }) => {
    const isBusinessUser = session?.user?.user_metadata?.role === 'business';
    const isAdmin = session?.user?.user_metadata?.role === 'admin';

    return (
        <header className="bg-white py-4 px-6 shadow-md sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-greek-blue-700">
                    <NavLink href="/">{t.headerTitle}</NavLink>
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-200 rounded-full p-1">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${language === 'en' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-600'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('gr')}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${language === 'gr' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-600'}`}
                        >
                            GR
                        </button>
                    </div>
                    {session ? (
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <NavLink 
                                    href="/admin" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                                >
                                    <span>Admin</span>
                                </NavLink>
                            )}
                             {isBusinessUser && (
                                <NavLink 
                                    href="/dashboard/listings" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-greek-blue-100 text-greek-blue-800 rounded-full hover:bg-greek-blue-200 transition-colors"
                                >
                                    <Icon name="Dashboard" className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </NavLink>
                            )}
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                Welcome, {session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email}
                            </span>
                            <button onClick={onLogout} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={onLogin} className="px-4 py-2 text-sm font-semibold bg-greek-blue-600 text-white rounded-full hover:bg-greek-blue-700 transition-colors">
                            Login / Sign Up
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;