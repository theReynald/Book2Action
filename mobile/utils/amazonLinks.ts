/**
 * Generate an Amazon search link for a book
 */
export const generateAmazonLink = (
  title: string,
  author: string,
  isbn?: string
): string => {
  if (isbn) {
    // If we have an ISBN, use it for a precise search
    return `https://www.amazon.com/s?k=${encodeURIComponent(isbn)}`;
  } else {
    // Otherwise, search for title and author
    return `https://www.amazon.com/s?k=${encodeURIComponent(`${title} ${author} book`)}`;
  }
};
