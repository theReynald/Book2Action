import React from 'react';
import { Book } from '../types/Book';
import { BookOpen, User, Calendar, Tag, CheckCircle, Bookmark } from 'lucide-react';

interface BookResultProps {
    book: Book;
}

const BookResult: React.FC<BookResultProps> = ({ book }) => {
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
                        <h2 className="text-3xl font-bold text-white mb-3">{book.title}</h2>
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
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Summary
                </h3>
                <p className="text-white text-opacity-90 leading-relaxed text-lg">
                    {book.summary}
                </p>
            </div>

            {/* Actionable Steps Section */}
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    10 Actionable Steps
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
                                        {actionableStep.step}
                                    </p>
                                    <div className="flex items-center text-white text-opacity-60 text-sm">
                                        <Bookmark className="w-4 h-4 mr-1" />
                                        <span className="italic">{actionableStep.chapter}</span>
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
