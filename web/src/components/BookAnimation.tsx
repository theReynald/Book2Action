// BookAnimation component that displays an animated book
import React from 'react';

interface BookAnimationProps {
    isAnimating: boolean;
}

const BookAnimation: React.FC<BookAnimationProps> = ({ isAnimating }) => {
    return (
        <div className={`book-animation ${isAnimating ? 'animating' : ''}`}>
            <div className="book">
                <div className="book-cover">
                    <div className="book-spine"></div>
                    <div className="book-pages"></div>
                </div>
            </div>
        </div>
    );
};

export default BookAnimation;