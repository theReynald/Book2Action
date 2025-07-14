export interface Book {
    title: string;
    author: string;
    summary: string;
    actionableSteps: string[];
    publishedYear?: number;
    genre?: string;
    isbn?: string;
}

export interface BookSearchResult {
    success: boolean;
    book?: Book;
    error?: string;
}
