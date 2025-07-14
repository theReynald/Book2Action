import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
    onSearch: (title: string) => void;
    isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim() && !isLoading) {
            onSearch(searchTerm.trim());
        }
    };

    return (
        <div className="max-w-2xl mx-auto mb-12 animate-slide-up">
            <form onSubmit={handleSubmit} className="relative">
                <div className="glass-effect rounded-2xl p-6 shadow-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter a book title (e.g., 'Atomic Habits', 'Think and Grow Rich')"
                            className="w-full pl-12 pr-20 py-4 text-lg bg-white bg-opacity-90 rounded-xl border-2 border-transparent focus:border-white focus:outline-none transition-all duration-300 placeholder-gray-500"
                            disabled={isLoading}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <button
                            type="submit"
                            disabled={!searchTerm.trim() || isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 button-gradient text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Searching</span>
                                </>
                            ) : (
                                <span>Search</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-4 text-center">
                <p className="text-white text-opacity-70 text-sm">
                    Try: "Atomic Habits", "Think and Grow Rich", or "The 7 Habits of Highly Effective People"
                </p>
            </div>
        </div>
    );
};

export default SearchBar;
