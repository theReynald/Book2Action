import axios from 'axios';
import { Book, BookSearchResult } from '../types/Book';

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4.1';

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

const generateBookAnalysis = async (bookTitle: string): Promise<Book | null> => {
    console.log(`🔍 Starting AI analysis for: "${bookTitle}"`);
    console.log('📡 API Configuration:');
    console.log('- URL:', OPENROUTER_API_URL);
    console.log('- Model:', MODEL);
    console.log('- API Key available:', OPENROUTER_API_KEY ? 'Yes' : 'No');

    // Check if API key is available
    if (!OPENROUTER_API_KEY) {
        console.error('❌ OpenRouter API key not found. Please set REACT_APP_OPENROUTER_API_KEY in your .env file');
        return null;
    }

    try {
        const prompt = `Analyze the book "${bookTitle}" and provide a comprehensive response in the following JSON format:

{
  "title": "Exact book title",
  "author": "Author name",
  "publishedYear": year_as_number,
  "genre": "Primary genre",
  "isbn": "The book's ISBN-13 number (13 digits, no hyphens)",
  "summary": "A comprehensive 2-3 sentence summary of the book's main concepts and value proposition",
  "actionableSteps": [
    {
      "day": "Monday",
      "step": "Specific actionable step that readers can implement",
      "chapter": "Chapter or section where this concept is primarily discussed"
    }
    // Provide exactly 7 actionable steps, one for each day of the week (Monday through Sunday)
  ]
}

Requirements:
- If the book doesn't exist or you're not familiar with it, return null
- The summary should be concise but comprehensive
- Each actionable step should be practical and implementable
- Assign each step to a specific day of the week (Monday through Sunday)
- Structure the steps as a 7-day action plan, with logical progression from Monday to Sunday
- Chapter references should be specific (e.g., "Chapter 3: The Power of Habit" or "Part 2: The Four Laws")
- Focus on the most impactful and actionable insights from the book
- Include the correct ISBN-13 number for accurate book identification
- If ISBN is unknown, leave it as empty string

Please analyze: "${bookTitle}"`;

        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content received from API');
        }

        // Try to parse the JSON response
        try {
            const bookData = JSON.parse(content);

            // Validate the response structure
            if (!bookData || typeof bookData !== 'object') {
                throw new Error('Invalid response format');
            }

            // Ensure we have the required fields
            if (!bookData.title || !bookData.author || !bookData.summary || !Array.isArray(bookData.actionableSteps)) {
                throw new Error('Missing required fields in response');
            }

            // Validate actionable steps format
            if (bookData.actionableSteps.length !== 7) {
                throw new Error('Expected exactly 7 actionable steps (one for each day of the week)');
            }

            for (const step of bookData.actionableSteps) {
                if (!step.step || !step.chapter || !step.day) {
                    throw new Error('Invalid actionable step format: missing step, chapter, or day');
                }
            }

            // Add cover image URL based on ISBN or title
            const bookWithCover = {
                ...bookData,
                coverImageUrl: generateCoverImageUrl(bookData.isbn, bookData.title)
            };

            return bookWithCover as Book;
        } catch (parseError) {
            console.error('Failed to parse API response:', parseError);
            console.error('Raw content:', content);

            // If JSON parsing fails, try to extract information manually
            return null;
        }
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);

        // Log more specific error details
        if (axios.isAxiosError(error)) {
            console.error('API Error Details:');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request Headers:', error.config?.headers);
        }

        return null;
    }
};

// Fallback data for when API fails or for popular books
const fallbackBooks: { [key: string]: Book } = {
    'atomic habits': {
        title: 'Atomic Habits',
        author: 'James Clear',
        publishedYear: 2018,
        genre: 'Self-Help',
        isbn: '9780735211292',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        summary: 'Atomic Habits is a comprehensive guide to building good habits and breaking bad ones. James Clear presents a proven system for improving every day through tiny changes that compound over time. The book emphasizes that small, consistent improvements lead to remarkable results, and provides practical strategies for habit formation based on the four laws of behavior change.',
        actionableSteps: [
            { day: 'Monday', step: 'Start with habits so small they seem almost ridiculous (2-minute rule)', chapter: 'Chapter 11: Walk Slowly, but Never Backward' },
            { day: 'Tuesday', step: 'Stack new habits onto existing ones using habit stacking', chapter: 'Chapter 5: The Best Way to Start a New Habit' },
            { day: 'Wednesday', step: 'Design your environment to make good habits obvious and bad habits invisible', chapter: 'Chapter 6: Motivation Is Overrated; Environment Often Matters More' },
            { day: 'Thursday', step: 'Track your habits daily using a simple habit tracker', chapter: 'Chapter 16: How to Stick with Good Habits Every Day' },
            { day: 'Friday', step: 'Focus on identity-based habits: "I am the type of person who..."', chapter: 'Chapter 2: How Your Habits Shape Your Identity' },
            { day: 'Saturday', step: 'Use the two-day rule: never miss twice in a row', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' },
            { day: 'Sunday', step: 'Celebrate small wins immediately after completing a habit', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' }
        ]
    },
    'think and grow rich': {
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        publishedYear: 1937,
        genre: 'Personal Finance',
        isbn: '9781585424337',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
        summary: 'Think and Grow Rich is a classic personal development book based on Hill\'s study of successful individuals. The book outlines 13 principles for achieving wealth and success, emphasizing the power of thought, desire, and persistence. Hill argues that success begins with a burning desire and a definite plan, supported by unwavering faith and persistence.',
        actionableSteps: [
            { day: 'Monday', step: 'Define your definite major purpose with specific financial goals', chapter: 'Chapter 2: Desire' },
            { day: 'Tuesday', step: 'Develop burning desire by writing down exactly what you want', chapter: 'Chapter 2: Desire' },
            { day: 'Wednesday', step: 'Build unwavering faith through auto-suggestion and visualization', chapter: 'Chapter 3: Faith' },
            { day: 'Thursday', step: 'Acquire specialized knowledge in your chosen field', chapter: 'Chapter 5: Specialized Knowledge' },
            { day: 'Friday', step: 'Use your imagination to create detailed plans for achieving your goals', chapter: 'Chapter 6: Imagination' },
            { day: 'Saturday', step: 'Make quick, firm decisions and stick to them', chapter: 'Chapter 8: Decision' },
            { day: 'Sunday', step: 'Develop persistence by never giving up on your major purpose', chapter: 'Chapter 9: Persistence' }
        ]
    },
    'the 7 habits of highly effective people': {
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        publishedYear: 1989,
        genre: 'Self-Help',
        isbn: '9781982137274',
        coverImageUrl: 'https://books.google.com/books/content?id=ISBN:9781982137274&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        summary: 'Covey presents a principle-centered approach to personal and professional effectiveness. The book introduces seven habits that move individuals from dependence to independence to interdependence. These habits are based on universal principles and focus on character development rather than quick-fix techniques.',
        actionableSteps: [
            { day: 'Monday', step: 'Be proactive: Focus on what you can control and take responsibility', chapter: 'Habit 1: Be Proactive' },
            { day: 'Tuesday', step: 'Begin with the end in mind: Define your personal mission statement', chapter: 'Habit 2: Begin with the End in Mind' },
            { day: 'Wednesday', step: 'Put first things first: Prioritize important over urgent tasks', chapter: 'Habit 3: Put First Things First' },
            { day: 'Thursday', step: 'Think win-win: Seek mutual benefit in all interactions', chapter: 'Habit 4: Think Win-Win' },
            { day: 'Friday', step: 'Seek first to understand, then to be understood: Practice empathetic listening', chapter: 'Habit 5: Seek First to Understand, Then to Be Understood' },
            { day: 'Saturday', step: 'Synergize: Value differences and work collaboratively', chapter: 'Habit 6: Synergize' },
            { day: 'Sunday', step: 'Sharpen the saw: Continuously improve in all four dimensions of life', chapter: 'Habit 7: Sharpen the Saw' }
        ]
    }
};

export const searchBook = async (title: string): Promise<BookSearchResult> => {
    const normalizedTitle = title.toLowerCase().trim();

    // Test API connection on first real search
    if (!normalizedTitle.toLowerCase().includes('7 habits')) {
        console.log('Testing API connection before search...');
        await testAPIConnection();
    }

    try {
        // First check if we have fallback data for popular books
        if (fallbackBooks[normalizedTitle]) {
            return {
                success: true,
                book: fallbackBooks[normalizedTitle]
            };
        }

        // Check for partial matches in fallback data
        const partialMatch = Object.keys(fallbackBooks).find(key =>
            key.includes(normalizedTitle) || normalizedTitle.includes(key)
        );

        if (partialMatch) {
            return {
                success: true,
                book: fallbackBooks[partialMatch]
            };
        }

        // If not in fallback data, use AI to generate analysis
        console.log(`🤖 Generating AI analysis for: ${title}`);
        console.log('📊 Starting OpenRouter API call...');
        const aiGeneratedBook = await generateBookAnalysis(title);

        if (aiGeneratedBook) {
            return {
                success: true,
                book: aiGeneratedBook
            };
        }

        // If AI fails, return error
        return {
            success: false,
            error: `Sorry, we couldn't find or analyze "${title}". Please try a different book title or check the spelling.`
        };

    } catch (error) {
        console.error('Error in searchBook:', error);
        return {
            success: false,
            error: 'An error occurred while searching for the book. Please try again.'
        };
    }
};

// Test function to verify API connectivity
const testAPIConnection = async (): Promise<boolean> => {
    try {
        console.log('Testing OpenRouter API connection...');
        console.log('API Key (first 20 chars):', OPENROUTER_API_KEY.substring(0, 20) + '...');
        console.log('API URL:', OPENROUTER_API_URL);
        console.log('Model:', MODEL);

        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message. Please respond with just "API working".'
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('API Test Response:', response.data);
        return true;
    } catch (error) {
        console.error('API Test Failed:', error);
        if (axios.isAxiosError(error)) {
            console.error('Test Error Details:');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
        }
        return false;
    }
};

// Helper function to generate cover image URL from ISBN
const generateCoverImageUrl = (isbn?: string, title?: string): string => {
    if (isbn && isbn.length >= 10) {
        // Use ISBN for better accuracy - always prefer ISBN search
        // ISBN is more reliable and specific than title search
        return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    } else if (title) {
        // Fallback to title-based search if no ISBN available
        const encodedTitle = encodeURIComponent(title);
        return `https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`;
    }
    return '';
};
