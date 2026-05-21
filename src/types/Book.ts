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

export interface BookCandidate {
  title: string;
  author: string;
  publishedYear?: number;
  genre?: string;
  isbn?: string;
  coverImageUrl?: string;
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

export interface BookCandidatesResult {
  success: boolean;
  candidates?: BookCandidate[];
  error?: string;
}
