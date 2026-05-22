const OPEN_LIBRARY_API = "https://openlibrary.org/search.json";

export interface OpenLibraryBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
}

export async function searchOpenLibrary(
  query: string,
): Promise<OpenLibraryBook[]> {
  if (!query.trim()) return [];

  const authorMatch = query.match(/^author:\s*(.+)$/i);
  const searchParam = authorMatch
    ? `author=${encodeURIComponent(authorMatch[1].trim())}`
    : `q=${encodeURIComponent(query)}`;

  const url = `${OPEN_LIBRARY_API}?${searchParam}&limit=8&fields=key,title,author_name,cover_i`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.docs || data.docs.length === 0) return [];

    return data.docs.map((doc: any) => ({
      id: doc.key,
      title: doc.title || "Untitled",
      author: (doc.author_name || []).join(", ") || "Unknown Author",
      coverImageUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
    }));
  } catch {
    return [];
  }
}
