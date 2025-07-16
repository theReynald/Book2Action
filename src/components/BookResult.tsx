import React, { useState, useRef, useEffect } from 'react';
import { Book, ActionableStep } from '../types/Book';
import { BookOpen, User, Calendar, Tag, CheckCircle, Bookmark, CalendarPlus, Volume2, VolumeX, Pause, Settings, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import ExportPdfButton from './ExportPdfButton';

interface BookResultProps {
    book: Book;
    isDarkMode: boolean;
    onActionSelect?: (action: ActionableStep) => void;
}

// Helper function to generate Google Calendar link
const generateCalendarLink = (actionStep: string, bookTitle: string, day: string): string => {
    // Get next occurrence of the specified day
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = daysOfWeek.findIndex(d => d === day);

    if (dayIndex === -1) return '#'; // Invalid day name

    const targetDate = new Date(today);
    const todayDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days to add to get to the target day
    let daysToAdd = dayIndex - todayDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // If the day has passed this week, get next week's occurrence

    targetDate.setDate(today.getDate() + daysToAdd);

    // Format for Google Calendar URL
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const date = targetDate.getDate().toString().padStart(2, '0');

    // Create an event that lasts 1 hour
    const startDate = `${year}${month}${date}`;

    // Encode the event details
    const details = encodeURIComponent(`Action step from "${bookTitle}"`);
    const text = encodeURIComponent(actionStep);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${startDate}T090000/${startDate}T100000&ctz=local`;
};

// Helper function to generate Amazon search link
const generateAmazonLink = (title: string, author: string, isbn?: string): string => {
    if (isbn) {
        // If we have an ISBN, use it for a precise search
        return `https://www.amazon.com/s?k=${encodeURIComponent(isbn)}`;
    } else {
        // Otherwise, search for title and author
        return `https://www.amazon.com/s?k=${encodeURIComponent(`${title} ${author} book`)}`;
    }
};

const BookResult: React.FC<BookResultProps> = ({ book, isDarkMode, onActionSelect }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [voiceMenuOpen, setVoiceMenuOpen] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const voiceMenuRef = useRef<HTMLDivElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

    // Create detailed summary that matches the PDF
    const getDetailedSummary = () => {
        return book.summary; // Just return the book summary without additional text
    };

    // Click outside handler for voice menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (voiceMenuRef.current && !voiceMenuRef.current.contains(event.target as Node)) {
                setVoiceMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Load voices when component mounts
    React.useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Set default selected voice (prioritize Google UK English Female)
            const googleUKFemale = availableVoices.find(v =>
                v.name.includes('Google UK English Female') ||
                (v.name.toLowerCase().includes('google') &&
                    v.name.toLowerCase().includes('uk') &&
                    v.name.toLowerCase().includes('female')) ||
                (v.name.toLowerCase().includes('google') &&
                    v.lang === 'en-GB' &&
                    v.name.toLowerCase().includes('female'))
            );

            if (googleUKFemale) {
                setSelectedVoice(googleUKFemale.name);
                console.log('Selected Google UK Female voice:', googleUKFemale.name);
            } else {
                // Fallback to other premium Google voices
                const googleVoice = availableVoices.find(v =>
                    v.name.toLowerCase().includes('google') &&
                    v.lang.includes('en') &&
                    v.name.toLowerCase().includes('female')
                );

                if (googleVoice) {
                    setSelectedVoice(googleVoice.name);
                    console.log('Selected Google Female voice:', googleVoice.name);
                } else {
                    // Fallback to other premium voices
                    const premiumVoice = availableVoices.find(v =>
                        (v.name.includes('Premium') || v.name.includes('Enhanced') ||
                            v.name.includes('Neural') || v.name.includes('Wavenet') ||
                            v.name.includes('Siri') || v.name.includes('Samantha') ||
                            v.name.includes('Daniel') || v.name.includes('Karen')) &&
                        v.lang.includes('en')
                    );

                    if (premiumVoice) {
                        setSelectedVoice(premiumVoice.name);
                        console.log('Selected premium voice:', premiumVoice.name);
                    } else {
                        // Final fallback to any English voice
                        const englishVoice = availableVoices.find(v => v.lang.includes('en'));
                        if (englishVoice) {
                            setSelectedVoice(englishVoice.name);
                            console.log('Selected English voice:', englishVoice.name);
                        }
                    }
                }
            }

            // Log available voices for debugging
            console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
        };

        // Load voices right away
        loadVoices();

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup on unmount
        return () => {
            try {
                // Always cancel any ongoing speech when unmounting
                window.speechSynthesis.cancel();
            } catch (error) {
                console.log('Error when cleaning up speech synthesis:', error);
                // Don't show an alert during cleanup
            }
        };
    }, []);

    // Function to handle text-to-speech
    const handleReadAloud = () => {
        if (!window.speechSynthesis) {
            alert('Sorry, your browser does not support text-to-speech functionality.');
            return;
        }

        if (isSpeaking) {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create text to be read
        let textToRead = `Book: ${book.title} by ${book.author}.\n\nSummary: ${isExpanded ? getDetailedSummary() : book.summary}\n\nHere is your 7-Day Action Plan:\n`;

        book.actionableSteps.forEach((step, index) => {
            textToRead += `${step.day}: ${step.step}. From ${step.chapter}.\n`;
        });

        const utterance = new SpeechSynthesisUtterance(textToRead);

        // Set the selected voice
        if (voices.length > 0 && selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) {
                utterance.voice = voice;
                console.log('Using voice:', voice.name);
            }
        }

        // Adjust speech parameters
        utterance.rate = speechRate;
        utterance.pitch = 1.0;

        // Add event listeners
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.log('Speech synthesis error:', event);

            // Only show error if speech was actually in progress
            // This prevents error messages when deliberately stopping
            if (isSpeaking) {
                // Check if this is a user-initiated cancellation
                const isCancellationError =
                    event.error === 'canceled' ||
                    event.error === 'interrupted' ||
                    (event as any).name === 'CancelEvent';

                if (!isCancellationError) {
                    alert('An error occurred while reading the text.');
                }
            }

            setIsSpeaking(false);
            setIsPaused(false);
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
    };

    // Function to stop reading
    const handleStopReading = () => {
        try {
            // Set state first to prevent the error handler from showing an alert
            setIsSpeaking(false);
            setIsPaused(false);

            // Then cancel speech - this might trigger an error but we've already set isSpeaking to false
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        } catch (error) {
            console.log('Error when stopping speech synthesis:', error);
            // No need to show an alert as this is an expected operation
        }
    };

    // Function to test a voice
    const testSelectedVoice = () => {
        if (!window.speechSynthesis) return;

        try {
            // Safely cancel any ongoing speech first
            window.speechSynthesis.cancel();

            const testUtterance = new SpeechSynthesisUtterance(
                `This is a test of the selected voice for ${book.title}.`
            );

            // Set the selected voice
            if (voices.length > 0 && selectedVoice) {
                const voice = voices.find(v => v.name === selectedVoice);
                if (voice) {
                    testUtterance.voice = voice;
                    console.log('Testing voice:', voice.name);
                }
            }

            // Set speech parameters
            testUtterance.rate = speechRate;
            testUtterance.pitch = 1.0;

            // Add error handler that doesn't show an alert
            testUtterance.onerror = (event) => {
                console.log('Test voice error:', event);
                // Don't show an alert for the test voice
            };

            // Speak the test phrase
            window.speechSynthesis.speak(testUtterance);
        } catch (error) {
            console.log('Error during voice test:', error);
            // Don't show an alert for errors during voice test
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Book Header */}
            <div className="glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
                <div className="flex items-start space-x-6">
                    {/* Book Cover Image */}
                    <div className="flex-shrink-0">
                        {book.coverImageUrl ? (
                            <img
                                src={book.coverImageUrl}
                                alt={`${book.title} cover`}
                                className="w-24 h-32 object-cover rounded-xl shadow-lg border-2 border-gray-700"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    const currentSrc = img.src;
                                    console.log('Image failed to load:', currentSrc);

                                    // Comprehensive fallback strategy
                                    if (book.isbn && currentSrc.includes('openlibrary.org/b/isbn/')) {
                                        // Fallback 1: Try Google Books using ISBN
                                        console.log('Trying Google Books API fallback with ISBN');
                                        img.src = `https://books.google.com/books/content?id=ISBN:${book.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs-api`;
                                    }
                                    else if (book.isbn && currentSrc.includes('books.google.com') && currentSrc.includes('ISBN:')) {
                                        // Fallback 2: Try Google Books ID lookup
                                        console.log('Trying Google Books API fallback with direct ID');
                                        img.src = `https://books.google.com/books/content?id=${book.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs-api`;
                                    }
                                    else if (currentSrc.includes('books.google.com')) {
                                        // Fallback 3: Try title-based OpenLibrary search
                                        console.log('Trying OpenLibrary title-based fallback');
                                        const encodedTitle = encodeURIComponent(book.title);
                                        img.src = `https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`;
                                    }
                                    else if (currentSrc.includes('openlibrary.org/b/title/')) {
                                        // Fallback 4: Try Amazon as final external source
                                        console.log('Trying Amazon lookup fallback');
                                        // Format ASIN/ISBN for Amazon
                                        const amazonId = book.isbn || encodeURIComponent(book.title);
                                        img.src = `https://images-na.ssl-images-amazon.com/images/P/${amazonId}.01._SX450_SY635_SCLZZZZZZZ_.jpg`;
                                    }
                                    else {
                                        // Final fallback: Show icon placeholder
                                        console.log('All image sources failed, showing placeholder');
                                        img.style.display = 'none';
                                        const fallback = img.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}
                        <div
                            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 w-24 h-32 flex items-center justify-center"
                            style={{ display: book.coverImageUrl ? 'none' : 'flex' }}
                        >
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <a
                                href={generateAmazonLink(book.title, book.author, book.isbn)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`transition-colors flex items-center ${isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'}`}
                                title="View on Amazon"
                            >
                                {book.title}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                            </a>
                        </h2>
                        <div className={`flex flex-wrap gap-4 ${isDarkMode ? 'text-white text-opacity-80' : 'text-gray-700'}`}>
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                <span>{book.author}</span>
                            </div>
                            {book.publishedYear && (
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{book.publishedYear}</span>
                                </div>
                            )}
                            {book.genre && (
                                <div className="flex items-center">
                                    <Tag className="w-4 h-4 mr-2" />
                                    <span>{book.genre}</span>
                                </div>
                            )}
                            <a
                                href={generateAmazonLink(book.title, book.author, book.isbn)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center bg-[#FF9900] hover:bg-[#FF8C00] text-black px-3 py-1 rounded-md transition-colors"
                                title="Buy this book on Amazon"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.42,13.75C18.27,13.77 18.12,13.81 17.97,13.86C17.21,14.06 16.44,14.58 16.07,15C15.5,15.68 15.39,16.05 15.37,16.29C15.34,16.86 15.67,17.47 16.27,17.82C16.58,18 16.93,18.1 17.29,18.1C17.8,18.1 18.32,17.95 18.83,17.67C19.87,17.05 20.71,15.74 20.92,15C21.04,14.57 21.04,14.25 20.92,14.06C20.69,13.73 20.13,13.72 19.53,13.72M12.4,14.03C11.93,14.03 11.5,14.46 11.5,14.94C11.5,15.42 11.93,15.84 12.4,15.84C12.87,15.84 13.3,15.42 13.3,14.94C13.3,14.46 12.87,14.03 12.4,14.03M7.3,15.61C7.3,15.61 7.94,15 8.27,15C8.6,15 9.04,16.15 9.04,16.15C9.04,16.15 8.72,17.3 8.09,17.32C7.84,17.33 7.7,17.11 7.47,16.67C7.31,16.33 7.3,15.61 7.3,15.61M21.8,16.04C21.8,16.04 21.42,16.89 20.36,17.76C18.67,19.17 15.94,20 14.16,20C11.32,20 8.14,18.55 6.5,16.5C6.13,16.03 5.94,15.74 5.81,15.65C5.67,15.56 5.67,15.66 5.8,15.97C6.68,18.08 10.19,20.39 14.03,20.39C18.29,20.39 19.96,18.11 19.96,18.11C19.96,18.11 20.23,18.32 19.71,18.93C19.08,19.67 16.94,21.27 13.84,21.41C10.24,21.58 7.12,19.96 7.12,19.96C7.12,19.96 6.82,19.73 7.36,19.73C7.85,19.73 9.46,19.96 10.03,19.8C10.97,19.54 11.97,19.25 12.76,18.95C15.89,17.71 17.08,15.08 16.61,13.83C16.31,13.08 15.22,12.11 14.06,12.11C13.45,12.11 12.12,12.46 12.12,13.1C12.12,13.25 12.18,13.41 12.27,13.56C12.33,13.83 12.03,14.06 11.58,13.95C10.9,13.78 10.69,13.5 10.62,13.23C10.22,12.07 11.96,11.13 14.06,11.13C15.36,11.13 16.56,11.56 17.11,12.33C17.33,12.23 17.56,12.15 17.76,12.11C18.71,11.95 19.55,12.35 19.86,13.04C20.01,13.36 20.04,13.76 19.96,14.22C19.89,14.88 19.07,16.38 17.91,17.11C17.21,17.53 16.36,17.78 15.5,17.78C14.96,17.78 14.45,17.69 14.06,17.5C13.35,17.1 12.85,16.47 12.72,15.74C12.94,15.76 13.16,15.79 13.39,15.79C13.7,15.79 14.02,15.76 14.33,15.7C15.36,15.5 16.28,14.97 16.94,14.21C17.19,13.93 17.17,13.95 17.3,13.8C17.55,13.5 17.91,13 18.17,12.85C18.97,12.38 19.96,12.74 19.96,13.21C19.96,13.38 19.85,13.59 19.53,13.79C19.35,13.91 18.29,14.21 17.47,15.23C16.88,15.96 16.18,16.26 15.19,16.43C14.77,16.5 14.36,16.5 13.96,16.55C13.93,16.24 13.79,15.95 13.57,15.7C13.55,15.69 13.54,15.67 13.53,15.65C13.57,15.66 13.6,15.67 13.64,15.69C13.69,15.71 13.74,15.73 13.8,15.74C13.91,15.77 14.03,15.79 14.14,15.79C14.25,15.79 14.36,15.78 14.47,15.77C14.58,15.76 14.69,15.74 14.8,15.72C14.96,15.69 15.12,15.64 15.27,15.59C15.42,15.53 15.57,15.47 15.71,15.4C15.84,15.33 15.97,15.25 16.09,15.16C16.21,15.07 16.32,14.97 16.42,14.87C16.5,14.77 16.59,14.68 16.65,14.58C16.71,14.5 16.77,14.41 16.8,14.31C16.83,14.25 16.85,14.19 16.86,14.13C16.86,14.09 16.86,14.05 16.86,14.01C16.85,13.93 16.8,13.84 16.7,13.76C16.59,13.67 16.46,13.59 16.33,13.54C16.19,13.49 16.04,13.46 15.89,13.44C15.67,13.41 15.44,13.41 15.22,13.44C15.09,13.45 14.97,13.47 14.84,13.5C14.77,13.52 14.71,13.54 14.64,13.56C14.57,13.58 14.5,13.61 14.43,13.64C14.29,13.7 14.15,13.77 14.02,13.85C13.88,13.94 13.74,14.03 13.61,14.14C13.49,14.24 13.36,14.35 13.24,14.47C13.2,14.5 13.17,14.54 13.13,14.58C13.04,14.67 12.96,14.77 12.88,14.87C12.8,14.97 12.74,15.06 12.7,15.12C12.67,15.17 12.65,15.23 12.64,15.25C12.66,15.11 12.71,14.97 12.78,14.84C12.85,14.71 12.93,14.59 13.03,14.48C13.12,14.37 13.23,14.27 13.35,14.18C13.46,14.09 13.58,14.01 13.71,13.94C13.84,13.86 13.97,13.8 14.11,13.74C14.25,13.68 14.39,13.64 14.53,13.61C14.67,13.58 14.82,13.56 14.97,13.55C15.12,13.54 15.27,13.54 15.41,13.56C15.56,13.58 15.71,13.6 15.85,13.64C15.99,13.67 16.13,13.72 16.25,13.78C16.37,13.84 16.48,13.91 16.58,13.99C16.67,14.06 16.75,14.14 16.81,14.23C16.86,14.32 16.9,14.41 16.92,14.5C16.93,14.59 16.92,14.69 16.9,14.78C16.88,14.87 16.84,14.96 16.79,15.05C16.74,15.13 16.68,15.21 16.62,15.29C16.56,15.37 16.49,15.44 16.42,15.51C16.35,15.58 16.28,15.64 16.2,15.71C16.13,15.77 16.05,15.83 15.97,15.88C15.89,15.93 15.81,15.97 15.73,16.02C15.64,16.06 15.56,16.1 15.47,16.13C15.38,16.16 15.29,16.19 15.21,16.21C15.12,16.23 15.03,16.25 14.94,16.26C14.85,16.27 14.76,16.28 14.67,16.29C14.58,16.29 14.49,16.29 14.4,16.29C14.34,16.29 14.28,16.28 14.23,16.28C14.18,16.27 14.14,16.27 14.11,16.26C14.07,16.26 14.04,16.25 14.02,16.25L14,16.25L14,16.25Z" />
                                </svg>
                                <span>Buy on Amazon</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
                <div className="flex justify-between items-center mb-4 relative">
                    <h3 className={`text-2xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        <BookOpen className="w-6 h-6 mr-3" />
                        Summary
                    </h3>
                    <div className="flex gap-3 items-center relative z-50">
                        {/* Read Aloud Buttons */}
                        {isSpeaking ? (
                            <>
                                <button
                                    onClick={isPaused ? handleReadAloud : handleReadAloud}
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-md transition-colors"
                                    title={isPaused ? "Resume reading" : "Pause reading"}
                                >
                                    {isPaused ? (
                                        <>
                                            <Volume2 size={18} />
                                            <span>Resume</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pause size={18} />
                                            <span>Pause</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleStopReading}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md transition-colors"
                                    title="Stop reading"
                                >
                                    <VolumeX size={18} />
                                    <span>Stop</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleReadAloud}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    title="Read the summary and action plan out loud"
                                >
                                    <Volume2 size={18} />
                                    <span>Read Aloud</span>
                                </button>
                                {/* Settings Gear Icon */}
                                <button
                                    ref={settingsButtonRef}
                                    onClick={() => setVoiceMenuOpen(!voiceMenuOpen)}
                                    className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                                    title="Voice settings"
                                >
                                    <Settings size={18} />
                                </button>
                            </>
                        )}

                        {/* Voice Settings Dropdown */}
                        {voiceMenuOpen && (
                            <div
                                ref={voiceMenuRef}
                                className="absolute bottom-full right-0 mb-2 p-4 bg-gray-900 rounded-lg shadow-xl z-[100] w-72"
                                style={{ maxHeight: '80vh', overflowY: 'auto' }}
                            >
                                <div className="mb-4">
                                    <label className="block text-white text-sm mb-2" htmlFor="voice-select">
                                        Select Voice
                                    </label>
                                    <select
                                        id="voice-select"
                                        value={selectedVoice}
                                        onChange={(e) => setSelectedVoice(e.target.value)}
                                        className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {voices
                                            .filter(voice => voice.lang.includes('en'))
                                            .sort((a, b) => {
                                                // Prioritize Google UK English Female first
                                                const aIsGoogleUKFemale = a.name.includes('Google UK English Female') ||
                                                    (a.name.toLowerCase().includes('google') &&
                                                        a.name.toLowerCase().includes('uk') &&
                                                        a.name.toLowerCase().includes('female'));
                                                const bIsGoogleUKFemale = b.name.includes('Google UK English Female') ||
                                                    (b.name.toLowerCase().includes('google') &&
                                                        b.name.toLowerCase().includes('uk') &&
                                                        b.name.toLowerCase().includes('female'));

                                                if (aIsGoogleUKFemale && !bIsGoogleUKFemale) return -1;
                                                if (!aIsGoogleUKFemale && bIsGoogleUKFemale) return 1;

                                                // Then prioritize other Google voices
                                                const aIsGoogle = a.name.toLowerCase().includes('google');
                                                const bIsGoogle = b.name.toLowerCase().includes('google');

                                                if (aIsGoogle && !bIsGoogle) return -1;
                                                if (!aIsGoogle && bIsGoogle) return 1;

                                                // Then sort premium voices
                                                const aPremium = a.name.includes('Premium') ||
                                                    a.name.includes('Enhanced') ||
                                                    a.name.includes('Neural') ||
                                                    a.name.includes('Wavenet');
                                                const bPremium = b.name.includes('Premium') ||
                                                    b.name.includes('Enhanced') ||
                                                    b.name.includes('Neural') ||
                                                    b.name.includes('Wavenet');

                                                if (aPremium && !bPremium) return -1;
                                                if (!aPremium && bPremium) return 1;
                                                return a.name.localeCompare(b.name);
                                            })
                                            .map(voice => (
                                                <option key={voice.name} value={voice.name}>
                                                    {voice.name} ({voice.lang})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-white text-sm mb-2">
                                        Speech Rate: {speechRate.toFixed(1)}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={speechRate}
                                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <button
                                    onClick={testSelectedVoice}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mt-2"
                                >
                                    <Volume2 size={16} />
                                    <span>Test Voice</span>
                                </button>

                                <div className="text-xs text-gray-400 mt-2">
                                    <p>Premium voices offer better quality but may not be available on all devices.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`leading-relaxed text-lg ${isDarkMode ? 'text-white text-opacity-90' : 'text-gray-800'}`}>
                    {(() => {
                        const paragraphs = book.summary.split('\n\n');

                        if (isExpanded) {
                            // Show all paragraphs when expanded
                            return (
                                <div className="space-y-4">
                                    {paragraphs.map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            );
                        } else {
                            // Show only first paragraph when collapsed
                            return (
                                <div className="space-y-4">
                                    <p>{paragraphs[0]}</p>

                                    {/* Show "See More" button after first paragraph */}
                                    {paragraphs.length > 1 && (
                                        <button
                                            onClick={() => setIsExpanded(true)}
                                            className={`flex items-center gap-2 mt-4 px-4 py-2 rounded-md transition-colors ${isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                        >
                                            <ChevronDown size={16} />
                                            <span>See More</span>
                                        </button>
                                    )}
                                </div>
                            );
                        }
                    })()}

                    {/* Show "Show Less" button only when expanded */}
                    {isExpanded && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className={`flex items-center gap-2 mt-4 px-4 py-2 rounded-md transition-colors ${isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <ChevronUp size={16} />
                            <span>Show Less</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Actionable Steps Section */}
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <CheckCircle className="w-6 h-6 mr-3" />
                    7-Day Action Plan
                </h3>
                <ExportPdfButton book={book} isDarkMode={isDarkMode} isExpanded={isExpanded} />
            </div>
                <div className="grid gap-4">
                    {book.actionableSteps.map((actionableStep, index) => (
                        <div
                            key={index}
                            className="bg-white bg-opacity-5 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div
                                        onClick={() => onActionSelect && onActionSelect(actionableStep)}
                                        className={`cursor-pointer flex items-start ${onActionSelect ? 'hover:text-blue-400' : ''} transition-colors`}
                                    >
                                        <p className={`leading-relaxed mb-2 flex-grow ${isDarkMode ? 'text-white text-opacity-90' : 'text-gray-800'}`}>
                                            {actionableStep.day && (
                                                <span className={`font-bold mr-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{actionableStep.day}:</span>
                                            )}
                                            {actionableStep.step}
                                            {onActionSelect && (
                                                <ExternalLink className="inline-block ml-2 w-4 h-4 text-blue-400" />
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className={`flex items-center text-sm ${isDarkMode ? 'text-white text-opacity-60' : 'text-gray-600'}`}>
                                            <Bookmark className="w-4 h-4 mr-1" />
                                            <span className="italic">{actionableStep.chapter}</span>
                                        </div>
                                        {actionableStep.day && (
                                            <a
                                                href={generateCalendarLink(actionableStep.step, book.title, actionableStep.day)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center text-sm transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                                                title={`Add "${actionableStep.day}: ${actionableStep.step.substring(0, 30)}..." to your calendar`}
                                            >
                                                <CalendarPlus className="w-4 h-4 mr-1" />
                                                <span>Add to Calendar</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

export default BookResult;
