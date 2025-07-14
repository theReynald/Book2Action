import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types/Book';
import { BookOpen, User, Calendar, Tag, CheckCircle, Bookmark, CalendarPlus, Volume2, VolumeX, Pause, Settings, ChevronDown } from 'lucide-react';

interface BookResultProps {
    book: Book;
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

const BookResult: React.FC<BookResultProps> = ({ book }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [voiceMenuOpen, setVoiceMenuOpen] = useState<boolean>(false);
    const voiceMenuRef = useRef<HTMLDivElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

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

            // Set default selected voice (prefer premium voices)
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
                // Fallback to any English voice
                const englishVoice = availableVoices.find(v => v.lang.includes('en'));
                if (englishVoice) {
                    setSelectedVoice(englishVoice.name);
                    console.log('Selected English voice:', englishVoice.name);
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
        let textToRead = `Book: ${book.title} by ${book.author}.\n\nSummary: ${book.summary}\n\nHere is your 7-Day Action Plan:\n`;

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
                                className="w-24 h-32 object-cover rounded-xl shadow-lg border-2 border-white border-opacity-20"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    const currentSrc = img.src;
                                    console.log('Image failed to load:', currentSrc);

                                    // Comprehensive fallback strategy
                                    if (book.isbn && currentSrc.includes('openlibrary.org/b/isbn/')) {
                                        // Fallback 1: Try Google Books using ISBN
                                        console.log('Trying Google Books API fallback with ISBN');
                                        img.src = `https://books.google.com/books/content?id=ISBN:${book.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
                                    }
                                    else if (book.isbn && currentSrc.includes('books.google.com') && currentSrc.includes('ISBN:')) {
                                        // Fallback 2: Try Google Books ID lookup
                                        console.log('Trying Google Books API fallback with direct ID');
                                        img.src = `https://books.google.com/books/content?id=${book.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
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
                            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 w-24 h-32 flex items-center justify-center"
                            style={{ display: book.coverImageUrl ? 'none' : 'flex' }}
                        >
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            <a
                                href={generateAmazonLink(book.title, book.author, book.isbn)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-300 transition-colors flex items-center"
                                title="View on Amazon"
                            >
                                {book.title}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                            </a>
                        </h2>
                        <div className="flex flex-wrap gap-4 text-white text-opacity-80">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
                <div className="flex justify-between items-center mb-4 relative">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                        <BookOpen className="w-6 h-6 mr-3" />
                        Summary
                    </h3>
                    <div className="flex gap-3 items-center relative z-50">
                        {/* Read Aloud Buttons First */}
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
                                    className="flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
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
                                className="absolute bottom-full right-0 mb-2 p-4 bg-gray-800 rounded-lg shadow-xl z-[100] w-72"
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
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {voices
                                            .filter(voice => voice.lang.includes('en'))
                                            .sort((a, b) => {
                                                // Sort premium voices first
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
                <p className="text-white text-opacity-90 leading-relaxed text-lg">
                    {book.summary}
                </p>
            </div>

            {/* Actionable Steps Section */}
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    7-Day Action Plan
                </h3>
                <div className="grid gap-4">
                    {book.actionableSteps.map((actionableStep, index) => (
                        <div
                            key={index}
                            className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-opacity-90 leading-relaxed mb-2">
                                        {actionableStep.day && (
                                            <span className="font-bold text-blue-300 mr-2">{actionableStep.day}:</span>
                                        )}
                                        {actionableStep.step}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center text-white text-opacity-60 text-sm">
                                            <Bookmark className="w-4 h-4 mr-1" />
                                            <span className="italic">{actionableStep.chapter}</span>
                                        </div>
                                        {actionableStep.day && (
                                            <a
                                                href={generateCalendarLink(actionableStep.step, book.title, actionableStep.day)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-blue-300 hover:text-blue-100 transition-colors"
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
