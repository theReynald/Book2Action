import React from 'react';
import { Book } from '../types/Book';
import { BookOpen, RefreshCw } from 'lucide-react';

interface TrendingBooksProps {
    books: Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[];
    onBookSelect: (title: string) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

const TrendingBooks: React.FC<TrendingBooksProps> = ({ books, onBookSelect, onRefresh, isLoading = false }) => {
    return (
        <div className="glass-effect rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-white">
                    Trending Books
                </h3>
                <button
                    onClick={onRefresh}
                    className={`flex items-center gap-1 px-3 py-1.5 ${isLoading ? 'bg-gray-600' : 'bg-white bg-opacity-10 hover:bg-opacity-20'} text-white rounded-md transition-colors`}
                    title="Get new trending books"
                    disabled={isLoading}
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>
            <p className="text-white text-opacity-70 text-center mb-6">
                Click on a book to get its summary and 7-day action plan
            </p>
            <div className="flex flex-wrap justify-center gap-6">
                {books.map((book, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center w-32 cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => onBookSelect(book.title)}
                        title={`Search for ${book.title}`}
                    >
                        <div className="mb-3 relative w-32 h-48 flex items-center justify-center">
                            {book.coverImageUrl ? (
                                <img
                                    src={book.coverImageUrl}
                                    alt={`${book.title} cover`}
                                    className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-white border-opacity-20"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        // Show fallback icon on error
                                        img.style.display = 'none';
                                        const fallback = img.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 flex items-center justify-center"
                                style={{ display: book.coverImageUrl ? 'none' : 'flex' }}
                            >
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h4 className="text-white text-center font-medium text-sm line-clamp-1 w-full">
                            {book.title}
                        </h4>
                        <p className="text-white text-opacity-70 text-center text-xs mt-1">
                            {book.author}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingBooks;
