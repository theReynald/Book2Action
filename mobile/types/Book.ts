export interface DetailedStepInfo {
  sentences: string[];
  keyTakeaway: string;
}

export interface ActionableStep {
  step: string;
  chapter: string;
  day?: string;
  details?: DetailedStepInfo;
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
  rawContent?: string;
  parseError?: string;
}
