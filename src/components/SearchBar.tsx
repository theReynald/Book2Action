import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
    onSearch: (title: string) => void;
    isLoading: boolean;
    isDarkMode: boolean;
    setInputRef?: (ref: HTMLInputElement | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, isDarkMode, setInputRef }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Register the input ref with parent component if provided
    useEffect(() => {
        if (setInputRef && inputRef.current) {
            setInputRef(inputRef.current);
        }
    }, [setInputRef]);

    // List of popular book titles to cycle through
    const bookPlaceholders = [
        "Try 'Atomic Habits' by James Clear",
        "Try 'Think and Grow Rich' by Napoleon Hill",
        "Try 'The 7 Habits of Highly Effective People'",
        "Try 'How to Win Friends and Influence People'",
        "Try 'The 4-Hour Workweek' by Tim Ferriss",
        "Try 'Rich Dad Poor Dad' by Robert Kiyosaki",
        "Try 'The Power of Now' by Eckhart Tolle"
    ];

    // Change the placeholder every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prevIndex) =>
                prevIndex === bookPlaceholders.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim() && !isLoading) {
            onSearch(searchTerm.trim());
        }
    };

    return (
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="relative">
                <div className="glass-effect rounded-2xl p-6 shadow-2xl">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={bookPlaceholders[placeholderIndex]}
                            className={`w-full pl-12 pr-32 py-4 text-lg rounded-xl border-2 border-transparent focus:outline-none transition-all duration-300 ${isDarkMode
                                    ? "bg-gray-800 bg-opacity-90 text-white placeholder-gray-500 focus:border-blue-500"
                                    : "bg-white bg-opacity-90 text-gray-800 placeholder-gray-400 focus:border-blue-600"
                                }`}
                            disabled={isLoading}
                        />
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <button
                            type="submit"
                            disabled={!searchTerm.trim() || isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 button-gradient text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:brightness-110 transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <span>Get Insights</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-4 text-center">
                <p className={`text-opacity-70 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    {isLoading ?
                        "" :
                        "Try any book title - AI will analyze it and create actionable steps!"
                    }
                </p>
            </div>
        </div>
    );
};

export default SearchBar;
