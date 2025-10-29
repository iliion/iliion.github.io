
import React from 'react';
import { Category, Language, TranslationSet } from '../types';
import { Icon } from './Icon';

interface FilterBarProps {
    categories: Category[];
    selectedCategories: string[];
    onCategoryToggle: (categoryId: string) => void;
    viewMode: 'list' | 'map' | 'split';
    setViewMode: (mode: 'list' | 'map' | 'split') => void;
    isNearMe: boolean;
    onNearMeToggle: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    language: Language;
    t: TranslationSet;
}

// CategoryButton defined outside FilterBar
const CategoryButton: React.FC<{
    category: Category;
    isSelected: boolean;
    onClick: () => void;
    language: Language;
}> = ({ category, isSelected, onClick, language }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0";
    const selectedClasses = "bg-greek-blue-600 text-white border-greek-blue-600";
    const unselectedClasses = "bg-white text-greek-blue-700 border-greek-blue-200 hover:bg-greek-blue-100 hover:border-greek-blue-300";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
        >
            <Icon name={category.icon} className="w-4 h-4" />
            {language === 'en' ? category.name_en : category.name_gr}
        </button>
    );
};

// FilterBar component
const FilterBar: React.FC<FilterBarProps> = ({
    categories,
    selectedCategories,
    onCategoryToggle,
    viewMode,
    setViewMode,
    isNearMe,
    onNearMeToggle,
    searchTerm,
    onSearchChange,
    language,
    t
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 sticky top-[80px] z-10">
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="Search" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-greek-blue-500 focus:border-transparent sm:text-sm"
                        aria-label="Search listings"
                    />
                </div>
                
                {/* Filters and Toggles Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
                        <p className="font-bold text-gray-600 mr-2 hidden lg:block flex-shrink-0">{t.allCategories}:</p>
                        {categories.map(cat => (
                            <CategoryButton
                                key={cat.id}
                                category={cat}
                                isSelected={selectedCategories.includes(cat.id)}
                                onClick={() => onCategoryToggle(cat.id)}
                                language={language}
                            />
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                        <button
                            onClick={onNearMeToggle}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
                                isNearMe 
                                    ? 'bg-greek-blue-600 text-white border-greek-blue-600'
                                    : 'bg-white text-greek-blue-700 border-greek-blue-200 hover:bg-greek-blue-100'
                            }`}
                        >
                             <Icon name="Location" className="w-4 h-4"/>
                            {t.nearMe}
                        </button>
                        <div className="flex items-center bg-greek-blue-100 rounded-full p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-1 text-sm rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-500'}`}
                            >
                                {t.list}
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-1 text-sm rounded-full transition-colors duration-200 ${viewMode === 'map' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-500'}`}
                            >
                                {t.map}
                            </button>
                            <button
                                onClick={() => setViewMode('split')}
                                className={`px-4 py-1 text-sm rounded-full transition-colors duration-200 hidden md:block ${viewMode === 'split' ? 'bg-white text-greek-blue-700 shadow' : 'text-gray-500'}`}>
                                {t.split}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
