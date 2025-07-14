import React from 'react';
import { Search, BookOpen, Lightbulb, Sun, Moon } from 'lucide-react';

interface HeaderProps {
    onSearchFocus: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchFocus, isDarkMode, toggleTheme }) => {
    return (
        <header className="text-center mb-12 animate-fade-in relative">
            {/* Theme Toggle Button */}
            <div className="absolute top-2 right-4">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full glass-effect hover:bg-opacity-30 transition-all duration-200 shadow-lg border border-white border-opacity-10"
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDarkMode ? (
                        <Sun className="w-6 h-6 text-yellow-300" />
                    ) : (
                        <Moon className="w-6 h-6 text-blue-300" />
                    )}
                </button>
            </div>

            <div className="flex justify-center items-center mb-6">
                <div className={`${isDarkMode ? 'bg-blue-600 bg-opacity-20' : 'bg-blue-500 bg-opacity-15'} backdrop-blur-lg rounded-full p-4 mr-4`}>
                    <BookOpen className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                    <h1 className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        <a href="/" onClick={(e) => {
                            e.preventDefault();
                            window.history.pushState({}, '', '/');
                            window.scrollTo(0, 0);
                            onSearchFocus();
                        }} className="hover:opacity-90 transition-opacity">
                            Book<span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2</span>Action
                        </a>
                    </h1>
                    <p className={`text-xl ${isDarkMode ? 'text-white text-opacity-90' : 'text-gray-700'}`}>
                        Transform Books into Actionable Insights
                    </p>
                </div>
            </div>



            <div className={`flex justify-center space-x-8 ${isDarkMode ? 'text-white text-opacity-70' : 'text-gray-700'}`}>
                <div className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    <span>Search Books</span>
                </div>
                <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>Get Summary</span>
                </div>
                <div className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    <span>Actionable Steps</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
