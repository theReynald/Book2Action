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
    const [currentSearchTitle, setCurrentSearchTitle] = useState<string>('');
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
        setCurrentSearchTitle(title);

        let errorDetails = '';
        try {
            const result: BookSearchResult = await searchBook(title);

            if (result.success && result.book) {
                setCurrentBook(result.book);
            } else {
                // Show detailed error if available
                if (result.error) {
                    setError(result.error);
                    errorDetails = `Error: ${result.error}`;
                    // If there are extra error fields, include them
                    if ((result as any).rawContent) {
                        errorDetails += `\n\nRaw content:\n${(result as any).rawContent}`;
                    }
                    if ((result as any).parseError) {
                        errorDetails += `\n\nParse error:\n${(result as any).parseError}`;
                    }
                } else {
                    setError('An unexpected error occurred.');
                    errorDetails = 'No additional error details.';
                }
            }
        } catch (err: any) {
            // Show the actual error message if possible
            let devDetails = '';
            if (err) {
                if (err.stack) {
                    devDetails += `Stack Trace:\n${err.stack}\n`;
                }
                if (err.message) {
                    devDetails += `Message: ${err.message}\n`;
                }
                if (err.response) {
                    devDetails += `API Response: ${JSON.stringify(err.response.data, null, 2)}\n`;
                    devDetails += `Status: ${err.response.status}\n`;
                    devDetails += `Status Text: ${err.response.statusText}\n`;
                }
                if (err.config) {
                    devDetails += `Request URL: ${err.config.url}\n`;
                    devDetails += `Request Headers: ${JSON.stringify(err.config.headers, null, 2)}\n`;
                }
            }
            setError(err && err.message ? `Failed to search for the book: ${err.message}` : 'Failed to search for the book. Please try again.');
            errorDetails = devDetails || 'No additional error details.';
        } finally {
            setIsLoading(false);
        }
        // Store error details in state for ErrorMessage
        (window as any).book2actionErrorDetails = errorDetails;
    }; const handleSearchFocus = () => {
        // Reset to home state when clicking the title
        setCurrentBook(null);
        setError(null);
        setSelectedAction(null);
        setCurrentSearchTitle('');

        // Focus the search input if available
        if (searchInputRef) {
            searchInputRef.focus();
        }
    };

    const handleRetry = () => {
        setError(null);
        setCurrentBook(null);
        setSelectedAction(null);
        setCurrentSearchTitle('');
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
                    <ErrorMessage message={error} details={(window as any).book2actionErrorDetails || ''} onRetry={handleRetry} />
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center my-12">
                        <div className="book-animation-container">
                            <img
                                src="https://media.giphy.com/media/LYBMuRwH3JkhdmLbGE/giphy.gif"
                                alt="Book pages flipping animation"
                                className="book-animation-gif"
                            />
                        </div>
                        <div className="mt-4 text-center overflow-hidden max-w-4xl mx-auto px-6">
                            <div className="animated-text-container">
                                <p className="animated-text">
                                    Our AI is reading through <span className={isDarkMode ? "text-white font-bold" : "text-black font-bold"}>
                                        {currentSearchTitle ? `"${currentSearchTitle.toUpperCase()}"` : "the book"}
                                    </span> to create a custom 7-day action plan and summary for you...
                                </p>
                            </div>
                        </div>
                    </div>
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
