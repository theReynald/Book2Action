import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Calendar, BookOpen, Volume2, VolumeX, Pause, Settings } from 'lucide-react';
import { ActionableStep } from '../types/Book';

interface ActionStepDetailProps {
    step: ActionableStep;
    bookTitle: string;
    onBack: () => void;
    isDarkMode: boolean;
}

const ActionStepDetail: React.FC<ActionStepDetailProps> = ({ step, bookTitle, onBack, isDarkMode }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [voiceMenuOpen, setVoiceMenuOpen] = useState<boolean>(false);
    const voiceMenuRef = useRef<HTMLDivElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);
    
    // If detailed info isn't available, generate some placeholder content based on the step
    const details = step.details || {
        sentences: [
            `This step helps you implement "${step.step}" in your daily life.`,
            `Based on the principles from chapter ${step.chapter}, this action creates lasting change.`,
            `Many readers have found that this specific technique leads to measurable results.`,
            `The author emphasizes this point as essential to mastering the book's core concepts.`,
            `Try implementing this consistently for at least 21 days to form a habit.`
        ],
        keyTakeaway: `The most important aspect of "${step.step}" is consistency and intentional practice.`
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
        let textToRead = `Action step for day ${step.day}. ${step.step}. From ${step.chapter}.\n\n`;
        textToRead += `Key takeaway: ${details.keyTakeaway}\n\n`;
        textToRead += `Detailed implementation:\n`;
        
        details.sentences.forEach((sentence, index) => {
            textToRead += `Point ${index + 1}: ${sentence}\n`;
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
        }
    };

    // Function to test a voice
    const testSelectedVoice = () => {
        if (!window.speechSynthesis) return;

        try {
            // Safely cancel any ongoing speech first
            window.speechSynthesis.cancel();

            const testUtterance = new SpeechSynthesisUtterance(
                `This is a test of the selected voice for this action from ${bookTitle}.`
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
            };

            // Speak the test phrase
            window.speechSynthesis.speak(testUtterance);
        } catch (error) {
            console.log('Error during voice test:', error);
        }
    };

    // Function to create Google Calendar event link
    const createCalendarLink = () => {
        const eventTitle = encodeURIComponent(`Book Action: ${step.step}`);
        const eventDetails = encodeURIComponent(
            `From book: ${bookTitle}\n` +
            `Chapter: ${step.chapter}\n\n` +
            `Key takeaway: ${details.keyTakeaway}\n\n` +
            `Details:\n${details.sentences.join('\n')}`
        );
        
        // Generate a date 1 day from now for the default date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startDate = tomorrow.toISOString().split('T')[0].replace(/-/g, '');
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${startDate}/${startDate}`;
    };

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white bg-opacity-80'} rounded-2xl p-8 shadow-2xl glass-effect max-w-4xl mx-auto mb-12`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button 
                        onClick={onBack}
                        className={`mr-4 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
                    </button>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {step.day ? `Day ${step.day}: ` : ''}Action Detail
                    </h2>
                </div>
                
                {/* Read Aloud and Settings Buttons */}
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
                                title="Read the action details out loud"
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
                            className="absolute top-full right-0 mt-2 p-4 bg-gray-900 rounded-lg shadow-xl z-[100] w-72"
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

            <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {step.step}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                    <div className={`flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="text-sm">Chapter {step.chapter}</span>
                    </div>
                    {step.day && (
                        <div className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-900 bg-opacity-40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            Day {step.day}
                        </div>
                    )}
                </div>
            </div>

            <div className={`mb-8 ${isDarkMode ? 'text-white text-opacity-90' : 'text-gray-700'}`}>
                <h4 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Key Takeaway:
                </h4>
                <p className="mb-4 italic">{details.keyTakeaway}</p>

                <h4 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Detailed Implementation:
                </h4>
                <ul className="space-y-3 list-disc pl-6">
                    {details.sentences.map((sentence, index) => (
                        <li key={index}>{sentence}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-8 pt-4 border-t border-opacity-20 border-gray-500">
                <div className={`${isDarkMode ? 'text-white text-opacity-80' : 'text-gray-600'} text-sm`}>
                    From <span className="font-medium">{bookTitle}</span>
                </div>
                <a 
                    href={createCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center button-gradient text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                </a>
            </div>
        </div>
    );
};

export default ActionStepDetail;
