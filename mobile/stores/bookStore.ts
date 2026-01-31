import { create } from 'zustand';
import { Book } from '../types/Book';

interface BookState {
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  searchTitle: string;
  setCurrentBook: (book: Book | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTitle: (title: string) => void;
  reset: () => void;
}

export const useBookStore = create<BookState>((set) => ({
  currentBook: null,
  isLoading: false,
  error: null,
  searchTitle: '',
  
  setCurrentBook: (book) => set({ currentBook: book, error: null }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, currentBook: null }),
  setSearchTitle: (title) => set({ searchTitle: title }),
  reset: () => set({ currentBook: null, isLoading: false, error: null, searchTitle: '' }),
}));
