import { Book, BookSearchResult } from '../types/Book';

// Mock data for demonstration - in a real app, this would connect to an API
const mockBooks: { [key: string]: Book } = {
    'atomic habits': {
        title: 'Atomic Habits',
        author: 'James Clear',
        publishedYear: 2018,
        genre: 'Self-Help',
        summary: 'Atomic Habits is a comprehensive guide to building good habits and breaking bad ones. James Clear presents a proven system for improving every day through tiny changes that compound over time. The book emphasizes that small, consistent improvements lead to remarkable results, and provides practical strategies for habit formation based on the four laws of behavior change.',
        actionableSteps: [
            'Start with habits so small they seem almost ridiculous (2-minute rule)',
            'Stack new habits onto existing ones using habit stacking',
            'Design your environment to make good habits obvious and bad habits invisible',
            'Track your habits daily using a simple habit tracker',
            'Focus on identity-based habits: "I am the type of person who..."',
            'Use the two-day rule: never miss twice in a row',
            'Celebrate small wins immediately after completing a habit',
            'Make bad habits difficult by increasing friction',
            'Find an accountability partner or join a community',
            'Review and adjust your habits monthly based on what\'s working'
        ]
    },
    'think and grow rich': {
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        publishedYear: 1937,
        genre: 'Personal Finance',
        summary: 'Think and Grow Rich is a classic personal development book based on Hill\'s study of successful individuals. The book outlines 13 principles for achieving wealth and success, emphasizing the power of thought, desire, and persistence. Hill argues that success begins with a burning desire and a definite plan, supported by unwavering faith and persistence.',
        actionableSteps: [
            'Define your definite major purpose with specific financial goals',
            'Develop burning desire by writing down exactly what you want',
            'Build unwavering faith through auto-suggestion and visualization',
            'Acquire specialized knowledge in your chosen field',
            'Use your imagination to create detailed plans for achieving your goals',
            'Make quick, firm decisions and stick to them',
            'Develop persistence by never giving up on your major purpose',
            'Surround yourself with a mastermind group of like-minded individuals',
            'Transform your sexual energy into creative and productive outlets',
            'Listen to your subconscious mind and act on hunches and inspirations'
        ]
    },
    'the 7 habits of highly effective people': {
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        publishedYear: 1989,
        genre: 'Self-Help',
        summary: 'Covey presents a principle-centered approach to personal and professional effectiveness. The book introduces seven habits that move individuals from dependence to independence to interdependence. These habits are based on universal principles and focus on character development rather than quick-fix techniques.',
        actionableSteps: [
            'Be proactive: Focus on what you can control and take responsibility',
            'Begin with the end in mind: Define your personal mission statement',
            'Put first things first: Prioritize important over urgent tasks',
            'Think win-win: Seek mutual benefit in all interactions',
            'Seek first to understand, then to be understood: Practice empathetic listening',
            'Synergize: Value differences and work collaboratively',
            'Sharpen the saw: Continuously improve in all four dimensions of life',
            'Practice daily self-reflection and planning',
            'Create weekly and monthly reviews of your progress',
            'Align your actions with your values and principles'
        ]
    }
};

export const searchBook = async (title: string): Promise<BookSearchResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const normalizedTitle = title.toLowerCase().trim();

    // Check for exact matches first
    if (mockBooks[normalizedTitle]) {
        return {
            success: true,
            book: mockBooks[normalizedTitle]
        };
    }

    // Check for partial matches
    const partialMatch = Object.keys(mockBooks).find(key =>
        key.includes(normalizedTitle) || normalizedTitle.includes(key)
    );

    if (partialMatch) {
        return {
            success: true,
            book: mockBooks[partialMatch]
        };
    }

    // If no match found, return a generic error
    return {
        success: false,
        error: `Sorry, we couldn't find "${title}" in our database. Please try another book title.`
    };
};

// In a real application, you might integrate with:
// - Google Books API
// - OpenLibrary API
// - Custom book database
// - AI service for generating summaries and actionable steps
