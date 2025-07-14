export interface ActionableStep {
    step: string;
    chapter: string;
    day?: string;
}

export interface Book {
    title: string;
    author: string;
    summary: string;
    actionableSteps: ActionableStep[];
    coverImageUrl?: string;
    publishedYear?: number;
    genre?: string;
    isbn?: string;
}

export interface BookSearchResult {
    success: boolean;
    book?: Book;
    error?: string;
}
