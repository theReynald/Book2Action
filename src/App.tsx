import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookResult from './components/BookResult';
import ErrorMessage from './components/ErrorMessage';
import TrendingBooks from './components/TrendingBooks';
import { Book, BookSearchResult } from './types/Book';
import { searchBook } from './services/openRouterService';
import { fetchTrendingBooks } from './services/trendingBooksService';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [trendingBooks, setTrendingBooks] = useState<Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);

    const loadTrendingBooks = async () => {
        setIsTrendingLoading(true);
        try {
            const books = await fetchTrendingBooks();
            setTrendingBooks(books);
        } catch (err) {
            console.error('Failed to fetch trending books:', err);
        } finally {
            setIsTrendingLoading(false);
        }
    };

    useEffect(() => {
        // Fetch trending books when the component mounts
        loadTrendingBooks();
    }, []);

    const handleTrendingRefresh = () => {
        loadTrendingBooks();
    };

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

                {!currentBook && !error && !isLoading && trendingBooks.length > 0 && (
                    <TrendingBooks
                        books={trendingBooks}
                        onBookSelect={handleSearch}
                        onRefresh={handleTrendingRefresh}
                        isLoading={isTrendingLoading}
                    />
                )}

                {error && (
                    <ErrorMessage message={error} onRetry={handleRetry} />
                )}

                {currentBook && !error && !isLoading && (
                    <BookResult book={currentBook} />
                )}
            </div>
        </div>
    );
};

export default App;
