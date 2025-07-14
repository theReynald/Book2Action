import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookResult from './components/BookResult';
import ErrorMessage from './components/ErrorMessage';
import { Book, BookSearchResult } from './types/Book';
import { searchBook } from './services/bookService';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (title: string) => {
        setIsLoading(true);
        setError(null);
        setCurrentBook(null);

        try {
            const result: BookSearchResult = await searchBook(title);

            if (result.success && result.book) {
                setCurrentBook(result.book);
            } else {
                setError(result.error || 'An unexpected error occurred');
            }
        } catch (err) {
            setError('Failed to search for the book. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        setCurrentBook(null);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto">
                <Header onSearchFocus={() => { }} />

                <SearchBar onSearch={handleSearch} isLoading={isLoading} />

                {error && (
                    <ErrorMessage message={error} onRetry={handleRetry} />
                )}

                {currentBook && !error && !isLoading && (
                    <BookResult book={currentBook} />
                )}

                {!currentBook && !error && !isLoading && (
                    <div className="text-center mt-16">
                        <div className="glass-effect rounded-2xl p-12 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Welcome to Book2Action! 📚
                            </h3>
                            <p className="text-white text-opacity-80 leading-relaxed">
                                Search for any book title above to get a comprehensive summary and
                                10 actionable steps to implement the book's key learnings in your life.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
