import { Book } from '../types/Book';
import { getTrendingBooks } from './openRouterService';

// Additional trending books to give more variety when refreshing
const additionalTrendingBooks: Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[] = [
    {
        title: 'Rich Dad, Poor Dad',
        author: 'Robert T. Kiyosaki',
        isbn: '9781612680194',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg'
    },
    {
        title: 'How to Win Friends and Influence People',
        author: 'Dale Carnegie',
        isbn: '9780671027032',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg'
    },
    {
        title: 'The 4-Hour Workweek',
        author: 'Timothy Ferriss',
        isbn: '9780307465351',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780307465351-L.jpg'
    },
    {
        title: 'The Power of Now',
        author: 'Eckhart Tolle',
        isbn: '9781577314806',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg'
    },
    {
        title: 'Outliers',
        author: 'Malcolm Gladwell',
        isbn: '9780316017930',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780316017930-L.jpg'
    },
    {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780061122415',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg'
    },
    {
        title: 'Deep Work',
        author: 'Cal Newport',
        isbn: '9781455586691',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg'
    },
    {
        title: 'Mindset',
        author: 'Carol S. Dweck',
        isbn: '9780345472328',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg'
    }
];

// Function to get random books from the combined list
const getRandomBooks = (books: Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[], count: number = 5) => {
    // Shuffle the array using Fisher-Yates algorithm
    const shuffled = [...books];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the first 'count' books or all if there are fewer
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const fetchTrendingBooks = async (): Promise<Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[]> => {
    // Get base trending books from openRouterService
    const baseTrendingBooks = getTrendingBooks();

    // Combine with additional books
    const allTrendingBooks = [...baseTrendingBooks, ...additionalTrendingBooks];

    // Return a random selection (5 books by default)
    return getRandomBooks(allTrendingBooks);
};
