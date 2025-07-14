// List of inappropriate words to filter out
export const inappropriateWords = ['f*ck', 'fuck', 'shit', 'damn', 'ass', 'bitch', 'crap'];

// Function to check if a book title contains inappropriate language
export const isAppropriateTitle = (title: string): boolean => {
    const lowercaseTitle = title.toLowerCase();
    return !inappropriateWords.some(word => lowercaseTitle.includes(word));
};
