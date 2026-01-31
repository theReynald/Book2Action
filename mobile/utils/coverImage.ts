/**
 * Generate a cover image URL from ISBN or title
 */
export const generateCoverImageUrl = (isbn?: string, title?: string): string => {
  if (isbn && isbn.length >= 10) {
    // Use ISBN for better accuracy
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  } else if (title) {
    // Fallback to title-based search if no ISBN available
    const encodedTitle = encodeURIComponent(title);
    return `https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`;
  }
  return '';
};

/**
 * Get fallback cover URLs for when primary source fails
 */
export const getCoverFallbacks = (isbn?: string, title?: string): string[] => {
  const fallbacks: string[] = [];
  
  if (isbn) {
    // Primary: OpenLibrary ISBN
    fallbacks.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    // Fallback 1: Google Books
    fallbacks.push(`https://books.google.com/books/content?id=ISBN:${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`);
  }
  
  if (title) {
    // Fallback 2: OpenLibrary title
    const encodedTitle = encodeURIComponent(title);
    fallbacks.push(`https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`);
  }
  
  return fallbacks;
};
