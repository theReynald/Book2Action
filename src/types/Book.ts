export interface ActionableStep {
    step: string;
    chapter: string;
}

export interface Book {
    title: string;
    author: string;
    summary: string;
    actionableSteps: ActionableStep[];
    publishedYear?: number;
    genre?: string;
    isbn?: string;
}

export interface BookSearchResult {
    success: boolean;
    book?: Book;
    error?: string;
}
