import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookResult from './components/BookResult';
import ErrorMessage from './components/ErrorMessage';
import TrendingBooks from './components/TrendingBooks';
import ActionStepDetail from './components/ActionStepDetail';
import { Book, BookSearchResult, ActionableStep } from './types/Book';
import { searchBook } from './services/openRouterService';
import { fetchTrendingBooks } from './services/trendingBooksService';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [trendingBooks, setTrendingBooks] = useState<Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);
    const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
    const [selectedAction, setSelectedAction] = useState<ActionableStep | null>(null);
    // Use localStorage to persist theme preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'light' ? false : true; // Default to dark mode if no preference
    });

    // Function to toggle between light and dark mode
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        // Save preference to localStorage
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');

        // Apply theme class to the body element
        if (newTheme) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    };

    // Set initial theme class on component mount
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }, []);

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
    }; const handleSearchFocus = () => {
        // Reset to home state when clicking the title
        setCurrentBook(null);
        setError(null);
        setSelectedAction(null);

        // Focus the search input if available
        if (searchInputRef) {
            searchInputRef.focus();
        }
    };

    const handleRetry = () => {
        setError(null);
        setCurrentBook(null);
        setSelectedAction(null);
    };

    const handleActionSelect = (action: ActionableStep) => {
        setSelectedAction(action);
        window.scrollTo(0, 0);
    };

    const handleBackToBook = () => {
        setSelectedAction(null);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto">
                <Header
                    onSearchFocus={handleSearchFocus}
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                />

                <SearchBar
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    setInputRef={setSearchInputRef}
                />

                {!currentBook && !selectedAction && !error && !isLoading && trendingBooks.length > 0 && (
                    <TrendingBooks
                        books={trendingBooks}
                        onBookSelect={handleSearch}
                        onRefresh={handleTrendingRefresh}
                        isLoading={isTrendingLoading}
                        isDarkMode={isDarkMode}
                    />
                )}

                {error && (
                    <ErrorMessage message={error} onRetry={handleRetry} />
                )}

                {currentBook && !selectedAction && !error && !isLoading && (
                    <BookResult
                        book={currentBook}
                        isDarkMode={isDarkMode}
                        onActionSelect={handleActionSelect}
                    />
                )}

                {selectedAction && currentBook && !error && !isLoading && (
                    <ActionStepDetail
                        step={selectedAction}
                        bookTitle={currentBook.title}
                        onBack={handleBackToBook}
                        isDarkMode={isDarkMode}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
