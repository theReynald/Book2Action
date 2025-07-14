import React from 'react';
import { Search, BookOpen, Lightbulb } from 'lucide-react';

interface HeaderProps {
    onSearchFocus: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchFocus }) => {
    return (
        <header className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center items-center mb-6">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-4 mr-4">
                    <BookOpen className="w-12 h-12 text-white" />
                </div>
                <div>
                    <h1 className="text-5xl font-bold text-white mb-2">
                        Book2Action
                    </h1>
                    <p className="text-xl text-white text-opacity-90">
                        Transform Books into Actionable Insights
                    </p>
                </div>
            </div>

            <p className="text-lg text-white text-opacity-80 max-w-2xl mx-auto mb-8">
                Enter any book title to get an AI-powered summary and 10 actionable steps
                with chapter references to transform learning into action.
            </p>

            <div className="flex justify-center space-x-8 text-white text-opacity-70">
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
