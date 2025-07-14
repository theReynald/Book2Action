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
            { step: 'Start with habits so small they seem almost ridiculous (2-minute rule)', chapter: 'Chapter 11: Walk Slowly, but Never Backward' },
            { step: 'Stack new habits onto existing ones using habit stacking', chapter: 'Chapter 5: The Best Way to Start a New Habit' },
            { step: 'Design your environment to make good habits obvious and bad habits invisible', chapter: 'Chapter 6: Motivation Is Overrated; Environment Often Matters More' },
            { step: 'Track your habits daily using a simple habit tracker', chapter: 'Chapter 16: How to Stick with Good Habits Every Day' },
            { step: 'Focus on identity-based habits: "I am the type of person who..."', chapter: 'Chapter 2: How Your Habits Shape Your Identity' },
            { step: 'Use the two-day rule: never miss twice in a row', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' },
            { step: 'Celebrate small wins immediately after completing a habit', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' },
            { step: 'Make bad habits difficult by increasing friction', chapter: 'Chapter 12: The Law of Least Effort' },
            { step: 'Find an accountability partner or join a community', chapter: 'Chapter 17: How an Accountability Partner Can Change Everything' },
            { step: 'Review and adjust your habits monthly based on what\'s working', chapter: 'Chapter 20: The Downside of Creating Good Habits' }
        ]
    },
    'think and grow rich': {
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        publishedYear: 1937,
        genre: 'Personal Finance',
        summary: 'Think and Grow Rich is a classic personal development book based on Hill\'s study of successful individuals. The book outlines 13 principles for achieving wealth and success, emphasizing the power of thought, desire, and persistence. Hill argues that success begins with a burning desire and a definite plan, supported by unwavering faith and persistence.',
        actionableSteps: [
            { step: 'Define your definite major purpose with specific financial goals', chapter: 'Chapter 2: Desire' },
            { step: 'Develop burning desire by writing down exactly what you want', chapter: 'Chapter 2: Desire' },
            { step: 'Build unwavering faith through auto-suggestion and visualization', chapter: 'Chapter 3: Faith' },
            { step: 'Acquire specialized knowledge in your chosen field', chapter: 'Chapter 5: Specialized Knowledge' },
            { step: 'Use your imagination to create detailed plans for achieving your goals', chapter: 'Chapter 6: Imagination' },
            { step: 'Make quick, firm decisions and stick to them', chapter: 'Chapter 8: Decision' },
            { step: 'Develop persistence by never giving up on your major purpose', chapter: 'Chapter 9: Persistence' },
            { step: 'Surround yourself with a mastermind group of like-minded individuals', chapter: 'Chapter 10: Power of the Master Mind' },
            { step: 'Transform your sexual energy into creative and productive outlets', chapter: 'Chapter 11: The Mystery of Sex Transmutation' },
            { step: 'Listen to your subconscious mind and act on hunches and inspirations', chapter: 'Chapter 12: The Subconscious Mind' }
        ]
    },
    'the 7 habits of highly effective people': {
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        publishedYear: 1989,
        genre: 'Self-Help',
        summary: 'Covey presents a principle-centered approach to personal and professional effectiveness. The book introduces seven habits that move individuals from dependence to independence to interdependence. These habits are based on universal principles and focus on character development rather than quick-fix techniques.',
        actionableSteps: [
            { step: 'Be proactive: Focus on what you can control and take responsibility', chapter: 'Habit 1: Be Proactive' },
            { step: 'Begin with the end in mind: Define your personal mission statement', chapter: 'Habit 2: Begin with the End in Mind' },
            { step: 'Put first things first: Prioritize important over urgent tasks', chapter: 'Habit 3: Put First Things First' },
            { step: 'Think win-win: Seek mutual benefit in all interactions', chapter: 'Habit 4: Think Win-Win' },
            { step: 'Seek first to understand, then to be understood: Practice empathetic listening', chapter: 'Habit 5: Seek First to Understand, Then to Be Understood' },
            { step: 'Synergize: Value differences and work collaboratively', chapter: 'Habit 6: Synergize' },
            { step: 'Sharpen the saw: Continuously improve in all four dimensions of life', chapter: 'Habit 7: Sharpen the Saw' },
            { step: 'Practice daily self-reflection and planning', chapter: 'Part 4: Renewal' },
            { step: 'Create weekly and monthly reviews of your progress', chapter: 'Habit 3: Put First Things First' },
            { step: 'Align your actions with your values and principles', chapter: 'Part 1: Paradigms and Principles' }
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
