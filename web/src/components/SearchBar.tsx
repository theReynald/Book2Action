import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  searchOpenLibrary,
  OpenLibraryBook,
} from "../services/openLibraryService";

interface SearchBarProps {
  onSearch: (title: string, coverImageUrl?: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  setInputRef?: (ref: HTMLInputElement | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  isDarkMode,
  setInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<OpenLibraryBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (setInputRef && inputRef.current) {
      setInputRef(inputRef.current);
    }
  }, [setInputRef]);

  const bookPlaceholders = [
    "Search by title or author...",
    "Try 'Atomic Habits' by James Clear",
    "Try 'Think and Grow Rich' by Napoleon Hill",
    "Try 'The 7 Habits of Highly Effective People'",
    "Try author: Malcolm Gladwell",
    "Try 'The 4-Hour Workweek' by Tim Ferriss",
    "Try 'Rich Dad Poor Dad' by Robert Kiyosaki",
    "Try author: Brené Brown",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) =>
        prev === bookPlaceholders.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    debounceRef.current = setTimeout(async () => {
      const results = await searchOpenLibrary(value);
      setSuggestions(results);
      setIsSearching(false);
    }, 500);
  }, []);

  const handleSelect = (book: OpenLibraryBook) => {
    setSearchTerm(book.title);
    setSuggestions([]);
    setShowDropdown(false);
    onSearch(book.title, book.coverImageUrl || undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !isLoading) {
      setShowDropdown(false);
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 animate-slide-up relative z-30">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-effect rounded-2xl p-6 shadow-2xl">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              placeholder={bookPlaceholders[placeholderIndex]}
              className={`w-full pl-12 pr-32 py-4 text-lg rounded-xl border-2 border-transparent focus:outline-none transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-800 bg-opacity-90 text-white placeholder-gray-500 focus:border-blue-500"
                  : "bg-white bg-opacity-90 text-gray-800 placeholder-gray-400 focus:border-blue-600"
              }`}
              disabled={isLoading}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              aria-controls="book-suggestions"
              aria-label="Search for a book"
            />
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <button
              type="submit"
              disabled={!searchTerm.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 button-gradient text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:brightness-110 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Get Insights</span>
              )}
            </button>
          </div>
        </div>

        {/* Typeahead dropdown - outside glass-effect to avoid clipping */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 left-6 right-6 mt-1 rounded-xl shadow-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
            role="listbox"
            id="book-suggestions"
            aria-label="Book suggestions"
          >
            {isSearching && suggestions.length === 0 && (
              <div
                className={`px-4 py-3 text-sm flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            )}
            {!isSearching && suggestions.length === 0 && searchTerm.trim() && (
              <div
                className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                No books found. Press Enter to search with AI.
              </div>
            )}
            {suggestions.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => handleSelect(book)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-white"
                    : "hover:bg-blue-50 text-gray-900"
                }`}
                role="option"
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt=""
                    className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">📚</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{book.title}</div>
                  <div
                    className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {book.author}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="mt-4 text-center">
        <p
          className={`text-opacity-70 text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}
        >
          {isLoading
            ? ""
            : "Try any book title - AI will analyze it and create actionable steps!"}
        </p>
      </div>
    </div>
  );
};

export default SearchBar;
