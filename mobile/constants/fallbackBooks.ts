import { Book } from '../types/Book';

type TrendingBook = Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>;

export const fallbackBooks: TrendingBook[] = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    isbn: '9781585424337',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    isbn: '9781982137274',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg',
  },
  {
    title: 'Rich Dad, Poor Dad',
    author: 'Robert T. Kiyosaki',
    isbn: '9781612680194',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
  },
  {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    isbn: '9780671027032',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg',
  },
  {
    title: 'The 4-Hour Workweek',
    author: 'Timothy Ferriss',
    isbn: '9780307465351',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780307465351-L.jpg',
  },
  {
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    isbn: '9781577314806',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg',
  },
  {
    title: 'Outliers',
    author: 'Malcolm Gladwell',
    isbn: '9780316017930',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780316017930-L.jpg',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780061122415',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    isbn: '9781455586691',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
  },
  {
    title: 'Mindset',
    author: 'Carol S. Dweck',
    isbn: '9780345472328',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg',
  },
  {
    title: 'Start with Why',
    author: 'Simon Sinek',
    isbn: '9781591846444',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781591846444-L.jpg',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
  },
  {
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    isbn: '9780807014271',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '9780307887894',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    isbn: '9780804139298',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg',
  },
  {
    title: 'Daring Greatly',
    author: 'Brené Brown',
    isbn: '9781592407330',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781592407330-L.jpg',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '9780374533557',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
  },
  {
    title: 'Good to Great',
    author: 'Jim Collins',
    isbn: '9780066620992',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg',
  },
  {
    title: 'Grit',
    author: 'Angela Duckworth',
    isbn: '9781501111105',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781501111105-L.jpg',
  },
  {
    title: 'Essentialism',
    author: 'Greg McKeown',
    isbn: '9780804137386',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780804137386-L.jpg',
  },
  {
    title: 'Leaders Eat Last',
    author: 'Simon Sinek',
    isbn: '9781591845324',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781591845324-L.jpg',
  },
  {
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    isbn: '9780553383713',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780553383713-L.jpg',
  },
  {
    title: 'Dare to Lead',
    author: 'Brené Brown',
    isbn: '9780399592522',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780399592522-L.jpg',
  },
  {
    title: 'Everything Is Figureoutable',
    author: 'Marie Forleo',
    isbn: '9780525534990',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780525534990-L.jpg',
  },
];
